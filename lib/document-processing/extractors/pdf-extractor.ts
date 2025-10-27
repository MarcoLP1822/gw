/**
 * PDF File Extractor
 * 
 * Extracts text from PDF files using unpdf (serverless-friendly)
 */

import { extractText } from 'unpdf';
import { TextExtractor, ExtractionResult, countWords } from '../text-extractor';

export class PdfExtractor implements TextExtractor {
    supports(mimeType: string, filename: string): boolean {
        const extension = filename.split('.').pop()?.toLowerCase();
        return mimeType === 'application/pdf' || extension === 'pdf';
    }

    async extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
        try {
            // Convert Buffer to Uint8Array (required by unpdf)
            const uint8Array = new Uint8Array(buffer);

            // Extract text using unpdf
            const result = await extractText(uint8Array);

            // unpdf returns an array of strings (one per page)
            // Join them with double newlines
            const rawText = Array.isArray(result.text)
                ? result.text.join('\n\n')
                : result.text;

            // Clean up extracted text
            const text = this.cleanText(rawText);

            return {
                text,
                wordCount: countWords(text),
                metadata: {
                    totalPages: result.totalPages,
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
