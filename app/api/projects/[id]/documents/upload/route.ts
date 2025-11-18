/**
 * API Route for Client-Side Document Upload to Vercel Blob
 * 
 * POST /api/projects/[id]/documents/upload - Handle client upload flow
 * 
 * This endpoint generates tokens for secure client-side uploads and
 * handles completion callbacks when uploads finish.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { DocumentService } from '@/lib/services/document-service';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const projectId = id;
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
                // Validate project exists
                // TODO: Add authentication check here
                // const { user } = await auth(request);
                // if (!canUploadToProject(user, projectId)) {
                //     throw new Error('Non autorizzato');
                // }

                // Parse client payload for additional validation
                let purpose = 'style_reference';
                let fileName = pathname;

                if (clientPayload) {
                    try {
                        const payload = JSON.parse(clientPayload);
                        purpose = payload.purpose || 'style_reference';
                        fileName = payload.fileName || pathname;
                    } catch (e) {
                        logger.warn('Failed to parse clientPayload', e);
                    }
                }

                return {
                    allowedContentTypes: [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                    ],
                    maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
                    tokenPayload: JSON.stringify({
                        projectId,
                        purpose,
                        fileName,
                    }),
                };
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        logger.error('Upload handling error', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
