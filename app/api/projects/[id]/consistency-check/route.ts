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

/**
 * DELETE /api/projects/[id]/consistency-check
 * Cancella tutti i consistency report per il progetto
 * (Da usare quando si modifica o rigenera un capitolo)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { prisma } = await import('@/lib/db');
        const projectId = params.id;

        const deleted = await prisma.consistencyReport.deleteMany({
            where: { projectId },
        });

        console.log(`🗑️ Deleted ${deleted.count} consistency report(s) for project ${projectId}`);

        return NextResponse.json({
            success: true,
            deleted: deleted.count,
            message: 'Consistency report cancellato - rigenerabile dopo le modifiche',
        });
    } catch (error: any) {
        console.error('Error deleting consistency report:', error);

        return NextResponse.json(
            { error: 'Errore durante la cancellazione del report' },
            { status: 500 }
        );
    }
}
