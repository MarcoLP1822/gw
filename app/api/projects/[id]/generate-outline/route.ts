import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai, DEFAULT_CONFIG } from '@/lib/ai/openai-client';
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

        // 3. Chiama OpenAI API
        const startTime = Date.now();

        const completion = await openai.chat.completions.create({
            model: DEFAULT_CONFIG.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: DEFAULT_CONFIG.temperature,
            max_tokens: DEFAULT_CONFIG.max_tokens,
            response_format: { type: 'json_object' }, // Forza risposta JSON
        });

        const generationTime = Date.now() - startTime;

        // 4. Parse della risposta
        const responseContent = completion.choices[0].message.content;
        if (!responseContent) {
            throw new Error('Nessuna risposta da OpenAI');
        }

        const generatedOutline: GeneratedOutline = JSON.parse(responseContent);

        // 5. Salva o aggiorna l'outline nel database (upsert)
        const outline = await prisma.outline.upsert({
            where: { projectId },
            create: {
                projectId,
                structure: generatedOutline as any, // Prisma accetta JSON
                totalChapters: generatedOutline.chapters.length,
                estimatedWords: generatedOutline.chapters.length * 2000, // stima 2000 parole/capitolo
                aiModel: DEFAULT_CONFIG.model,
            },
            update: {
                structure: generatedOutline as any,
                totalChapters: generatedOutline.chapters.length,
                estimatedWords: generatedOutline.chapters.length * 2000,
                aiModel: DEFAULT_CONFIG.model,
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
                aiModel: DEFAULT_CONFIG.model,
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
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
                model: DEFAULT_CONFIG.model,
                promptTokens: completion.usage?.prompt_tokens,
                completionTokens: completion.usage?.completion_tokens,
                totalTokens: completion.usage?.total_tokens,
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
                    aiModel: DEFAULT_CONFIG.model,
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
