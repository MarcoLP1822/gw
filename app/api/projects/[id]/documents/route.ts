/**
 * API Routes for Project Documents
 * 
 * POST   /api/projects/[id]/documents - Upload a document
 * GET    /api/projects/[id]/documents - List all documents for project
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/services/document-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Note: Body size limit is now handled by Vercel Blob client upload
// No need for bodyParser config in App Router

// GET - List all documents for a project
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        const documents = await DocumentService.getProjectDocuments(projectId);

        return NextResponse.json(
            {
                success: true,
                documents,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante il caricamento dei documenti',
            },
            { status: 500 }
        );
    }
}

// POST - Upload a document
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const purpose = (formData.get('purpose') as string) || 'style_reference';

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Nessun file fornito',
                },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload document
        const result = await DocumentService.uploadDocument({
            projectId,
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                buffer,
            },
            purpose: purpose as 'style_reference' | 'content_reference',
        });

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                document: result.document,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante il caricamento del documento',
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
