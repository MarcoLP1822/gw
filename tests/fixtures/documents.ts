import { ProjectDocument } from '@prisma/client';

export const mockDocument: Partial<ProjectDocument> = {
    id: 'test-document-id-1',
    projectId: 'test-project-id-1',
    originalFileName: 'business-plan.pdf',
    fileType: 'pdf',
    fileSizeBytes: 1024 * 1024, // 1MB
    extractedText: 'Questo è il contenuto estratto dal documento PDF...',
    wordCount: 100,
    uploadedAt: new Date('2025-01-01'),
};

export const mockDocuments: Partial<ProjectDocument>[] = [
    mockDocument,
    {
        id: 'test-document-id-2',
        projectId: 'test-project-id-1',
        originalFileName: 'market-analysis.docx',
        fileType: 'docx',
        fileSizeBytes: 512 * 1024, // 512KB
        extractedText: 'Analisi di mercato: Il settore tech sta crescendo...',
        wordCount: 150,
        uploadedAt: new Date('2025-01-01'),
    },
    {
        id: 'test-document-id-3',
        projectId: 'test-project-id-1',
        originalFileName: 'presentation.pptx',
        fileType: 'pptx',
        fileSizeBytes: 2048 * 1024, // 2MB
        extractedText: 'Slide 1: Introduction...',
        wordCount: 200,
        uploadedAt: new Date('2025-01-01'),
    },
];

export const mockPdfBuffer = Buffer.from('PDF mock content');
export const mockDocxBuffer = Buffer.from('DOCX mock content');
