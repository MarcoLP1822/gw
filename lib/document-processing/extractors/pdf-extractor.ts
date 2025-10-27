/**
 * PDF File Extractor
 * 
 * Extracts text from PDF files using pdf-parse
 */

// Import polyfills for Node.js environment
import '../polyfills';

// @ts-ignore - pdf-parse doesn't have proper ESM exports
const pdfParse = require('pdf-parse');
import { TextExtractor, ExtractionResult, countWords } from '../text-extractor';

export class PdfExtractor implements TextExtractor {
    supports(mimeType: string, filename: string): boolean {
        const extension = filename.split('.').pop()?.toLowerCase();
        return mimeType === 'application/pdf' || extension === 'pdf';
    }

    async extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
        try {
            const data = await pdfParse(buffer);

            // Clean up extracted text
            const text = this.cleanText(data.text);

            return {
                text,
                wordCount: countWords(text),
                metadata: {
                    pageCount: data.numpages,
                    pdfVersion: data.version,
                    info: data.info,
                },
            };
        } catch (error) {
            throw new Error(
                `Failed to extract text from PDF ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private cleanText(text: string): string {
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
            .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
            .trim();
    }
}
