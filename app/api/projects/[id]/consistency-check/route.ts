import { NextRequest, NextResponse } from 'next/server';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { logger } from '@/lib/logger';

/**
 * POST /api/projects/[id]/consistency-check
 * Esegue il consistency check finale su tutto il libro
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;

        logger.info('🔍 Running consistency check', { projectId });

        const report = await chapterGenerationService.finalConsistencyCheck(projectId);

        return NextResponse.json({
            success: true,
            report,
            message: 'Consistency check completato',
        });
    } catch (error: any) {
        logger.error('Error in consistency check', error);

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { prisma } = await import('@/lib/db');
        const projectId = id;

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
        logger.error('Error fetching consistency report', error);

        return NextResponse.json(
            { error: 'Errore durante il recupero del report' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/projects/[id]/consistency-check
 * Cancella tutti i consistency report per il progetto
 * (Da usare quando si modifica o rigenera un capitolo)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { prisma } = await import('@/lib/db');
        const projectId = id;

        const deleted = await prisma.consistencyReport.deleteMany({
            where: { projectId },
        });

        logger.info('🗑️ Deleted consistency reports', { projectId, count: deleted.count });

        return NextResponse.json({
            success: true,
            deleted: deleted.count,
            message: 'Consistency report cancellato - rigenerabile dopo le modifiche',
        });
    } catch (error: any) {
        logger.error('Error deleting consistency report', error);

        return NextResponse.json(
            { error: 'Errore durante la cancellazione del report' },
            { status: 500 }
        );
    }
}
