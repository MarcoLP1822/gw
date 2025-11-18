import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/projects/[id]/chapters/[chapterNumber]
 * Recupera un capitolo specifico
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
    try {
        const { id, chapterNumber: chapterNumberStr } = await params;
        const { prisma } = await import('@/lib/db');
        const projectId = id;
        const chapterNumber = parseInt(chapterNumberStr, 10);

        const chapter = await prisma.chapter.findUnique({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
        });

        if (!chapter) {
            return NextResponse.json(
                { error: 'Capitolo non trovato' },
                { status: 404 }
            );
        }

        return NextResponse.json({ chapter });
    } catch (error: any) {
        logger.error('Error fetching chapter', error);

        return NextResponse.json(
            { error: 'Errore durante il recupero del capitolo' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/projects/[id]/chapters/[chapterNumber]
 * Aggiorna il contenuto di un capitolo (edit manuale)
 * 
 * Salva automaticamente la versione precedente in previousContent
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
    try {
        const { id, chapterNumber: chapterNumberStr } = await params;
        const { prisma } = await import('@/lib/db');
        const projectId = id;
        const chapterNumber = parseInt(chapterNumberStr, 10);
        const body = await request.json();

        const { content, modifiedBy = 'user' } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Contenuto mancante' },
                { status: 400 }
            );
        }

        // Recupera il capitolo corrente per salvare il contenuto precedente
        const currentChapter = await prisma.chapter.findUnique({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            select: {
                content: true,
            },
        });

        if (!currentChapter) {
            return NextResponse.json(
                { error: 'Capitolo non trovato' },
                { status: 404 }
            );
        }

        // Calcola nuovo word count
        const wordCount = content.split(/\s+/).length;

        // Aggiorna capitolo salvando la versione precedente
        const chapter = await prisma.chapter.update({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            data: {
                content,
                wordCount,
                previousContent: currentChapter.content, // Salva backup
                lastModifiedBy: modifiedBy,
                previousContentSavedAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            chapter,
            message: 'Capitolo aggiornato con successo',
            hasUndo: true, // Indica che l'undo è disponibile
        });
    } catch (error: any) {
        logger.error('Error updating chapter', error);

        return NextResponse.json(
            { error: 'Errore durante l\'aggiornamento del capitolo' },
            { status: 500 }
        );
    }
}
