import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocxGenerator } from '@/lib/export/docx-generator';
import { Packer } from 'docx';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Recupera progetto con tutti i capitoli
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                Chapter: {
                    orderBy: {
                        chapterNumber: 'asc',
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            );
        }

        // Verifica che ci siano capitoli
        if (!project.Chapter || project.Chapter.length === 0) {
            return NextResponse.json(
                { error: 'Nessun capitolo disponibile per l\'esportazione' },
                { status: 400 }
            );
        }

        // Genera documento DOCX
        const doc = DocxGenerator.generateDocument(project, {
            includeTableOfContents: true,
            includeCoverPage: true,
            includeAuthorBio: true,
            pageNumbering: true,
        });

        // Converti in buffer
        const buffer = await Packer.toBuffer(doc);

        // Genera nome file
        const fileName = DocxGenerator.generateFileName(project);

        // Ritorna il file
        return new NextResponse(Buffer.from(buffer), {
            headers: {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Export DOCX error:', error);
        return NextResponse.json(
            { error: 'Errore durante l\'esportazione del documento' },
            { status: 500 }
        );
    }
}
