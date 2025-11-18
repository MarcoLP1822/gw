import { NextRequest, NextResponse } from 'next/server';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { handleApiError, ApiErrors } from '@/lib/errors/api-errors';
import { logger } from '@/lib/logger';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

// Aumenta il timeout per la generazione dei capitoli (può richiedere diversi minuti)
export const maxDuration = 300; // 5 minuti
export const runtime = 'nodejs';

/**
 * POST /api/projects/[id]/chapters/[chapterNumber]/generate
 * Genera un singolo capitolo
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
    try {
        // Rate limiting: max 2 generazioni al minuto
        await rateLimit(request, RateLimitPresets.AI_GENERATION);

        const { id, chapterNumber: chapterNumberStr } = await params;
        const projectId = id;
        const chapterNumber = parseInt(chapterNumberStr, 10);

        if (isNaN(chapterNumber) || chapterNumber < 1) {
            const error = ApiErrors.validation('Numero capitolo non valido');
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }

        logger.info('🚀 Starting chapter generation', { projectId, chapterNumber });

        const chapter = await chapterGenerationService.generateChapter(
            projectId,
            chapterNumber
        );

        return NextResponse.json({
            success: true,
            chapter,
            message: `Capitolo ${chapterNumber} generato con successo`,
        });
    } catch (error: any) {
        logger.error('Error generating chapter', error);

        // Usa l'error handler centralizzato
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
    }
}
