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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const projectId = params.id;
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
                        console.warn('Failed to parse clientPayload:', e);
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
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called when the upload completes successfully
                console.log('Blob upload completed:', blob.url);

                try {
                    // Parse the token payload
                    if (!tokenPayload) {
                        throw new Error('Token payload mancante');
                    }
                    const payload = JSON.parse(tokenPayload);
                    const { projectId, purpose, fileName } = payload;

                    // Store document metadata in database
                    // Note: We now store the blob URL instead of processing the file
                    await DocumentService.uploadDocumentFromBlob({
                        projectId,
                        blobUrl: blob.url,
                        fileName,
                        purpose: purpose as 'style_reference' | 'content_reference',
                    });

                    console.log('Document metadata stored successfully');
                } catch (error) {
                    console.error('Error storing document metadata:', error);
                    throw new Error('Impossibile salvare i metadati del documento');
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('Upload handling error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
