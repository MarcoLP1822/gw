import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageBreak,
    TableOfContents,
    UnderlineType,
    convertInchesToTwip,
} from 'docx';
import { Project, Chapter } from '@prisma/client';

interface ExportOptions {
    includeTableOfContents?: boolean;
    includeCoverPage?: boolean;
    includeAuthorBio?: boolean;
    pageNumbering?: boolean;
}

export class DocxGenerator {
    /**
     * Genera un documento DOCX completo dal progetto e i suoi capitoli
     */
    static generateDocument(
        project: Project & { Chapter: Chapter[] },
        options: ExportOptions = {}
    ): Document {
        const {
            includeTableOfContents = true,
            includeCoverPage = true,
            includeAuthorBio = true,
            pageNumbering = true,
        } = options;

        const sections: any[] = [];

        // 1. Cover Page
        if (includeCoverPage) {
            sections.push(...this.createCoverPage(project));
        }

        // 2. Copyright/Dedica Page
        sections.push(...this.createCopyrightPage(project));

        // 3. Table of Contents
        if (includeTableOfContents) {
            sections.push(...this.createTableOfContents());
        }

        // 4. Chapters
        const sortedChapters = [...project.Chapter].sort(
            (a, b) => a.chapterNumber - b.chapterNumber
        );

        sortedChapters.forEach((chapter, index) => {
            sections.push(...this.createChapter(chapter, index > 0));
        });

        // 5. Author Bio (se disponibile)
        if (includeAuthorBio && project.authorName) {
            sections.push(...this.createAuthorBio(project));
        }

        // Crea documento
        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: convertInchesToTwip(1),
                                right: convertInchesToTwip(1),
                                bottom: convertInchesToTwip(1),
                                left: convertInchesToTwip(1),
                            },
                            pageNumbers: pageNumbering
                                ? {
                                    start: 1,
                                    formatType: 'decimal',
                                }
                                : undefined,
                        },
                    },
                    children: sections,
                },
            ],
        });

        return doc;
    }

    /**
     * Crea la pagina di copertina
     */
    private static createCoverPage(project: Project): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        // Spaziatura iniziale
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: '' }));

        // Titolo del libro
        paragraphs.push(
            new Paragraph({
                text: project.bookTitle,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 400,
                },
                children: [
                    new TextRun({
                        text: project.bookTitle,
                        bold: true,
                        size: 48, // 24pt
                        font: 'Calibri',
                    }),
                ],
            })
        );

        // Sottotitolo (se presente)
        if (project.bookSubtitle) {
            paragraphs.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 800,
                    },
                    children: [
                        new TextRun({
                            text: project.bookSubtitle,
                            italics: true,
                            size: 28, // 14pt
                            font: 'Calibri',
                        }),
                    ],
                })
            );
        }

        // Spaziatura
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: '' }));

        // Nome autore
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                    before: 400,
                },
                children: [
                    new TextRun({
                        text: project.authorName,
                        size: 32, // 16pt
                        font: 'Calibri',
                    }),
                ],
            })
        );

        // Ruolo/Azienda (se presente)
        if (project.authorRole || project.company) {
            const authorInfo = [project.authorRole, project.company]
                .filter(Boolean)
                .join(' at ');

            paragraphs.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        before: 200,
                    },
                    children: [
                        new TextRun({
                            text: authorInfo,
                            size: 24, // 12pt
                            italics: true,
                            font: 'Calibri',
                        }),
                    ],
                })
            );
        }

        // Page break
        paragraphs.push(
            new Paragraph({
                children: [new PageBreak()],
            })
        );

        return paragraphs;
    }

    /**
     * Crea la pagina copyright/dedica
     */
    private static createCopyrightPage(project: Project): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `© ${new Date().getFullYear()} ${project.authorName}`,
                        size: 20,
                        font: 'Calibri',
                    }),
                ],
                spacing: {
                    after: 200,
                },
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Tutti i diritti riservati.',
                        size: 20,
                        font: 'Calibri',
                    }),
                ],
                spacing: {
                    after: 400,
                },
            })
        );

        // Page break
        paragraphs.push(
            new Paragraph({
                children: [new PageBreak()],
            })
        );

        return paragraphs;
    }

    /**
     * Crea l'indice
     */
    private static createTableOfContents(): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        paragraphs.push(
            new Paragraph({
                text: 'Indice',
                heading: HeadingLevel.HEADING_1,
                spacing: {
                    after: 400,
                },
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [new TableOfContents('Indice', { hyperlink: true, headingStyleRange: '1-3' })],
            })
        );

        // Page break
        paragraphs.push(
            new Paragraph({
                children: [new PageBreak()],
            })
        );

        return paragraphs;
    }

    /**
     * Crea un capitolo
     */
    private static createChapter(chapter: Chapter, addPageBreak: boolean): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        // Page break prima del capitolo (eccetto il primo)
        if (addPageBreak) {
            paragraphs.push(
                new Paragraph({
                    children: [new PageBreak()],
                })
            );
        }

        // Titolo capitolo
        paragraphs.push(
            new Paragraph({
                text: `Capitolo ${chapter.chapterNumber}`,
                heading: HeadingLevel.HEADING_2,
                spacing: {
                    before: 400,
                    after: 200,
                },
            })
        );

        paragraphs.push(
            new Paragraph({
                text: chapter.title,
                heading: HeadingLevel.HEADING_1,
                spacing: {
                    after: 400,
                },
            })
        );

        // Contenuto del capitolo
        // Dividi il contenuto in paragrafi (separated by double newlines)
        const contentParagraphs = chapter.content
            .split('\n\n')
            .filter((p) => p.trim().length > 0);

        contentParagraphs.forEach((content) => {
            // Gestisci grassetto, corsivo, etc. (basic markdown)
            const children = this.parseMarkdownToRuns(content);

            paragraphs.push(
                new Paragraph({
                    children,
                    spacing: {
                        after: 240, // spacing tra paragrafi
                    },
                    alignment: AlignmentType.JUSTIFIED,
                })
            );
        });

        return paragraphs;
    }

    /**
     * Parse basic markdown to TextRuns
     */
    private static parseMarkdownToRuns(text: string): TextRun[] {
        const runs: TextRun[] = [];

        // Per ora, creiamo un singolo run con il testo
        // In futuro possiamo aggiungere parsing di **bold**, *italic*, etc.
        runs.push(
            new TextRun({
                text: text,
                size: 24, // 12pt
                font: 'Calibri',
            })
        );

        return runs;
    }

    /**
     * Crea la pagina "About the Author"
     */
    private static createAuthorBio(project: Project): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        // Page break
        paragraphs.push(
            new Paragraph({
                children: [new PageBreak()],
            })
        );

        paragraphs.push(
            new Paragraph({
                text: "Sull'Autore",
                heading: HeadingLevel.HEADING_1,
                spacing: {
                    after: 400,
                },
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: project.authorName,
                        bold: true,
                        size: 24,
                        font: 'Calibri',
                    }),
                ],
                spacing: {
                    after: 200,
                },
            })
        );

        // Informazioni autore
        const authorInfo: string[] = [];
        if (project.authorRole) authorInfo.push(`Ruolo: ${project.authorRole}`);
        if (project.company) authorInfo.push(`Azienda: ${project.company}`);
        if (project.industry) authorInfo.push(`Settore: ${project.industry}`);

        if (authorInfo.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: authorInfo.join(' | '),
                            size: 22,
                            font: 'Calibri',
                        }),
                    ],
                    spacing: {
                        after: 400,
                    },
                })
            );
        }

        // Business goals come bio
        if (project.businessGoals) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: project.businessGoals,
                            size: 24,
                            font: 'Calibri',
                        }),
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                })
            );
        }

        return paragraphs;
    }

    /**
     * Genera il nome del file
     */
    static generateFileName(project: Project): string {
        const titleSlug = project.bookTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const date = new Date().toISOString().split('T')[0];
        return `${titleSlug}-${date}.docx`;
    }
}
