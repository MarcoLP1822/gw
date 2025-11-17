import { prisma } from '@/lib/db';
import { openai, DEFAULT_MODEL, logAPICall } from '@/lib/ai/openai-client';
import { callGPT5JSON, getReasoningEffortForTask, getVerbosityForOutput, ReasoningEffort, Verbosity } from '@/lib/ai/responses-api';
import { randomUUID } from 'crypto';
import {
    generateChapterPrompt,
    generateStyleGuidePrompt,
    CHAPTER_SYSTEM_PROMPT,
} from '@/lib/ai/prompts/chapter-generator';
import {
    generateQuickCheckPrompt,
    generateFinalCheckPrompt,
} from '@/lib/ai/prompts/consistency-checker';
import {
    ChapterContext,
    GeneratedChapter,
    StyleGuide,
    MasterContext,
    QuickCheckResult,
    ConsistencyReport,
} from '@/types';
import { AIConfigService } from '@/lib/ai/config/ai-config-service';
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { ApiErrors, parseOpenAIError } from '@/lib/errors/api-errors';
import { StyleGuideService } from '@/lib/services/style-guide-service';

/**
 * Service per la generazione dei capitoli con AI
 */
export class ChapterGenerationService {
    /**
     * Helper per determinare se un modello è GPT-5
     */
    private isGPT5Model(model: string): boolean {
        return model.includes('gpt-5');
    }

    /**
     * Genera un singolo capitolo
     */
    async generateChapter(projectId: string, chapterNumber: number): Promise<any> {
        const startTime = Date.now();

        try {
            // 1. VALIDA prerequisiti
            await this.validatePrerequisites(projectId, chapterNumber);

            // 2. CARICA context completo
            const context = await this.buildContext(projectId, chapterNumber);

            // 🔧 CARICA LA CONFIGURAZIONE AI per avere il modello corretto
            const aiConfig = await AIConfigService.getOrCreate(projectId);
            const modelUsed = aiConfig.model || DEFAULT_MODEL;

            // 3. GENERA il capitolo con AI
            const result = await this.generateWithAI(projectId, context, chapterNumber);

            // 4. MINI CONSISTENCY CHECK (se c'è un capitolo precedente)
            if (context.chapters.previous) {
                const quickCheck = await this.quickValidation(
                    result.content,
                    context.chapters.previous,
                    chapterNumber,
                    modelUsed
                );

                // Se ci sono issue critici, rigenera
                if (quickCheck.hasCriticalIssues) {
                    console.log(
                        `⚠️ Critical issues found in chapter ${chapterNumber}, regenerating...`
                    );
                    const fixedResult = await this.regenerateWithFix(
                        projectId,
                        context,
                        chapterNumber,
                        result,
                        quickCheck
                    );
                    result.content = fixedResult.content;
                }
            }

            // 5. SALVA nel database
            const chapter = await this.saveChapter(projectId, chapterNumber, result, context, modelUsed);

            // 6. AGGIORNA master context
            await this.updateMasterContext(projectId, result.metadata);

            // 7. SE è Cap 2, GENERA/AFFINA style guide
            if (chapterNumber === 2) {
                await this.refineStyleGuide(projectId);
            }

            // 8. AGGIORNA status del progetto
            await this.updateProjectStatus(projectId);

            // 9. LOG della generazione
            const duration = Date.now() - startTime;
            await this.logGeneration(projectId, chapterNumber, result, duration, true, modelUsed);

            return chapter;
        } catch (error) {
            const duration = Date.now() - startTime;
            // Recupera il modello anche in caso di errore
            try {
                const aiConfig = await AIConfigService.getOrCreate(projectId);
                const modelUsed = aiConfig.model || DEFAULT_MODEL;
                await this.logGeneration(projectId, chapterNumber, null, duration, false, modelUsed, error);
            } catch {
                // Fallback se non riusciamo a recuperare il modello
                await this.logGeneration(projectId, chapterNumber, null, duration, false, DEFAULT_MODEL, error);
            }
            throw error;
        }
    }

