import { NextRequest, NextResponse } from 'next/server';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { handleApiError, ApiErrors } from '@/lib/errors/api-errors';

// Aumenta il timeout per la generazione dei capitoli (può richiedere diversi minuti)
export const maxDuration = 300; // 5 minuti
export const runtime = 'nodejs';

/**
 * POST /api/projects/[id]/chapters/[chapterNumber]/generate
 * Genera un singolo capitolo
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string; chapterNumber: string } }
) {
    try {
        const projectId = params.id;
        const chapterNumber = parseInt(params.chapterNumber, 10);

        if (isNaN(chapterNumber) || chapterNumber < 1) {
            const error = ApiErrors.validation('Numero capitolo non valido');
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }

        console.log(`🚀 Starting chapter ${chapterNumber} generation for project ${projectId}`);

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
        console.error('Error generating chapter:', error);

        // Usa l'error handler centralizzato
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
    }
}
