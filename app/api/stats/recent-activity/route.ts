import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Recupera gli ultimi 10 progetti aggiornati di recente
        const recentProjects = await prisma.project.findMany({
            take: 10,
            orderBy: {
                updatedAt: 'desc'
            },
            select: {
                id: true,
                bookTitle: true,
                authorName: true,
                status: true,
                updatedAt: true,
                createdAt: true
            }
        });

        // Recupera i log di generazione più recenti
        const recentLogs = await prisma.generationLog.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                Project: {
                    select: {
                        bookTitle: true
                    }
                }
            }
        });

        // Combina e formatta le attività
        const activities = [
            ...recentProjects.map(project => ({
                id: project.id,
                type: project.status === 'completed' ? 'completed' : 'updated',
                title: project.bookTitle,
                author: project.authorName,
                status: project.status,
                timestamp: project.updatedAt,
                description: getActivityDescription(project)
            })),
            ...recentLogs.map(log => ({
                id: log.id,
                type: 'generation',
                title: log.Project.bookTitle,
                status: log.success ? 'success' : 'error',
                timestamp: log.createdAt,
                description: `${log.step} - ${log.success ? 'Completato' : log.errorMessage || 'Errore'}`
            }))
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return NextResponse.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recent activity' },
            { status: 500 }
        );
    }
}

function getActivityDescription(project: { status: string; createdAt: Date; updatedAt: Date }) {
    const isNew = new Date().getTime() - project.createdAt.getTime() < 24 * 60 * 60 * 1000;

    switch (project.status) {
        case 'completed':
            return 'Progetto completato';
        case 'generating_chapters':
            return 'Generazione capitoli in corso';
        case 'generating_outline':
            return 'Generazione outline in corso';
        case 'draft':
            return isNew ? 'Nuovo progetto creato' : 'Progetto in bozza';
        case 'error':
            return 'Errore nella generazione';
        default:
            return 'Progetto aggiornato';
    }
}
