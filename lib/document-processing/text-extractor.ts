/**
 * Text Extractor Interface
 * 
 * Defines the contract for extracting text from different file types
 */

export interface ExtractionResult {
    text: string;
    wordCount: number;
    metadata?: {
        pageCount?: number;
        language?: string;
        author?: string;
        [key: string]: any;
    };
}

export interface TextExtractor {
    /**
     * Extract text from a file buffer
     * @param buffer - File buffer to extract text from
     * @param filename - Original filename (for type detection)
     * @returns Extraction result with text and metadata
     */
    extract(buffer: Buffer, filename: string): Promise<ExtractionResult>;

    /**
     * Check if this extractor supports the given file type
     * @param mimeType - MIME type of the file
     * @param filename - Original filename
     * @returns True if this extractor can handle the file
     */
    supports(mimeType: string, filename: string): boolean;
}

/**
 * Factory function to get the appropriate extractor for a file
 */
export async function getExtractorForFile(
    mimeType: string,
    filename: string
): Promise<TextExtractor> {
    const extension = filename.split('.').pop()?.toLowerCase();

    // Dynamic imports for better performance
    if (
        mimeType === 'application/pdf' ||
        extension === 'pdf'
    ) {
        const { PdfExtractor } = await import('./extractors/pdf-extractor');
        return new PdfExtractor();
    }

    if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword' ||
        extension === 'docx' ||
        extension === 'doc'
    ) {
        const { DocxExtractor } = await import('./extractors/docx-extractor');
        return new DocxExtractor();
    }

    if (
        mimeType === 'text/plain' ||
        extension === 'txt'
    ) {
        const { TxtExtractor } = await import('./extractors/txt-extractor');
        return new TxtExtractor();
    }

    throw new Error(`Unsupported file type: ${mimeType || extension}`);
}

/**
 * Utility function to count words in text
 */
export function countWords(text: string): number {
    return text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
}
