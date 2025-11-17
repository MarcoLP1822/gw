import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openai-client';
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { validateAIConfig, DEFAULT_AI_CONFIG } from '@/lib/ai/config/defaults';
import { prisma } from '@/lib/db';
import type { ProjectAIConfig } from '@prisma/client';

/**
 * POST /api/projects/[id]/ai-config/test
 * Testa la configurazione AI generando un sample output
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Valida la configurazione
        const validation = validateAIConfig(body);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: 'Invalid configuration',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Recupera il progetto
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Crea una config temporanea (merge con defaults)
        const testConfig: any = {
            ...DEFAULT_AI_CONFIG,
            ...body,
            projectId: id,
        };

        // Converti il progetto Prisma a ProjectFormData per il PromptBuilder
        const projectData = {
            ...project,
            bookSubtitle: project.bookSubtitle ?? undefined,
            estimatedPages: project.estimatedPages ?? undefined,
            additionalNotes: project.additionalNotes ?? undefined,
        };

        // Costruisci i prompts con la config di test
        const systemPrompt = PromptBuilder.buildSystemPrompt(projectData, testConfig);

        // Crea un mini prompt di test
        const testUserPrompt = `
Scrivi UN SINGOLO PARAGRAFO (5-8 frasi) come esempio del tuo stile di scrittura per questo libro.

Il paragrafo deve:
- Parlare della sfida/trasformazione dell'autore: "${project.challengeFaced}"
- Usare lo stile e il tono specificati nel system prompt
- Essere rivolto al pubblico target specificato
- Dimostrare chiaramente le caratteristiche di scrittura richieste

NON scrivere un capitolo completo, solo un paragrafo di esempio.
`;

        console.log('🧪 Testing AI Config...');
        console.log('Configuration:', testConfig);

        // 🔧 GPT-4o e modelli successivi usano max_completion_tokens invece di max_tokens
        const isNewModel = (testConfig.model as string).includes('gpt-4o') ||
            (testConfig.model as string).includes('gpt-5') ||
            (testConfig.model as string).includes('o1') ||
            (testConfig.model as string).includes('o3');

        // Alcuni modelli hanno limitazioni sui parametri
        const hasLimitations = (testConfig.model as string).includes('gpt-5-mini') ||
            (testConfig.model as string).includes('o1') ||
            (testConfig.model as string).includes('o3');

        const requestParams: any = {
            model: testConfig.model as any,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: testUserPrompt },
            ],
        };

        // Alcuni modelli non supportano temperature, top_p, etc.
        if (!hasLimitations) {
            requestParams.temperature = testConfig.temperature;
            requestParams.top_p = testConfig.topP;
            requestParams.frequency_penalty = testConfig.frequencyPenalty;
            requestParams.presence_penalty = testConfig.presencePenalty;
        } else {
            console.log(`⚠️ Model ${testConfig.model} has parameter limitations - using defaults only`);
        }

        // Usa il parametro corretto in base al modello
        if (isNewModel) {
            requestParams.max_completion_tokens = 500;
        } else {
            requestParams.max_tokens = 500;
        }

        // Genera sample output
        const response = await openai.chat.completions.create(requestParams);

        const sampleOutput = response.choices[0].message.content || '';

        // Analizza l'output
        const wordCount = sampleOutput.split(/\s+/).length;
        const sentences = sampleOutput.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = Math.round(wordCount / sentences.length);

        return NextResponse.json({
            success: true,
            sample: {
                content: sampleOutput,
                analysis: {
                    wordCount,
                    sentenceCount: sentences.length,
                    avgWordsPerSentence,
                    estimatedComplexity: avgWordsPerSentence <= 12 ? 'Simple' : avgWordsPerSentence <= 18 ? 'Medium' : 'Complex',
                },
            },
            config: {
                audience: testConfig.audienceType,
                goal: testConfig.bookGoal,
                tone: testConfig.toneSlider,
                temperature: testConfig.temperature,
                model: testConfig.model,
            },
            usage: {
                promptTokens: response.usage?.prompt_tokens,
                completionTokens: response.usage?.completion_tokens,
                totalTokens: response.usage?.total_tokens,
            },
            prompts: {
                system: systemPrompt,
                user: testUserPrompt,
            },
        });
    } catch (error: any) {
        console.error('Error testing AI config:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to test AI config',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}
