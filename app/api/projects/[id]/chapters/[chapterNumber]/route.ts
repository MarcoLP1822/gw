import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects/[id]/chapters/[chapterNumber]
 * Recupera un capitolo specifico
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; chapterNumber: string } }
) {
    try {
        const { prisma } = await import('@/lib/db');
        const projectId = params.id;
        const chapterNumber = parseInt(params.chapterNumber, 10);

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
        console.error('Error fetching chapter:', error);

        return NextResponse.json(
            { error: 'Errore durante il recupero del capitolo' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/projects/[id]/chapters/[chapterNumber]
 * Aggiorna il contenuto di un capitolo (edit manuale)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; chapterNumber: string } }
) {
    try {
        const { prisma } = await import('@/lib/db');
        const projectId = params.id;
        const chapterNumber = parseInt(params.chapterNumber, 10);
        const body = await request.json();

        const { content } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Contenuto mancante' },
                { status: 400 }
            );
        }

        // Calcola nuovo word count
        const wordCount = content.split(/\s+/).length;

        const chapter = await prisma.chapter.update({
            where: {
                projectId_chapterNumber: { projectId, chapterNumber },
            },
            data: {
                content,
                wordCount,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            chapter,
            message: 'Capitolo aggiornato con successo',
        });
    } catch (error: any) {
        console.error('Error updating chapter:', error);

        return NextResponse.json(
            { error: 'Errore durante l\'aggiornamento del capitolo' },
            { status: 500 }
        );
    }
}
