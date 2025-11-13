/**
 * Document Service
 * 
 * Business logic for managing project documents
 */

import { prisma } from '@/lib/db';
import { getExtractorForFile } from '../document-processing/text-extractor';
import type { ProjectDocument } from '@prisma/client';

export interface UploadDocumentParams {
    projectId: string;
    file: {
        name: string;
        type: string;
        size: number;
        buffer: Buffer;
    };
    purpose?: 'style_reference' | 'content_reference';
}

export interface UploadDocumentFromBlobParams {
    projectId: string;
    blobUrl: string;
    fileName: string;
    purpose?: 'style_reference' | 'content_reference';
}

export interface UploadDocumentResult {
    document: ProjectDocument;
    success: boolean;
    error?: string;
}

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENTS_PER_PROJECT = 5;
const MAX_TOTAL_WORDS = 50000; // Max 50k words total across all docs

export class DocumentService {
    /**
     * Upload and process a document from Vercel Blob URL
     */
    static async uploadDocumentFromBlob(
        params: UploadDocumentFromBlobParams
    ): Promise<UploadDocumentResult> {
        try {
            // Check document limit
            const existingDocsCount = await prisma.projectDocument.count({
                where: { projectId: params.projectId },
            });

            if (existingDocsCount >= MAX_DOCUMENTS_PER_PROJECT) {
                return {
                    document: null as any,
                    success: false,
                    error: `Massimo ${MAX_DOCUMENTS_PER_PROJECT} documenti per progetto`,
                };
            }

            // Fetch file from Vercel Blob
            const response = await fetch(params.blobUrl);
            if (!response.ok) {
                throw new Error('Impossibile scaricare il file da Vercel Blob');
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileSize = buffer.length;

            // Validate file size
            if (fileSize > MAX_FILE_SIZE) {
                return {
                    document: null as any,
                    success: false,
                    error: `File troppo grande. Massimo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                };
            }

            // Determine MIME type from file extension
            const ext = this.getFileExtension(params.fileName);
            const mimeTypeMap: Record<string, string> = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain',
            };
            const mimeType = mimeTypeMap[ext] || 'application/octet-stream';

            // Extract text from file
            const extractor = await getExtractorForFile(mimeType, params.fileName);

            if (!extractor.supports(mimeType, params.fileName)) {
                return {
                    document: null as any,
                    success: false,
                    error: 'Tipo di file non supportato. Usa PDF, DOCX o TXT',
                };
            }

            const extraction = await extractor.extract(buffer, params.fileName);

            // Check total word limit
            const existingWords = await prisma.projectDocument.aggregate({
                where: { projectId: params.projectId },
                _sum: { wordCount: true },
            });

            const totalWords = (existingWords._sum.wordCount || 0) + extraction.wordCount;

            if (totalWords > MAX_TOTAL_WORDS) {
                return {
                    document: null as any,
                    success: false,
                    error: `Limite parole superato. Massimo ${MAX_TOTAL_WORDS} parole totali`,
                };
            }

            // Save to database
            const document = await prisma.projectDocument.create({
                data: {
                    projectId: params.projectId,
                    originalFileName: params.fileName,
                    fileType: ext,
                    fileSizeBytes: fileSize,
                    extractedText: extraction.text,
                    wordCount: extraction.wordCount,
                    purpose: params.purpose || 'style_reference',
                    processingStatus: 'completed',
                },
            });

            return {
                document,
                success: true,
            };
        } catch (error) {
            console.error('Error uploading document from blob:', error);
            return {
                document: null as any,
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante il caricamento',
            };
        }
    }

    /**
     * Upload and process a document (legacy method for direct uploads)
     */
    static async uploadDocument(
        params: UploadDocumentParams
    ): Promise<UploadDocumentResult> {
        try {
            // Validate file size
            if (params.file.size > MAX_FILE_SIZE) {
                return {
                    document: null as any,
                    success: false,
                    error: `File troppo grande. Massimo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                };
            }

            // Check document limit
            const existingDocsCount = await prisma.projectDocument.count({
                where: { projectId: params.projectId },
            });

            if (existingDocsCount >= MAX_DOCUMENTS_PER_PROJECT) {
                return {
                    document: null as any,
                    success: false,
                    error: `Massimo ${MAX_DOCUMENTS_PER_PROJECT} documenti per progetto`,
                };
            }

            // Extract text from file
            const extractor = await getExtractorForFile(
                params.file.type,
                params.file.name
            );

            if (!extractor.supports(params.file.type, params.file.name)) {
                return {
                    document: null as any,
                    success: false,
                    error: 'Tipo di file non supportato. Usa PDF, DOCX o TXT',
                };
            }

            const extraction = await extractor.extract(
                params.file.buffer,
                params.file.name
            );

            // Check total word limit
            const existingWords = await prisma.projectDocument.aggregate({
                where: { projectId: params.projectId },
                _sum: { wordCount: true },
            });

            const totalWords = (existingWords._sum.wordCount || 0) + extraction.wordCount;

            if (totalWords > MAX_TOTAL_WORDS) {
                return {
                    document: null as any,
                    success: false,
                    error: `Limite parole superato. Massimo ${MAX_TOTAL_WORDS} parole totali`,
                };
            }

            // Save to database
            const document = await prisma.projectDocument.create({
                data: {
                    projectId: params.projectId,
                    originalFileName: params.file.name,
                    fileType: this.getFileExtension(params.file.name),
                    fileSizeBytes: params.file.size,
                    extractedText: extraction.text,
                    wordCount: extraction.wordCount,
                    purpose: params.purpose || 'style_reference',
                    processingStatus: 'completed',
                },
            });

            return {
                document,
                success: true,
            };
        } catch (error) {
            console.error('Error uploading document:', error);
            return {
                document: null as any,
                success: false,
                error: error instanceof Error ? error.message : 'Errore durante il caricamento',
            };
        }
    }

    /**
     * Get all documents for a project (without extracted text to avoid payload size issues)
     */
    static async getProjectDocuments(projectId: string): Promise<Omit<ProjectDocument, 'extractedText'>[]> {
        return prisma.projectDocument.findMany({
            where: { projectId },
            orderBy: { uploadedAt: 'desc' },
            select: {
                id: true,
                projectId: true,
                originalFileName: true,
                fileType: true,
                fileSizeBytes: true,
                wordCount: true,
                purpose: true,
                processingStatus: true,
                uploadedAt: true,
                errorMessage: true,
                usedForStyleGuide: true,
                usedInChapters: true,
                // Exclude extractedText to avoid 413 errors
            },
        });
    }

    /**
     * Get a single document
     */
    static async getDocument(documentId: string): Promise<ProjectDocument | null> {
        return prisma.projectDocument.findUnique({
            where: { id: documentId },
        });
    }

    /**
     * Delete a document
     */
    static async deleteDocument(documentId: string): Promise<boolean> {
        try {
            await prisma.projectDocument.delete({
                where: { id: documentId },
            });
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }

    /**
     * Get combined text from all style reference documents
     */
    static async getStyleReferenceText(projectId: string): Promise<string> {
        const documents = await prisma.projectDocument.findMany({
            where: {
                projectId,
                purpose: 'style_reference',
            },
            select: {
                extractedText: true,
                originalFileName: true,
            },
            orderBy: { uploadedAt: 'asc' },
        });

        if (documents.length === 0) {
            return '';
        }

        return documents
            .map((doc) => `[Estratto da: ${doc.originalFileName}]\n\n${doc.extractedText}`)
            .join('\n\n---\n\n');
    }

    /**
     * Mark documents as used for style guide
     */
    static async markDocumentsUsedForStyleGuide(projectId: string): Promise<void> {
        await prisma.projectDocument.updateMany({
            where: {
                projectId,
                purpose: 'style_reference',
            },
            data: {
                usedForStyleGuide: true,
            },
        });
    }

    /**
     * Get file extension from filename
     */
    private static getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || 'unknown';
    }
}
