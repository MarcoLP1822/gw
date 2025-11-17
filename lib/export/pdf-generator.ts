/**
 * PDF Generator
 * Genera PDF professionale del libro completo
 * Parallelo a DocxGenerator (DRY principle)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Chapter } from '@prisma/client';

interface PdfExportOptions {
    includeTableOfContents?: boolean;
    includeCoverPage?: boolean;
    includeAuthorBio?: boolean;
    pageNumbering?: boolean;
}

export class PdfGenerator {
    /**
     * Genera PDF completo
     * Returns Buffer for server-side usage
     */
    static async generateDocument(
        project: Project & { Chapter: Chapter[] },
        options: PdfExportOptions = {}
    ): Promise<Buffer> {
        const {
            includeTableOfContents = true,
            includeCoverPage = true,
            includeAuthorBio = true,
            pageNumbering = true,
        } = options;

        // Initialize jsPDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Remove first empty page
        let isFirstPage = true;

        // 1. Cover Page
        if (includeCoverPage) {
            if (!isFirstPage) doc.addPage();
            this.addCoverPage(doc, project);
            isFirstPage = false;
        }

        // 2. Copyright Page
        if (!isFirstPage) doc.addPage();
        this.addCopyrightPage(doc, project);
        isFirstPage = false;

        // 3. Table of Contents
        if (includeTableOfContents) {
            if (!isFirstPage) doc.addPage();
            this.addTableOfContents(doc, project.Chapter);
            isFirstPage = false;
        }

        // 4. Chapters
        const sortedChapters = [...project.Chapter].sort(
            (a, b) => a.chapterNumber - b.chapterNumber
        );

        for (const chapter of sortedChapters) {
            if (!isFirstPage) doc.addPage();
            this.addChapter(doc, chapter);
            isFirstPage = false;
        }

        // 5. Author Bio
        if (includeAuthorBio && project.authorName) {
            doc.addPage();
            this.addAuthorBio(doc, project);
        }

        // Add page numbers if requested
        if (pageNumbering) {
            this.addPageNumbers(doc);
        }

        // Return as Buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return pdfBuffer;
    }

    /**
     * Genera filename (riusa pattern da DocxGenerator)
     */
    static generateFileName(project: Project): string {
        const titleSlug = project.bookTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const date = new Date().toISOString().split('T')[0];
        return `${titleSlug}-${date}.pdf`;
    }

    /**
     * Aggiungi pagina di copertina
     */
    private static addCoverPage(doc: jsPDF, project: Project): void {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Title
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(project.bookTitle, pageWidth - 40);
        let yPos = pageHeight / 3;
        titleLines.forEach((line: string) => {
            const textWidth = doc.getTextWidth(line);
            doc.text(line, (pageWidth - textWidth) / 2, yPos);
            yPos += 12;
        });

        // Subtitle
        if (project.bookSubtitle) {
            doc.setFontSize(20);
            doc.setFont('helvetica', 'italic');
            const subtitleLines = doc.splitTextToSize(project.bookSubtitle, pageWidth - 40);
            yPos += 10;
            subtitleLines.forEach((line: string) => {
                const textWidth = doc.getTextWidth(line);
                doc.text(line, (pageWidth - textWidth) / 2, yPos);
                yPos += 8;
            });
        }

        // Author
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        const authorText = project.authorName;
        const authorWidth = doc.getTextWidth(authorText);
        doc.text(authorText, (pageWidth - authorWidth) / 2, pageHeight - 40);
    }

    /**
     * Aggiungi pagina copyright
     */
    private static addCopyrightPage(doc: jsPDF, project: Project): void {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const copyrightText = `© ${new Date().getFullYear()} ${project.authorName}`;
        doc.text(copyrightText, 20, 20);
        doc.text('Tutti i diritti riservati.', 20, 28);

        if (project.company) {
            doc.text(project.company, 20, 36);
        }
    }

    /**
     * Aggiungi indice
     */
    private static addTableOfContents(doc: jsPDF, chapters: Chapter[]): void {
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const titleText = 'Indice';
        const titleWidth = doc.getTextWidth(titleText);
        doc.text(titleText, (pageWidth - titleWidth) / 2, 30);

        // Chapters list
        let yPos = 50;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        const sortedChapters = [...chapters].sort(
            (a, b) => a.chapterNumber - b.chapterNumber
        );

        sortedChapters.forEach((chapter) => {
            const chapterText = `Capitolo ${chapter.chapterNumber}: ${chapter.title}`;
            const lines = doc.splitTextToSize(chapterText, pageWidth - 50);

            lines.forEach((line: string) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 30;
                }
                doc.text(line, 25, yPos);
                yPos += 7;
            });

            yPos += 3; // Extra spacing between chapters
        });
    }

    /**
     * Aggiungi capitolo
     */
    private static addChapter(doc: jsPDF, chapter: Chapter): void {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPos = 20;

        // Chapter number
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(`Capitolo ${chapter.chapterNumber}`, margin, yPos);
        yPos += 10;

        // Chapter title
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        const titleLines = doc.splitTextToSize(chapter.title, maxWidth);
        titleLines.forEach((line: string) => {
            doc.text(line, margin, yPos);
            yPos += 8;
        });
        yPos += 10;

        // Chapter content
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        // Split content into paragraphs
        const paragraphs = chapter.content.split('\n\n');

        paragraphs.forEach((paragraph) => {
            if (!paragraph.trim()) return;

            const lines = doc.splitTextToSize(paragraph, maxWidth);

            lines.forEach((line: string) => {
                // Check if we need a new page
                if (yPos > pageHeight - 30) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.text(line, margin, yPos);
                yPos += 6;
            });

            // Add spacing between paragraphs
            yPos += 4;
        });
    }

    /**
     * Aggiungi biografia autore
     */
    private static addAuthorBio(doc: jsPDF, project: Project): void {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPos = 30;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const titleText = "Sull'Autore";
        const titleWidth = doc.getTextWidth(titleText);
        doc.text(titleText, (pageWidth - titleWidth) / 2, yPos);
        yPos += 15;

        // Author name
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(project.authorName, margin, yPos);
        yPos += 10;

        // Author role and company
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (project.authorRole) {
            doc.text(project.authorRole, margin, yPos);
            yPos += 7;
        }

        if (project.company) {
            doc.text(project.company, margin, yPos);
            yPos += 10;
        }

        // Business goals / bio
        if (project.businessGoals) {
            yPos += 5;
            const bioLines = doc.splitTextToSize(project.businessGoals, maxWidth);
            bioLines.forEach((line: string) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 30;
                }
                doc.text(line, margin, yPos);
                yPos += 6;
            });
        }

        // Unique value proposition
        if (project.uniqueValue) {
            yPos += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Valore Unico:', margin, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            const valueLines = doc.splitTextToSize(project.uniqueValue, maxWidth);
            valueLines.forEach((line: string) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 30;
                }
                doc.text(line, margin, yPos);
                yPos += 6;
            });
        }
    }

    /**
     * Aggiungi numeri di pagina a tutte le pagine
     */
    private static addPageNumbers(doc: jsPDF): void {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight(); doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = `${i}`;
            const textWidth = doc.getTextWidth(pageText);
            doc.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 10);
        }
    }
}
