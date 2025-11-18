/**
 * Books API - Mark book as accessed
 * POST /api/books/[id]/access
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExportService } from '@/lib/services/book-export-service';
import { logger } from '@/lib/logger';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await BookExportService.markAsAccessed(id);

        return NextResponse.json({
            success: true,
            message: 'Book marked as accessed'
        });
    } catch (error) {
        logger.error('Failed to mark book as accessed', error);
        return NextResponse.json(
            { error: 'Failed to mark book as accessed' },
            { status: 500 }
        );
    }
}
