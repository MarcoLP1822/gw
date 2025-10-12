import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Recupera statistiche reali dal database
        const [
            totalProjects,
            activeProjects,
            completedProjects,
            totalUsers,
            projectsThisMonth,
            completedThisMonth
        ] = await Promise.all([
            // Totale progetti
            prisma.project.count(),

            // Progetti attivi (non completati)
            prisma.project.count({
                where: {
                    status: {
                        in: ['draft', 'generating_outline', 'generating_chapters']
                    }
                }
            }),

            // Progetti completati
            prisma.project.count({
                where: {
                    status: 'completed'
                }
            }),

            // Totale utenti
            prisma.user.count(),

            // Progetti creati questo mese
            prisma.project.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Progetti completati questo mese
            prisma.project.count({
                where: {
                    status: 'completed',
                    updatedAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            })
        ]);

        // Calcola progetti in scadenza (progetti attivi creati da più di 30 giorni)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const projectsNearDeadline = await prisma.project.count({
            where: {
                status: {
                    in: ['draft', 'generating_outline', 'generating_chapters']
                },
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalProjects,
                activeProjects,
                completedProjects,
                totalUsers,
                projectsThisMonth,
                completedThisMonth,
                projectsNearDeadline
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
