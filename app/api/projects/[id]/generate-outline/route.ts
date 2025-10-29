import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_MODEL, logAPICall } from '@/lib/ai/openai-client';
import { callGPT5JSON } from '@/lib/ai/responses-api';
import { generateOutlinePrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts/outline-generator';
import { GeneratedOutline } from '@/types';

/**
 * POST /api/projects/[id]/generate-outline
 * Genera un outline per il libro usando OpenAI
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        // 1. Recupera il progetto dal database
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // 2. Genera il prompt basato sui dati del progetto
        const projectData: any = {
            authorName: project.authorName,
            authorRole: project.authorRole,
            company: project.company,
            industry: project.industry,
            bookTitle: project.bookTitle,
            bookSubtitle: project.bookSubtitle,
            targetReaders: project.targetReaders,
            currentSituation: project.currentSituation,
            challengeFaced: project.challengeFaced,
            transformation: project.transformation,
            achievement: project.achievement,
            lessonLearned: project.lessonLearned,
            businessGoals: project.businessGoals,
            uniqueValue: project.uniqueValue,
            estimatedPages: project.estimatedPages,
            additionalNotes: project.additionalNotes,
        };

        const userPrompt = generateOutlinePrompt(projectData);

        // Combina system e user prompt per GPT-5 Responses API
        const fullPrompt = `${SYSTEM_PROMPT}

---

${userPrompt}`;

        // 3. Chiama GPT-5 Responses API
        const startTime = Date.now();

        // 📊 LOG: Quale modello stiamo usando
        console.log(`\n🎯 GENERATING OUTLINE WITH GPT-5`);
        console.log(`   Model: ${DEFAULT_MODEL}`);
        console.log(`   Reasoning Effort: medium`);
        console.log(`   Verbosity: medium\n`);

        logAPICall('Generate Outline', DEFAULT_MODEL);

        const generatedOutline = await callGPT5JSON<GeneratedOutline>(fullPrompt, {
            model: DEFAULT_MODEL,
            reasoningEffort: 'medium',
            verbosity: 'medium',
            maxOutputTokens: 8000, // Aumentato per outline più dettagliati
        });

        const generationTime = Date.now() - startTime;

        // 📊 LOG: Risposta ricevuta
        console.log(`✅ Outline generated successfully`);
        console.log(`   Generation time: ${(generationTime / 1000).toFixed(2)}s\n`);

        logAPICall('Outline Generated', DEFAULT_MODEL);

        // 5. Salva o aggiorna l'outline nel database (upsert)
        const outline = await prisma.outline.upsert({
            where: { projectId },
            create: {
                projectId,
                structure: generatedOutline as any, // Prisma accetta JSON
                totalChapters: generatedOutline.chapters.length,
                estimatedWords: generatedOutline.chapters.length * 2000, // stima 2000 parole/capitolo
                aiModel: DEFAULT_MODEL,
            },
            update: {
                structure: generatedOutline as any,
                totalChapters: generatedOutline.chapters.length,
                estimatedWords: generatedOutline.chapters.length * 2000,
                aiModel: DEFAULT_MODEL,
                generatedAt: new Date(), // Aggiorna la data di generazione
            },
        });

        // 5b. Aggiorna lo status del progetto
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'generating_outline' },
        });

        // 6. Log della generazione per tracking costi
        await prisma.generationLog.create({
            data: {
                projectId,
                step: 'outline',
                aiModel: DEFAULT_MODEL,
                promptTokens: 0, // GPT-5 Responses API ha usage diverso
                completionTokens: 0,
                totalTokens: 0,
                duration: generationTime,
                success: true,
            },
        });

        // 7. Ritorna l'outline generato
        return NextResponse.json({
            success: true,
            outline: {
                id: outline.id,
                ...generatedOutline,
                generatedAt: outline.generatedAt,
            },
            usage: {
                model: DEFAULT_MODEL,
                generationTime: `${(generationTime / 1000).toFixed(2)}s`,
            },
        });
    } catch (error) {
        console.error('Errore nella generazione outline:', error);

        // Log errore nel database
        try {
            await prisma.generationLog.create({
                data: {
                    projectId: params.id,
                    step: 'outline',
                    aiModel: DEFAULT_MODEL,
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                    duration: 0,
                    success: false,
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        } catch (logError) {
            console.error('Errore nel logging:', logError);
        }

        return NextResponse.json(
            {
                error: 'Errore nella generazione dell\'outline',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
