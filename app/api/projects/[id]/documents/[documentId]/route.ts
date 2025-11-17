/**
 * API Routes for Single Document Operations
 * 
 * GET    /api/projects/[id]/documents/[documentId] - Get document details
 * DELETE /api/projects/[id]/documents/[documentId] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/services/document-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get document details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        const { id, documentId } = await params;
        const document = await DocumentService.getDocument(documentId);

        if (!document) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Documento non trovato',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            document,
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante il caricamento del documento',
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete document
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        const { id, documentId } = await params;
        const success = await DocumentService.deleteDocument(documentId);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Errore durante l\'eliminazione del documento',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Documento eliminato con successo',
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante l\'eliminazione del documento',
            },
            { status: 500 }
        );
    }
}
