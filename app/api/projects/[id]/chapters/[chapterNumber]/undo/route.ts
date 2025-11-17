import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/projects/[id]/chapters/[chapterNumber]/undo
 * Ripristina la versione precedente del capitolo (undo)
 * 
 * Scambia content <-> previousContent per permettere redo
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
    try {
        const { id, chapterNumber: chapterNumberStr } = await params;
        const { prisma } = await import('@/lib/db');
        const projectId = id;
        const chapterNumber = parseInt(chapterNumberStr, 10);

        // Recupera il capitolo corrente
        const currentChapter = await prisma.chapter.findUnique({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            select: {
                content: true,
                previousContent: true,
                lastModifiedBy: true,
            },
        });

        if (!currentChapter) {
            return NextResponse.json(
                { error: 'Capitolo non trovato' },
                { status: 404 }
            );
        }

        if (!currentChapter.previousContent) {
            return NextResponse.json(
                { error: 'Nessuna versione precedente disponibile' },
                { status: 400 }
            );
        }

        // Scambia content e previousContent (permette redo)
        const newContent = currentChapter.previousContent;
        const newPreviousContent = currentChapter.content;
        const newWordCount = newContent.split(/\s+/).length;

        const chapter = await prisma.chapter.update({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            data: {
                content: newContent,
                previousContent: newPreviousContent,
                wordCount: newWordCount,
                previousContentSavedAt: new Date(),
                updatedAt: new Date(),
                // lastModifiedBy rimane lo stesso (non cambiamo chi ha fatto la modifica originale)
            },
        });

        return NextResponse.json({
            success: true,
            chapter,
            message: 'Versione precedente ripristinata',
            canRedo: true, // Indica che si può fare redo (tornare alla versione dopo)
        });
    } catch (error: any) {
        console.error('Error undoing chapter:', error);

        return NextResponse.json(
            { error: 'Errore durante il ripristino della versione precedente' },
            { status: 500 }
        );
    }
}
