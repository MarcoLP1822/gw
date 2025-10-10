import { NextRequest, NextResponse } from 'next/server';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';

/**
 * POST /api/projects/[id]/consistency-check
 * Esegue il consistency check finale su tutto il libro
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        console.log(`🔍 Running consistency check for project ${projectId}`);

        const report = await chapterGenerationService.finalConsistencyCheck(projectId);

        return NextResponse.json({
            success: true,
            report,
            message: 'Consistency check completato',
        });
    } catch (error: any) {
        console.error('Error in consistency check:', error);

        return NextResponse.json(
            {
                error: error.message || 'Errore durante il consistency check',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/projects/[id]/consistency-check
 * Recupera l'ultimo consistency report
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { prisma } = await import('@/lib/db');
        const projectId = params.id;

        const report = await prisma.consistencyReport.findFirst({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });

        if (!report) {
            return NextResponse.json(
                { error: 'Nessun report trovato' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            report: report.report,  // Restituisce il contenuto del campo report
            overallScore: report.overallScore,
            createdAt: report.createdAt
        });
    } catch (error: any) {
        console.error('Error fetching consistency report:', error);

        return NextResponse.json(
            { error: 'Errore durante il recupero del report' },
            { status: 500 }
        );
    }
}
