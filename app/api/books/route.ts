/**
 * Books API - List all exported books
 * GET /api/books
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { BookExportService } from '@/lib/services/book-export-service';

export async function GET(request: NextRequest) {
    try {
        const books = await BookExportService.listAvailableBooks();

        return NextResponse.json(books, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        logger.error('Failed to fetch books', error);
        return NextResponse.json(
            { error: 'Failed to fetch books' },
            { status: 500 }
        );
    }
}
