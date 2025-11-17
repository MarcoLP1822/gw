import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ProjectFormData } from '@/types';
import { handleApiError, ApiErrors } from '@/lib/errors/api-errors';
import { randomUUID } from 'crypto';

// POST /api/projects - Crea un nuovo progetto
export async function POST(request: NextRequest) {
    try {
        const body: ProjectFormData = await request.json();

        // Validazione base
        if (!body.authorName || !body.bookTitle || !body.company) {
            const error = ApiErrors.validation(
                'Campi obbligatori mancanti: authorName, bookTitle, company'
            );
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }

        // TODO: In futuro, prendere userId dalla sessione (NextAuth)
        // Per ora, creiamo/usiamo un utente demo
        let user = await prisma.user.findUnique({
            where: { email: 'demo@ghostwriting.com' }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: randomUUID(),
                    email: 'demo@ghostwriting.com',
                    name: 'Demo User',
                    role: 'ghost_writer',
                    updatedAt: new Date()
                }
            });
        }

        // Crea il progetto nel database
        const project = await prisma.project.create({
            data: {
                id: randomUUID(),
                userId: user.id,
                authorName: body.authorName,
                authorRole: body.authorRole,
                company: body.company,
                industry: body.industry,
                bookTitle: body.bookTitle,
                bookSubtitle: body.bookSubtitle || null,
                targetReaders: body.targetReaders,
                currentSituation: body.currentSituation,
                challengeFaced: body.challengeFaced,
                transformation: body.transformation,
                achievement: body.achievement,
                lessonLearned: body.lessonLearned,
                businessGoals: body.businessGoals,
                uniqueValue: body.uniqueValue,
                estimatedPages: body.estimatedPages ? parseInt(String(body.estimatedPages), 10) : null,
                additionalNotes: body.additionalNotes || null,
                status: 'draft',
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                bookTitle: project.bookTitle,
                authorName: project.authorName,
                status: project.status,
                createdAt: project.createdAt,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating project:', error);
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
    }
}

// GET /api/projects - Lista tutti i progetti
export async function GET(request: NextRequest) {
    try {
        // TODO: Filtrare per userId dalla sessione
        const projects = await prisma.project.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                bookTitle: true,
                bookSubtitle: true,
                authorName: true,
                authorRole: true,
                company: true,
                industry: true,
                targetReaders: true,
                currentSituation: true,
                challengeFaced: true,
                transformation: true,
                achievement: true,
                lessonLearned: true,
                businessGoals: true,
                uniqueValue: true,
                status: true,
                estimatedPages: true,
                additionalNotes: true,
                createdAt: true,
                updatedAt: true,
                // Include conteggio capitoli se esistono
                _count: {
                    select: {
                        Chapter: true
                    }
                }
            }
        });

        // Mappa i progetti per normalizzare il nome del campo _count.Chapter -> _count.chapters
        const mappedProjects = projects.map(project => ({
            ...project,
            _count: {
                chapters: project._count.Chapter
            }
        }));

        return NextResponse.json({
            success: true,
            projects: mappedProjects,
            total: mappedProjects.length
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Errore durante il recupero dei progetti' },
            { status: 500 }
        );
    }
}