    /**
     * Verifica che si possa generare questo capitolo
     */
    private async validatePrerequisites(projectId: string, chapterNumber: number) {
        // Verifica che il progetto esista
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { Outline: true },
        });

        if (!project) {
            throw ApiErrors.notFound('Progetto', projectId);
        }

        if (!project.Outline) {
            throw ApiErrors.prerequisiteNotMet(
                "Genera prima l'outline del libro",
                { projectId, chapterNumber }
            );
        }

        // Cap 1: Solo outline necessario
        if (chapterNumber === 1) {
            return;
        }

        // Cap N: Serve Cap N-1 completato
        const previousChapter = await prisma.chapter.findUnique({
            where: {
                projectId_chapterNumber: {
                    projectId,
                    chapterNumber: chapterNumber - 1,
                },
            },
        });

        if (!previousChapter || previousChapter.status !== 'completed') {
            throw ApiErrors.prerequisiteNotMet(
                `Completa prima il Capitolo ${chapterNumber - 1}`,
                { projectId, chapterNumber, previousChapter: chapterNumber - 1 }
            );
        }
    }

    /**
     * Costruisce il context completo per la generazione
     */
    private async buildContext(
        projectId: string,
        chapterNumber: number
    ): Promise<ChapterContext> {
        // Carica progetto e outline
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { Outline: true },
        });

        if (!project || !project.Outline) {
            throw ApiErrors.notFound('Progetto o outline', projectId);
        }

        // Carica AI config per ottenere targetWordsPerChapter
        const aiConfig = await AIConfigService.getOrCreate(projectId);

        // Carica style guide (Priority: custom text > generated text > old JSON format)
        const activeStyleGuideText = await StyleGuideService.getActiveStyleGuide(projectId);
        let styleGuide: StyleGuide | string | null = null;

        if (activeStyleGuideText) {
            // Nuovo formato: testo libero
            styleGuide = activeStyleGuideText;
        } else if (project.styleGuide) {
            // Vecchio formato: JSON strutturato (backward compatibility)
            styleGuide = project.styleGuide as unknown as StyleGuide;
        }

        // Carica master context
        const masterContext = (project.masterContext as unknown as MasterContext) || {
            characters: [],
            terms: {},
            numbers: {},
            themes: {},
        };

        // Carica capitoli precedenti
        let previousChapter: string | null = null;
        let beforePrevious: string | null = null;
        let firstChapter: string | null = null;

        if (chapterNumber > 1) {
            const prevChap = await prisma.chapter.findUnique({
                where: {
                    projectId_chapterNumber: {
                        projectId,
                        chapterNumber: chapterNumber - 1,
                    },
                },
            });
            previousChapter = prevChap?.content || null;
        }

        if (chapterNumber > 2) {
            const beforePrevChap = await prisma.chapter.findUnique({
                where: {
                    projectId_chapterNumber: {
                        projectId,
                        chapterNumber: chapterNumber - 2,
                    },
                },
            });
            beforePrevious = beforePrevChap?.summary || beforePrevChap?.content || null;
        }

        if (chapterNumber > 1) {
            const firstChap = await prisma.chapter.findUnique({
                where: {
                    projectId_chapterNumber: { projectId, chapterNumber: 1 },
                },
            });
            if (firstChap && firstChap.keyPoints.length > 0) {
                firstChapter = `Key Points:\n${firstChap.keyPoints.map((p) => `- ${p}`).join('\n')}`;
            }
        }

        // Estrai info capitolo corrente dall'outline
        const outlineStructure = project.Outline.structure as any;
        const currentChapterInfo = outlineStructure.chapters[chapterNumber - 1];

        return {
            project: {
                authorName: project.authorName,
                authorRole: project.authorRole,
                company: project.company,
                industry: project.industry,
                bookTitle: project.bookTitle,
                bookSubtitle: project.bookSubtitle || undefined,
                targetReaders: project.targetReaders,
                currentSituation: project.currentSituation,
                challengeFaced: project.challengeFaced,
                transformation: project.transformation,
                achievement: project.achievement,
                lessonLearned: project.lessonLearned,
                businessGoals: project.businessGoals,
                uniqueValue: project.uniqueValue,
                estimatedPages: project.estimatedPages || undefined,
                additionalNotes: project.additionalNotes || undefined,
                targetAudience: project.targetReaders, // alias
            },
            aiConfig: {
                targetWordsPerChapter: aiConfig.targetWordsPerChapter,
            },
            outline: outlineStructure,
            styleGuide,
            masterContext,
            chapters: {
                previous: previousChapter,
                beforePrevious,
                first: firstChapter,
            },
            currentChapterInfo,
        };
    }

    /**
     * Genera capitolo con AI
     */
    private async generateWithAI(projectId: string, context: ChapterContext, chapterNumber: number) {
        // 🎯 CARICA LA CONFIGURAZIONE AI DEL PROGETTO
        const aiConfig = await AIConfigService.getOrCreate(projectId);

        // 🎨 USA IL PROMPT BUILDER per costruire prompts intelligenti
        const { systemPrompt, userPrompt: chapterInstructions } =
            PromptBuilder.buildCompleteChapterPrompt(context.project, aiConfig, context);

        // Costruisci il prompt completo con il context
        // Per GPT-5 Responses API, combiniamo system e user prompt in un unico input
        const fullPrompt = `${systemPrompt}

---

${chapterInstructions}

${generateChapterPrompt(context)}
`;

        console.log(`🤖 Generating chapter ${chapterNumber} with GPT-5...`);
        console.log('\n' + '='.repeat(80));
        console.log('📝 FULL PROMPT FOR GPT-5:');
        console.log('='.repeat(80));
        console.log(fullPrompt.substring(0, 1000) + '...');
        console.log('='.repeat(80) + '\n');

        // 🔧 USA I PARAMETRI AI DALLA CONFIGURAZIONE
        const modelToUse = aiConfig.model as any || DEFAULT_MODEL;

        // 📊 LOG: Quale modello stiamo usando
        console.log(`\n🎯 USING AI MODEL: ${modelToUse}`);
        console.log(`   Reasoning Effort: ${aiConfig.reasoningEffort || 'low'}`);
        console.log(`   Verbosity: ${aiConfig.verbosity || 'medium'}`);
        console.log(`   Max Output Tokens: ${aiConfig.maxTokens}\n`);

        logAPICall(`Generate Chapter ${chapterNumber}`, modelToUse);

        try {
            // GPT-5 usa la Responses API
            if (this.isGPT5Model(modelToUse)) {
                console.log('🎯 Using GPT-5 Responses API');

                const response = await callGPT5JSON<{
                    chapter: string;
                    metadata: { newCharacters: string[]; newTerms: Record<string, string>; keyNumbers: Record<string, string> };
                    summary: string;
                    keyPoints: string[];
                }>(fullPrompt, {
                    model: modelToUse,
                    reasoningEffort: (aiConfig.reasoningEffort as ReasoningEffort) || 'low',
                    verbosity: (aiConfig.verbosity as Verbosity) || 'high', // Capitoli richiedono alta verbosità
                    maxOutputTokens: aiConfig.maxTokens || 20000, // Aumentato per capitoli completi
                });

                console.log('✅ GPT-5 Response received');
                console.log('🐛 DEBUG: Response keys:', Object.keys(response));
                console.log('🐛 DEBUG: Content length:', (response.chapter || '').length);

                return {
                    content: response.chapter || '',
                    metadata: response.metadata || { newCharacters: [], newTerms: {}, keyNumbers: {} },
                    summary: response.summary || '',
                    keyPoints: response.keyPoints || [],
                    usage: undefined, // GPT-5 Responses API ha usage diverso
                    systemPrompt: systemPrompt,
                    userPrompt: fullPrompt,
                };
            } else {
                // Fallback per modelli non-GPT-5 (se necessario)
                throw new Error(`Model ${modelToUse} is not supported. Please use GPT-5 family models.`);
            }
        } catch (error) {
            // Gestisce errori specifici di OpenAI
            throw parseOpenAIError(error);
        }
    }

    /**
     * Quick consistency check
     */
    private async quickValidation(
        newChapter: string,
        previousChapter: string,
        chapterNumber: number,
        model: string = DEFAULT_MODEL
    ): Promise<QuickCheckResult> {
        const prompt = generateQuickCheckPrompt(newChapter, previousChapter, chapterNumber);

        logAPICall(`Quick Validation Chapter ${chapterNumber}`, model);

        // Use GPT-5 Responses API with minimal reasoning for quick checks
        const result = await callGPT5JSON<QuickCheckResult>(prompt, {
            model,
            reasoningEffort: 'minimal', // Quick validation doesn't need deep reasoning
            verbosity: 'low', // Concise feedback
            maxOutputTokens: 500,
        });

        console.log(`✅ Quick validation completed`);

        return result;
    }

    /**
     * Rigenera con correzioni
     */
    private async regenerateWithFix(
        projectId: string,
        context: ChapterContext,
        chapterNumber: number,
        previousAttempt: any,
        issues: QuickCheckResult
    ) {
        const fixPrompt = `${generateChapterPrompt(context)}

---

# IMPORTANTE: CORREZIONI NECESSARIE

Il capitolo è stato generato ma presenta questi problemi critici che DEVI correggere:

${issues.issues.map((issue) => `
**${issue.type.toUpperCase()}** (Severity: ${issue.severity})
- Problema: ${issue.description}
- Soluzione: ${issue.suggestion}
`).join('\n')}

Rigenera il capitolo applicando queste correzioni.`;

        // Combine system prompt with user prompt for GPT-5
        const combinedPrompt = `${CHAPTER_SYSTEM_PROMPT}

---

${fixPrompt}`;

        // Load AI config for the project
        const aiConfig = await AIConfigService.getOrCreate(projectId);

        // Use GPT-5 Responses API with medium reasoning for regeneration
        // IMPORTANTE: maxOutputTokens DEVE essere alto per capitoli completi
        // Se il JSON viene troncato, aumentare questo valore
        const maxTokens = aiConfig.maxTokens || 20000;

        console.log(`🔄 Regenerating chapter with maxOutputTokens: ${maxTokens}`);

        const result = await callGPT5JSON<{
            chapter: string;
            metadata: any;
            summary: string;
            keyPoints: string[];
        }>(combinedPrompt, {
            model: DEFAULT_MODEL,
            reasoningEffort: 'low',
            verbosity: 'high',
            maxOutputTokens: maxTokens, // Usa lo stesso limite della generazione iniziale
        });

        return {
            content: result.chapter || '',
            metadata: result.metadata || previousAttempt.metadata,
            summary: result.summary || '',
            keyPoints: result.keyPoints || [],
        };
    }    /**
     * Estrae il titolo dal contenuto Markdown generato dall'AI
     */
    private extractTitleFromContent(content: string, chapterNumber: number, outline?: any): string {
        // Cerca il primo H1 (# Titolo)
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
            let title = h1Match[1].trim();

            // Rimuovi "Capitolo X:" se presente per evitare duplicazione
            title = title.replace(/^Capitolo\s+\d+:\s*/i, '');

            return title;
        }

        // Fallback: usa il titolo dall'outline se disponibile
        if (outline?.chapters?.[chapterNumber - 1]?.title) {
            return outline.chapters[chapterNumber - 1].title;
        }

        return `Capitolo ${chapterNumber}`;
    }

    /**
     * Salva capitolo nel database
     */
    private async saveChapter(
        projectId: string,
        chapterNumber: number,
        result: any,
        context?: any,
        aiModel: string = DEFAULT_MODEL
    ) {
        const wordCount = result.content.split(/\s+/).length;

        // Estrai il titolo dal contenuto o usa il fallback
        const extractedTitle = this.extractTitleFromContent(
            result.content,
            chapterNumber,
            context?.outline
        );

        const chapter = await prisma.chapter.upsert({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            update: {
                title: extractedTitle,
                content: result.content,
                wordCount,
                status: 'completed',
                aiModel,
                generatedAt: new Date(),
                systemPrompt: result.systemPrompt || null,
                userPrompt: result.userPrompt || null,
                newCharacters: result.metadata.newCharacters || [],
                newTerms: result.metadata.newTerms || {},
                keyNumbers: result.metadata.keyNumbers || {},
                summary: result.summary || null,
                keyPoints: result.keyPoints || [],
                updatedAt: new Date(),
            },
            create: {
                id: randomUUID(),
                projectId,
                chapterNumber,
                title: extractedTitle,
                content: result.content,
                wordCount,
                status: 'completed',
                aiModel,
                generatedAt: new Date(),
                systemPrompt: result.systemPrompt || null,
                userPrompt: result.userPrompt || null,
                newCharacters: result.metadata.newCharacters || [],
                newTerms: result.metadata.newTerms || {},
                keyNumbers: result.metadata.keyNumbers || {},
                summary: result.summary || null,
                keyPoints: result.keyPoints || [],
                updatedAt: new Date(),
            },
        });

        return chapter;
    }

    /**
     * Aggiorna master context
     */
    private async updateMasterContext(projectId: string, metadata: any) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) return;

        const currentContext = (project.masterContext as unknown as MasterContext) || {
            characters: [],
            terms: {},
            numbers: {},
            themes: {},
        };

        // Merge new data
        const updatedContext: MasterContext = {
            characters: [
                ...new Set([...currentContext.characters, ...(metadata.newCharacters || [])]),
            ],
            terms: { ...currentContext.terms, ...(metadata.newTerms || {}) },
            numbers: { ...currentContext.numbers, ...(metadata.keyNumbers || {}) },
            themes: currentContext.themes,
        };

        await prisma.project.update({
            where: { id: projectId },
            data: { masterContext: updatedContext as any },
        });
    }

    /**
     * Affina style guide dopo cap 2
     */
    private async refineStyleGuide(projectId: string) {
        console.log('📝 Checking style guide after chapter 2...');

        // Check if custom style guide already exists
        const hasCustomStyleGuide = await StyleGuideService.hasStyleGuide(projectId);

        if (hasCustomStyleGuide) {
            console.log('✅ Custom style guide already exists, skipping auto-generation');
            return;
        }

        // Auto-generate style guide from chapters 1 and 2
        console.log('🤖 Generating style guide from chapters 1-2...');

        const result = await StyleGuideService.generateFromChapters(projectId);

        if (result.success) {
            console.log('✅ Style guide generated and saved');
        } else {
            console.log('⚠️ Style guide generation failed:', result.error);
        }
    }

    /**
     * Aggiorna lo status del progetto in base ai capitoli completati
     */
    private async updateProjectStatus(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                Outline: true,
                Chapter: true,
            },
        });

        if (!project || !project.Outline) return;

        const outlineStructure = project.Outline.structure as any;
        const totalChapters = outlineStructure.chapters?.length || 0;
        const completedChapters = project.Chapter.filter(
            ch => ch.status === 'completed'
        ).length;

        let newStatus = project.status;

        if (completedChapters === 0) {
            // Nessun capitolo completato ma outline presente
            newStatus = 'generating_outline';
        } else if (completedChapters < totalChapters) {
            // Generazione capitoli in corso
            newStatus = 'generating_chapters';
        } else if (completedChapters === totalChapters) {
            // Tutti i capitoli completati
            newStatus = 'completed';
        }

        if (newStatus !== project.status) {
            await prisma.project.update({
                where: { id: projectId },
                data: { status: newStatus },
            });
            console.log(`✅ Project status updated: ${project.status} → ${newStatus}`);
        }
    }

    /**
     * Log della generazione
     */
    private async logGeneration(
        projectId: string,
        chapterNumber: number,
        result: any,
        duration: number,
        success: boolean,
        aiModel: string = DEFAULT_MODEL,
        error?: any
    ) {
        await prisma.generationLog.create({
            data: {
                id: randomUUID(),
                projectId,
                step: `chapter_${chapterNumber}`,
                aiModel,
                promptTokens: result?.usage?.prompt_tokens || 0,
                completionTokens: result?.usage?.completion_tokens || 0,
                totalTokens: result?.usage?.total_tokens || 0,
                duration,
                success,
                errorMessage: error ? String(error) : null,
            },
        });
    }

    /**
     * Consistency check finale su tutto il libro
     */
    async finalConsistencyCheck(projectId: string): Promise<ConsistencyReport> {
        console.log('🔍 Running final consistency check...');

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                Outline: true,
                Chapter: { orderBy: { chapterNumber: 'asc' } },
                ProjectAIConfig: true, // Include AI config
            },
        });

        if (!project || !project.Outline) {
            throw new Error('Progetto o outline non trovato');
        }

        // Get AI config (or use default)
        const aiConfig = project.ProjectAIConfig || await AIConfigService.getOrCreate(projectId);

        const chapters = project.Chapter.map((ch) => ({
            number: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
        }));

        const prompt = generateFinalCheckPrompt(chapters, project.Outline.structure);

        // 📊 LOG: Using GPT-5 for consistency check
        const reasoningEffort = getReasoningEffortForTask('consistency-check');
        console.log(`\n🎯 CONSISTENCY CHECK WITH GPT-5`);
        console.log(`   Reasoning Effort: ${reasoningEffort} (balanced accuracy)`);
        console.log(`   Verbosity: medium (standard report)\n`);

        // Use GPT-5 Responses API with medium reasoning (sweet spot: accurate + cost-effective)
        const report = await callGPT5JSON<ConsistencyReport>(prompt, {
            model: aiConfig.model as string,
            reasoningEffort: reasoningEffort, // 'medium' - balanced reasoning
            verbosity: 'medium', // Standard report format
            maxOutputTokens: 4000, // Sufficient for medium reasoning + detailed report
        });

        console.log(`✅ Consistency check completed`);
        console.log(`   Overall Score: ${report.overallScore || 'N/A'}\n`);

        // Salva report nel DB
        await prisma.consistencyReport.create({
            data: {
                id: randomUUID(),
                projectId,
                report: report as any,
                overallScore: report.overallScore || 0,
            },
        });

        return report;
    }
}

// Export singleton instance
export const chapterGenerationService = new ChapterGenerationService();
