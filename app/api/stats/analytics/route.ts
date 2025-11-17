import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Calcola statistiche mensili per gli ultimi 6 mesi
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const projects = await prisma.project.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                id: true,
                createdAt: true,
                status: true,
                updatedAt: true,
                Chapter: {
                    select: {
                        id: true,
                        wordCount: true
                    }
                }
            }
        });

        // Raggruppa per mese
        const monthlyData = new Map<string, { projects: number; completed: number; words: number }>();

        projects.forEach(project => {
            const month = project.createdAt.toLocaleString('it-IT', { month: 'short' });
            const key = `${month}-${project.createdAt.getFullYear()}`;

            if (!monthlyData.has(key)) {
                monthlyData.set(key, { projects: 0, completed: 0, words: 0 });
            }

            const data = monthlyData.get(key)!;
            data.projects++;

            if (project.status === 'completed') {
                data.completed++;
            }

            const totalWords = project.Chapter.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
            data.words += totalWords;
        });

        // Converti in array ordinato
        const monthlyStats = Array.from(monthlyData.entries())
            .map(([key, data]) => ({
                month: key.split('-')[0],
                year: parseInt(key.split('-')[1]),
                ...data
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
            })
            .slice(-6); // Ultimi 6 mesi

        // Top autori/progetti
        const topProjects = await prisma.project.findMany({
            take: 5,
            orderBy: {
                Chapter: {
                    _count: 'desc'
                }
            },
            select: {
                id: true,
                bookTitle: true,
                authorName: true,
                status: true,
                _count: {
                    select: {
                        Chapter: true
                    }
                },
                Chapter: {
                    select: {
                        wordCount: true
                    }
                }
            }
        });

        const topProjectsFormatted = topProjects.map(project => ({
            id: project.id,
            title: project.bookTitle,
            author: project.authorName,
            chapters: project._count.Chapter,
            totalWords: project.Chapter.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
            status: project.status
        }));

        // Statistiche generali
        const totalWords = await prisma.chapter.aggregate({
            _sum: {
                wordCount: true
            }
        });

        const averageChapterLength = await prisma.chapter.aggregate({
            _avg: {
                wordCount: true
            }
        });

        return NextResponse.json({
            success: true,
            analytics: {
                monthlyData: monthlyStats,
                topProjects: topProjectsFormatted,
                totalWords: totalWords._sum.wordCount || 0,
                averageChapterLength: Math.round(averageChapterLength._avg.wordCount || 0)
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
