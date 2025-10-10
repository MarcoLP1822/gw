import { NextRequest, NextResponse } from 'next/server';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';

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
            return NextResponse.json(
                { error: 'Numero capitolo non valido' },
                { status: 400 }
            );
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

        return NextResponse.json(
            {
                error: error.message || 'Errore durante la generazione del capitolo',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}
