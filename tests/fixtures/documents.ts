import { Document } from '@prisma/client';

export const mockDocument: Partial<Document> = {
    id: 'test-document-id-1',
    projectId: 'test-project-id-1',
    fileName: 'business-plan.pdf',
    fileUrl: 'https://blob.vercel-storage.com/business-plan.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    extractedText: 'Questo è il contenuto estratto dal documento PDF...',
    uploadedAt: new Date('2025-01-01'),
};

export const mockDocuments: Partial<Document>[] = [
    mockDocument,
    {
        id: 'test-document-id-2',
        projectId: 'test-project-id-1',
        fileName: 'market-analysis.docx',
        fileUrl: 'https://blob.vercel-storage.com/market-analysis.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 512 * 1024, // 512KB
        extractedText: 'Analisi di mercato: Il settore tech sta crescendo...',
        uploadedAt: new Date('2025-01-01'),
    },
    {
        id: 'test-document-id-3',
        projectId: 'test-project-id-1',
        fileName: 'presentation.pptx',
        fileUrl: 'https://blob.vercel-storage.com/presentation.pptx',
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        fileSize: 2048 * 1024, // 2MB
        extractedText: null, // Not yet processed
        uploadedAt: new Date('2025-01-01'),
    },
];

export const mockPdfBuffer = Buffer.from('PDF mock content');
export const mockDocxBuffer = Buffer.from('DOCX mock content');
