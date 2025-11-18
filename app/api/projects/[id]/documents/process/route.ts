/**
 * API Route for Processing Uploaded Blob
 * 
 * POST /api/projects/[id]/documents/process - Process uploaded blob document
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/services/document-service';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;
        const body = await request.json();
        const { blobUrl, fileName, purpose } = body;

        if (!blobUrl || !fileName) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'blobUrl e fileName sono richiesti',
                },
                { status: 400 }
            );
        }

        // Process the document from blob URL
        const result = await DocumentService.uploadDocumentFromBlob({
            projectId,
            blobUrl,
            fileName,
            purpose: purpose || 'style_reference',
        });

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            document: result.document,
        });
    } catch (error) {
        logger.error('Error processing document', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante l\'elaborazione del documento',
            },
            { status: 500 }
        );
    }
}
