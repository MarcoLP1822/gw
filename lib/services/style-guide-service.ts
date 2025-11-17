/**
 * Style Guide Service
 * 
 * Business logic for managing project style guides
 */

import { prisma } from '@/lib/db';
import { DEFAULT_MODEL } from '@/lib/ai/openai-client';
import { callGPT5JSON } from '@/lib/ai/responses-api';
import { DocumentService } from './document-service';
import { AIConfigService } from '@/lib/ai/config/ai-config-service';

export interface StyleGuideGenerationResult {
    styleGuide: string;
    success: boolean;
    error?: string;
    source: 'manual' | 'ai_generated' | 'ai_from_docs';
}

export class StyleGuideService {
    /**
     * Get the active style guide for a project
     * Priority: custom (manual) > generated
     */
    static async getActiveStyleGuide(projectId: string): Promise<string | null> {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                customStyleGuide: true,
                generatedStyleGuide: true,
            },
        });

        if (!project) {
            return null;
        }

        // Custom style guide takes priority
        return project.customStyleGuide || project.generatedStyleGuide;
    }

    /**
     * Save a custom (manual) style guide
     */
    static async saveCustomStyleGuide(
        projectId: string,
        styleGuide: string
    ): Promise<boolean> {
        try {
            // Save the custom style guide
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    customStyleGuide: styleGuide,
                    styleGuideSource: 'manual',
                    styleGuideCreatedAt: new Date(),
                },
            });

            // IMPORTANT: Clear any conflicting custom system prompt from AI Config
            // to ensure the style guide is only in the user prompt, not system prompt
            await prisma.projectAIConfig.update({
                where: { projectId },
                data: {
                    useCustomPrompts: false,
                    customSystemPrompt: null,
                },
            });

            return true;
        } catch (error) {
            console.error('Error saving custom style guide:', error);
            return false;
        }
    }

    /**
     * Generate style guide from uploaded documents using AI
     */
    static async generateFromDocuments(
        projectId: string
    ): Promise<StyleGuideGenerationResult> {
        try {
            // Get reference text from uploaded documents
            const referenceText = await DocumentService.getStyleReferenceText(projectId);

            if (!referenceText || referenceText.trim().length === 0) {
                return {
                    styleGuide: '',
                    success: false,
                    error: 'Nessun documento di riferimento trovato. Carica almeno un documento.',
                    source: 'ai_from_docs',
                };
            }

            // Generate style guide using AI
            const projectAIConfig = await AIConfigService.getOrCreate(projectId);
            const modelToUse = projectAIConfig.model || 'gpt-5-mini';

            const styleGuide = await this.generateStyleGuideWithAI(referenceText, modelToUse);

            // Save as custom style guide
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    customStyleGuide: styleGuide,
                    styleGuideSource: 'ai_from_docs',
                    styleGuideCreatedAt: new Date(),
                },
            });

            // IMPORTANT: Clear any conflicting custom system prompt from AI Config
            await prisma.projectAIConfig.update({
                where: { projectId },
                data: {
                    useCustomPrompts: false,
                    customSystemPrompt: null,
                },
            });

            // Mark documents as used
            await DocumentService.markDocumentsUsedForStyleGuide(projectId);

            return {
                styleGuide,
                success: true,
                source: 'ai_from_docs',
            };
        } catch (error) {
            console.error('Error generating style guide from documents:', error);
            return {
                styleGuide: '',
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante la generazione',
                source: 'ai_from_docs',
            };
        }
    }

    /**
     * Generate style guide from chapters 1 and 2 (existing logic)
     */
    static async generateFromChapters(projectId: string): Promise<StyleGuideGenerationResult> {
        try {
            // Only generate if no custom style guide exists
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: {
                    customStyleGuide: true,
                    Chapter: {
                        where: {
                            chapterNumber: { in: [1, 2] },
                            status: 'completed',
                        },
                        orderBy: { chapterNumber: 'asc' },
                        select: {
                            content: true,
                            chapterNumber: true,
                        },
                    },
                },
            });

            if (!project) {
                return {
                    styleGuide: '',
                    success: false,
                    error: 'Progetto non trovato',
                    source: 'ai_generated',
                };
            }

            // If custom style guide exists, don't override
            if (project.customStyleGuide) {
                return {
                    styleGuide: project.customStyleGuide,
                    success: true,
                    source: 'manual',
                };
            }

            if (project.Chapter.length < 2) {
                return {
                    styleGuide: '',
                    success: false,
                    error: 'Servono almeno 2 capitoli completati',
                    source: 'ai_generated',
                };
            }

            // Combine chapter content
            const chaptersText = project.Chapter
                .map((ch) => `=== CAPITOLO ${ch.chapterNumber} ===\n\n${ch.content}`)
                .join('\n\n');

            // Generate style guide using AI
            const projectAIConfig = await AIConfigService.getOrCreate(projectId);
            const modelToUse = projectAIConfig.model || 'gpt-5-mini'; // Default to mini if not configured

            const styleGuide = await this.generateStyleGuideWithAI(chaptersText, modelToUse);

            // Save as generated style guide
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    generatedStyleGuide: styleGuide,
                    styleGuideSource: 'ai_generated',
                    styleGuideCreatedAt: new Date(),
                },
            });

            // IMPORTANT: Clear any conflicting custom system prompt from AI Config
            // (only if it's not being used for other customizations)
            const aiConfig = await prisma.projectAIConfig.findUnique({
                where: { projectId },
                select: { customOutlineInstructions: true, customChapterInstructions: true },
            });

            // Only clear if no other custom instructions are set
            if (!aiConfig?.customOutlineInstructions && !aiConfig?.customChapterInstructions) {
                await prisma.projectAIConfig.update({
                    where: { projectId },
                    data: {
                        useCustomPrompts: false,
                        customSystemPrompt: null,
                    },
                });
            }

            return {
                styleGuide,
                success: true,
                source: 'ai_generated',
            };
        } catch (error) {
            console.error('Error generating style guide from chapters:', error);
            return {
                styleGuide: '',
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante la generazione',
                source: 'ai_generated',
            };
        }
    }

    /**
     * Generate style guide using GPT-5
     */
    private static async generateStyleGuideWithAI(referenceText: string, model: string = DEFAULT_MODEL): Promise<string> {
        const prompt = `Analizza il seguente testo e genera uno style guide dettagliato per aiutare un'AI a scrivere nello stesso stile.

Lo style guide deve includere:
1. Tono e voce (formale/informale, prima/terza persona, ecc.)
2. Struttura delle frasi (lunghe/corte, complesse/semplici)
3. Vocabolario preferito (parole chiave, terminologia)
4. Peculiarità stilistiche (figure retoriche, ritmo, ecc.)
5. Esempi concreti di frasi caratteristiche
6. Cosa evitare

Sii specifico e pratico. Lo style guide verrà usato come riferimento per scrivere capitoli coerenti.

TESTO DA ANALIZZARE:
${referenceText.substring(0, 15000)} ${referenceText.length > 15000 ? '\n\n[...testo troncato...]' : ''}

Rispondi con un JSON nel formato:
{
  "styleGuide": "Il testo dello style guide completo qui"
}`;

        const systemPrompt = 'Sei un esperto di analisi stilistica e redazione di style guide per scrittura creativa.';

        const fullPrompt = `${systemPrompt}

---

${prompt}`;

        console.log('🎨 Generating style guide with GPT-5...');

        const response = await callGPT5JSON<{ styleGuide: string }>(fullPrompt, {
            model,
            reasoningEffort: 'low',
            verbosity: 'high', // Style guide richiede dettagli
            maxOutputTokens: 8000, // Aumentato: GPT-5 usa molti token per reasoning
        });

        console.log('✅ Style guide generated');

        return response.styleGuide;
    }

    /**
     * Check if project has style guide (custom or generated)
     */
    static async hasStyleGuide(projectId: string): Promise<boolean> {
        const styleGuide = await this.getActiveStyleGuide(projectId);
        return !!styleGuide && styleGuide.trim().length > 0;
    }

    /**
     * Delete custom style guide (revert to generated if exists)
     */
    static async deleteCustomStyleGuide(projectId: string): Promise<boolean> {
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    customStyleGuide: null,
                    styleGuideSource: null,
                },
            });
            return true;
        } catch (error) {
            console.error('Error deleting custom style guide:', error);
            return false;
        }
    }
}
