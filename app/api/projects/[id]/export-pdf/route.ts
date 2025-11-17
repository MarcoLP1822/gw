/**
 * PDF Export API
 * Genera PDF + Download + Auto-Save to Flipbook
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PdfGenerator } from '@/lib/export/pdf-generator';
import { put } from '@vercel/blob';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch project + chapters
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                Chapter: {
                    where: { status: 'completed' },
                    orderBy: { chapterNumber: 'asc' },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        if (!project.Chapter || project.Chapter.length === 0) {
            return NextResponse.json(
                { error: 'Nessun capitolo disponibile per l\'esportazione' },
                { status: 400 }
            );
        }

        // 2. Generate PDF
        const buffer = await PdfGenerator.generateDocument(project, {
            includeTableOfContents: true,
            includeCoverPage: true,
            includeAuthorBio: true,
            pageNumbering: true,
        });

        const fileName = PdfGenerator.generateFileName(project);

        // 3. AUTO-SAVE to Vercel Blob + Supabase (for Flipbook)
        try {
            const uint8Array = new Uint8Array(buffer);
            const blob = new Blob([uint8Array], { type: 'application/pdf' });
            const { url } = await put(fileName, blob, {
                access: 'public',
                addRandomSuffix: true,
            });            // Calculate metadata
            const totalWords = project.Chapter.reduce(
                (sum, ch) => sum + (ch.wordCount || 0),
                0
            );

            // Check existing version
            const existingBook = await prisma.exportedBook.findFirst({
                where: { projectId: id },
                orderBy: { version: 'desc' },
            });

            // Save to Supabase
            await prisma.exportedBook.create({
                data: {
                    id: `${id}-v${existingBook ? existingBook.version + 1 : 1}`,
                    projectId: id,
                    title: project.bookTitle,
                    fileName,
                    fileUrl: url,
                    fileSizeBytes: buffer.length,
                    format: 'pdf',
                    version: existingBook ? existingBook.version + 1 : 1,
                    chaptersCount: project.Chapter.length,
                    totalWords,
                    totalPages: Math.ceil(totalWords / 250),
                    status: 'ready',
                },
            });

            console.log(`✅ PDF auto-saved to Flipbook: ${url}`);
        } catch (saveError) {
            // Log error but don't fail the download
            console.error('❌ Failed to save PDF to Flipbook:', saveError);
        }

        // 4. Return PDF for download
        const responseBuffer = new Uint8Array(buffer);
        return new NextResponse(responseBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Export PDF error:', error);
        return NextResponse.json(
            { error: 'Errore durante l\'esportazione del PDF' },
            { status: 500 }
        );
    }
}
