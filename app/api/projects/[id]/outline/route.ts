import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/projects/[id]/outline
 * Aggiorna l'outline del progetto (modifica, aggiunge o elimina capitoli)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;
        const { structure } = await request.json();

        // Verifica che il progetto esista
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // Verifica che l'outline esista
        const existingOutline = await prisma.outline.findUnique({
            where: { projectId },
        });

        if (!existingOutline) {
            return NextResponse.json(
                { error: 'Outline non trovato' },
                { status: 404 }
            );
        }

        // Aggiorna l'outline con la nuova struttura
        const updatedOutline = await prisma.outline.update({
            where: { projectId },
            data: {
                structure: structure as any,
                totalChapters: structure.chapters?.length || 0,
                estimatedWords: (structure.chapters?.length || 0) * 2000,
                generatedAt: new Date(), // Aggiorna la data di modifica
            },
        });

        return NextResponse.json({
            success: true,
            outline: {
                id: updatedOutline.id,
                structure: updatedOutline.structure,
                totalChapters: updatedOutline.totalChapters,
                generatedAt: updatedOutline.generatedAt,
            },
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento outline:', error);

        return NextResponse.json(
            {
                error: 'Errore interno del server',
                message: error instanceof Error ? error.message : 'Errore sconosciuto',
            },
            { status: 500 }
        );
    }
}
