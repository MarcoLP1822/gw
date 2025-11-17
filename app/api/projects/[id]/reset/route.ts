import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/projects/[id]/reset
 * Reset complete del progetto - cancella tutto il contenuto generato
 * e riporta il progetto allo stato iniziale di bozza
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;

        // Verifica che il progetto esista
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                Outline: true,
                Chapter: true,
                ConsistencyReport: true,
                GenerationLog: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // Esegui il reset in una transazione per garantire l'atomicità
        const result = await prisma.$transaction(async (tx) => {
            // 1. Cancella tutti i capitoli
            await tx.chapter.deleteMany({
                where: { projectId },
            });

            // 2. Cancella l'outline
            await tx.outline.deleteMany({
                where: { projectId },
            });

            // 3. Cancella i consistency reports
            await tx.consistencyReport.deleteMany({
                where: { projectId },
            });

            // 4. Cancella i generation logs (opzionale, per pulizia completa)
            await tx.generationLog.deleteMany({
                where: { projectId },
            });

            // 5. Aggiorna il progetto riportandolo allo stato iniziale
            const updatedProject = await tx.project.update({
                where: { id: projectId },
                data: {
                    status: 'draft',
                    generationProgress: {
                        status: 'idle',
                        progress: 0,
                        chaptersComplete: 0,
                        chaptersTotal: 0,
                    },
                    masterContext: null as any,
                    styleGuide: null as any,
                    generatedStyleGuide: null,
                    // Manteniamo customStyleGuide se l'utente l'aveva impostato manualmente
                    // styleGuideSource: null, // Lo manteniamo se era "manual"
                    // styleGuideCreatedAt: null, // Lo manteniamo
                },
            });

            return updatedProject;
        });

        return NextResponse.json({
            success: true,
            message: 'Progetto resettato con successo',
            project: result,
        });

    } catch (error) {
        console.error('Error resetting project:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante il reset del progetto',
            },
            { status: 500 }
        );
    }
}
