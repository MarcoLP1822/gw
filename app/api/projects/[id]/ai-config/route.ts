import { NextRequest, NextResponse } from 'next/server';
import { AIConfigService } from '@/lib/ai/config/ai-config-service';
import { validateAIConfig } from '@/lib/ai/config/defaults';
import type { ProjectAIConfig } from '@prisma/client';

/**
 * GET /api/projects/[id]/ai-config
 * Recupera la configurazione AI del progetto
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const config = await AIConfigService.getOrCreate(params.id);

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error fetching AI config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch AI config' },
            { status: 500 }
        );
    }
}

/**
 * POST/PUT /api/projects/[id]/ai-config
 * Aggiorna la configurazione AI del progetto
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Log per debug
        console.log('📝 Updating AI config:', {
            projectId: params.id,
            targetWordsPerChapter: body.targetWordsPerChapter,
            maxTokens: body.maxTokens
        });

        // Valida i dati
        const validation = validateAIConfig(body);
        if (!validation.valid) {
            console.error('❌ Validation failed:', validation.errors);
            return NextResponse.json(
                {
                    error: 'Invalid configuration',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Aggiorna la configurazione
        const config = await AIConfigService.update(params.id, body);

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error updating AI config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update AI config' },
            { status: 500 }
        );
    }
}

// Alias for POST
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return POST(request, { params });
}

/**
 * DELETE /api/projects/[id]/ai-config
 * Resetta la configurazione AI ai valori di default
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const config = await AIConfigService.reset(params.id);

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error resetting AI config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reset AI config' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/projects/[id]/ai-config
 * Aggiornamento parziale (merge con config esistente)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Recupera config attuale
        const currentConfig = await AIConfigService.getOrCreate(params.id);

        // Merge con i nuovi dati
        const mergedData = {
            ...currentConfig,
            ...body,
            // Assicurati che projectId non venga sovrascritto
            projectId: params.id,
        };

        // Valida il risultato
        const validation = validateAIConfig(mergedData);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: 'Invalid configuration after merge',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Aggiorna
        const config = await AIConfigService.update(params.id, mergedData);

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error patching AI config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to patch AI config' },
            { status: 500 }
        );
    }
}
