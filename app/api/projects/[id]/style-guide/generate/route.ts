/**
 * API Route to Generate Style Guide from Documents
 * 
 * POST /api/projects/[id]/style-guide/generate - Generate style guide from uploaded documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { StyleGuideService } from '@/lib/services/style-guide-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Generate style guide from uploaded documents using AI
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;

        const result = await StyleGuideService.generateFromDocuments(projectId);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Errore durante la generazione dello style guide',
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            styleGuide: result.styleGuide,
            source: result.source,
            message: 'Style guide generato con successo',
        });
    } catch (error) {
        console.error('Error generating style guide:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante la generazione dello style guide',
            },
            { status: 500 }
        );
    }
}
