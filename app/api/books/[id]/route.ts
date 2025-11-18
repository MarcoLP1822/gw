/**
 * Books API - Get or Delete a specific book
 * GET /api/books/[id] - Get book details
 * DELETE /api/books/[id] - Delete book
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExportService } from '@/lib/services/book-export-service';
import { logger } from '@/lib/logger';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const book = await BookExportService.getBook(id);

        if (!book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(book, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        logger.error('Failed to fetch book', error);
        return NextResponse.json(
            { error: 'Failed to fetch book' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await BookExportService.deleteBook(id);

        return NextResponse.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        logger.error('Failed to delete book', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to delete book';
        const statusCode = errorMessage === 'Libro non trovato' ? 404 : 500;

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
