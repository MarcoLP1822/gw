/**
 * API Routes for Style Guide Management
 * 
 * GET /api/projects/[id]/style-guide - Get active style guide
 * PUT /api/projects/[id]/style-guide - Save custom style guide
 */

import { NextRequest, NextResponse } from 'next/server';
import { StyleGuideService } from '@/lib/services/style-guide-service';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get active style guide for project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;

        const styleGuide = await StyleGuideService.getActiveStyleGuide(projectId);

        return NextResponse.json({
            success: true,
            styleGuide,
            hasStyleGuide: !!styleGuide,
        });
    } catch (error) {
        logger.error('Error fetching style guide', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante il caricamento dello style guide',
            },
            { status: 500 }
        );
    }
}

// PUT - Save or update custom style guide
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;
        const { styleGuide } = await request.json();

        if (typeof styleGuide !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Style guide deve essere una stringa',
                },
                { status: 400 }
            );
        }

        const success = await StyleGuideService.saveCustomStyleGuide(
            projectId,
            styleGuide
        );

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Errore durante il salvataggio dello style guide',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Style guide salvato con successo',
        });
    } catch (error) {
        logger.error('Error saving style guide', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante il salvataggio dello style guide',
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete custom style guide
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = id;

        const success = await StyleGuideService.deleteCustomStyleGuide(projectId);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Errore durante l\'eliminazione dello style guide',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Style guide personalizzato eliminato con successo',
        });
    } catch (error) {
        logger.error('Error deleting style guide', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore durante l\'eliminazione dello style guide',
            },
            { status: 500 }
        );
    }
}
