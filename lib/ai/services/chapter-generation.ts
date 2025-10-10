import { prisma } from '@/lib/db';
import { openai, DEFAULT_MODEL } from '@/lib/ai/openai-client';
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

/**
 * Service per la generazione dei capitoli con AI
 */
export class ChapterGenerationService {
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

            // 3. GENERA il capitolo con AI
            const result = await this.generateWithAI(context, chapterNumber);

            // 4. MINI CONSISTENCY CHECK (se c'è un capitolo precedente)
            if (context.chapters.previous) {
                const quickCheck = await this.quickValidation(
                    result.content,
                    context.chapters.previous,
                    chapterNumber
                );

                // Se ci sono issue critici, rigenera
                if (quickCheck.hasCriticalIssues) {
                    console.log(
                        `⚠️ Critical issues found in chapter ${chapterNumber}, regenerating...`
                    );
                    const fixedResult = await this.regenerateWithFix(
                        context,
                        chapterNumber,
                        result,
                        quickCheck
                    );
                    result.content = fixedResult.content;
                }
            }

            // 5. SALVA nel database
            const chapter = await this.saveChapter(projectId, chapterNumber, result, context);

            // 6. AGGIORNA master context
            await this.updateMasterContext(projectId, result.metadata);

            // 7. SE è Cap 2, GENERA/AFFINA style guide
            if (chapterNumber === 2) {
                await this.refineStyleGuide(projectId);
            }

            // 8. LOG della generazione
            const duration = Date.now() - startTime;
            await this.logGeneration(projectId, chapterNumber, result, duration, true);

            return chapter;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logGeneration(projectId, chapterNumber, null, duration, false, error);
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
            include: { outline: true },
        });

        if (!project) {
            throw new Error('Progetto non trovato');
        }

        if (!project.outline) {
            throw new Error("Genera prima l'outline del libro");
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
            throw new Error(`Completa prima il Capitolo ${chapterNumber - 1}`);
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
            include: { outline: true },
        });

        if (!project || !project.outline) {
            throw new Error('Progetto o outline non trovato');
        }

        // Carica style guide (se disponibile)
        const styleGuide = project.styleGuide as StyleGuide | null;

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
        const outlineStructure = project.outline.structure as any;
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
    private async generateWithAI(context: ChapterContext, chapterNumber: number) {
        const prompt = generateChapterPrompt(context);

        console.log(`🤖 Generating chapter ${chapterNumber} with AI...`);
        console.log('\n' + '='.repeat(80));
        console.log('📝 SYSTEM PROMPT:');
        console.log('='.repeat(80));
        console.log(CHAPTER_SYSTEM_PROMPT);
        console.log('\n' + '='.repeat(80));
        console.log('📝 USER PROMPT:');
        console.log('='.repeat(80));
        console.log(prompt);
        console.log('='.repeat(80) + '\n');

        const response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: CHAPTER_SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');

        return {
            content: parsed.chapter || '',
            metadata: parsed.metadata || { newCharacters: [], newTerms: {}, keyNumbers: {} },
            summary: parsed.summary || '',
            keyPoints: parsed.keyPoints || [],
            usage: response.usage,
            // Salviamo i prompt usati
            systemPrompt: CHAPTER_SYSTEM_PROMPT,
            userPrompt: prompt,
        };
    }

    /**
     * Quick consistency check
     */
    private async quickValidation(
        newChapter: string,
        previousChapter: string,
        chapterNumber: number
    ): Promise<QuickCheckResult> {
        const prompt = generateQuickCheckPrompt(newChapter, previousChapter, chapterNumber);

        const response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 500,
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    }

    /**
     * Rigenera con correzioni
     */
    private async regenerateWithFix(
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

        const response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: CHAPTER_SYSTEM_PROMPT },
                { role: 'user', content: fixPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');

        return {
            content: parsed.chapter || '',
            metadata: parsed.metadata || previousAttempt.metadata,
            summary: parsed.summary || '',
            keyPoints: parsed.keyPoints || [],
        };
    }

    /**
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
    private async saveChapter(projectId: string, chapterNumber: number, result: any, context?: any) {
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
                aiModel: DEFAULT_MODEL,
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
                projectId,
                chapterNumber,
                title: extractedTitle,
                content: result.content,
                wordCount,
                status: 'completed',
                aiModel: DEFAULT_MODEL,
                generatedAt: new Date(),
                systemPrompt: result.systemPrompt || null,
                userPrompt: result.userPrompt || null,
                newCharacters: result.metadata.newCharacters || [],
                newTerms: result.metadata.newTerms || {},
                keyNumbers: result.metadata.keyNumbers || {},
                summary: result.summary || null,
                keyPoints: result.keyPoints || [],
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
        console.log('📝 Refining style guide after chapter 2...');

        const chapters = await prisma.chapter.findMany({
            where: { projectId, chapterNumber: { lte: 2 } },
            orderBy: { chapterNumber: 'asc' },
        });

        if (chapters.length < 2) return;

        const prompt = generateStyleGuidePrompt(chapters.map((c) => c.content));

        const response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1000,
        });

        const styleGuide = JSON.parse(response.choices[0].message.content || '{}');

        await prisma.project.update({
            where: { id: projectId },
            data: { styleGuide: styleGuide as any },
        });

        console.log('✅ Style guide refined and saved');
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
        error?: any
    ) {
        await prisma.generationLog.create({
            data: {
                projectId,
                step: `chapter_${chapterNumber}`,
                aiModel: DEFAULT_MODEL,
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
                outline: true,
                chapters: { orderBy: { chapterNumber: 'asc' } },
            },
        });

        if (!project || !project.outline) {
            throw new Error('Progetto o outline non trovato');
        }

        const chapters = project.chapters.map((ch) => ({
            number: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
        }));

        const prompt = generateFinalCheckPrompt(chapters, project.outline.structure);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Modello migliore per analisi approfondita
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2000,
        });

        const report = JSON.parse(response.choices[0].message.content || '{}');

        // Salva report nel DB
        await prisma.consistencyReport.create({
            data: {
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
