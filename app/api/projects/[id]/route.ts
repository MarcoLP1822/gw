import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ProjectFormData } from '@/types';
import { logger } from '@/lib/logger';

// GET /api/projects/[id] - Ottieni dettagli progetto singolo
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        logger.info('📥 GET /api/projects/[id] - Request received');
        const { id } = await params;
        logger.info('🔍 Project ID:', { id });

        const project = await prisma.project.findUnique({
            where: {
                id
            },
            include: {
                Outline: true,
                Chapter: {
                    orderBy: {
                        chapterNumber: 'asc'
                    }
                },
                ConsistencyReport: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                _count: {
                    select: {
                        Chapter: true,
                        GenerationLog: true
                    }
                }
            }
        });

        if (!project) {
            logger.info('❌ Project not found:', { id });
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        logger.info('✅ Project found:', { bookTitle: project.bookTitle });
        logger.info('📋 Outline present:', { hasOutline: !!project.Outline });
        logger.info('📊 Consistency reports:', { count: project.ConsistencyReport?.length || 0 });

        // Normalizza i dati per il frontend (lowercase per compatibilità)
        const normalizedProject = {
            ...project,
            outline: project.Outline, // Aggiungi versione lowercase
            consistencyReport: project.ConsistencyReport?.[0] || null
        };

        return NextResponse.json({
            success: true,
            project: normalizedProject
        });

    } catch (error) {
        logger.error('❌ Error fetching project:', error);
        logger.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: 'Errore durante il recupero del progetto' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Aggiorna progetto
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Partial<ProjectFormData> & { status?: string } = await request.json();

        // Verifica che il progetto esista
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // Aggiorna il progetto
        const updatedProject = await prisma.project.update({
            where: {
                id
            },
            data: {
                // Aggiorna solo i campi forniti
                ...(body.authorName && { authorName: body.authorName }),
                ...(body.authorRole && { authorRole: body.authorRole }),
                ...(body.company && { company: body.company }),
                ...(body.industry && { industry: body.industry }),
                ...(body.bookTitle && { bookTitle: body.bookTitle }),
                ...(body.bookSubtitle !== undefined && { bookSubtitle: body.bookSubtitle || null }),
                ...(body.targetReaders && { targetReaders: body.targetReaders }),
                ...(body.currentSituation && { currentSituation: body.currentSituation }),
                ...(body.challengeFaced && { challengeFaced: body.challengeFaced }),
                ...(body.transformation && { transformation: body.transformation }),
                ...(body.achievement && { achievement: body.achievement }),
                ...(body.lessonLearned && { lessonLearned: body.lessonLearned }),
                ...(body.businessGoals && { businessGoals: body.businessGoals }),
                ...(body.uniqueValue && { uniqueValue: body.uniqueValue }),
                ...(body.estimatedPages !== undefined && {
                    estimatedPages: body.estimatedPages ? parseInt(String(body.estimatedPages), 10) : null
                }),
                ...(body.additionalNotes !== undefined && { additionalNotes: body.additionalNotes || null }),
                ...(body.status && { status: body.status }),
            }
        });

        return NextResponse.json({
            success: true,
            project: updatedProject
        });

    } catch (error) {
        logger.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Errore durante l\'aggiornamento del progetto' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Elimina progetto
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verifica che il progetto esista
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // Elimina il progetto (cascade delete eliminerà anche outline, chapters, logs)
        await prisma.project.delete({
            where: {
                id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Progetto eliminato con successo'
        });

    } catch (error) {
        logger.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Errore durante l\'eliminazione del progetto' },
            { status: 500 }
        );
    }
}
