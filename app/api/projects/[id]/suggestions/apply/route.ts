import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { ConsistencyIssue } from '@/types';

/**
 * POST /api/projects/[id]/suggestions/apply
 * Applica o genera preview di un suggerimento del consistency check
 * 
 * Body:
 * {
 *   issue: ConsistencyIssue,
 *   chapterNumber: number,
 *   preview: boolean  // true = solo diff, false = apply
 * }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const body = await request.json();

        const { issue, chapterNumber, preview = true, customContent } = body as {
            issue: ConsistencyIssue;
            chapterNumber: number;
            preview: boolean;
            customContent?: string;
        };

        // Validation
        if (!issue || !chapterNumber) {
            return NextResponse.json(
                { error: 'Parametri mancanti: issue e chapterNumber richiesti' },
                { status: 400 }
            );
        }

        if (!issue.chapter || !issue.description || !issue.suggestion) {
            return NextResponse.json(
                { error: 'Issue malformato: chapter, description e suggestion richiesti' },
                { status: 400 }
            );
        }

        logger.info('📝 Suggestion apply request', {
            projectId,
            chapterNumber,
            preview,
            issueType: issue.type,
            issueSeverity: issue.severity,
            hasCustomContent: !!customContent
        });

        // Se c'è customContent e non è preview, applica direttamente
        let result;
        if (customContent && !preview) {
            result = await chapterGenerationService.applyCustomContent(
                projectId,
                chapterNumber,
                customContent
            );
        } else {
            // Altrimenti usa il flow normale con AI
            result = await chapterGenerationService.applySuggestion(
                projectId,
                chapterNumber,
                issue,
                preview
            );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        logger.info('✅ Suggestion request completed', {
            projectId,
            chapterNumber,
            preview,
            success: result.success
        });

        return NextResponse.json(result);

    } catch (error: any) {
        logger.error('Error in suggestion apply endpoint', error);

        return NextResponse.json(
            {
                error: error.message || 'Errore durante l\'applicazione del suggerimento',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
