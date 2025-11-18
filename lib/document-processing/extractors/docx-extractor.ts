/**
 * DOCX File Extractor
 * 
 * Extracts text from Microsoft Word documents (.docx) using mammoth
 */

import mammoth from 'mammoth';
import { logger } from '@/lib/logger';
import { TextExtractor, ExtractionResult, countWords } from '../text-extractor';

export class DocxExtractor implements TextExtractor {
    supports(mimeType: string, filename: string): boolean {
        const extension = filename.split('.').pop()?.toLowerCase();
        return (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword' ||
            extension === 'docx' ||
            extension === 'doc'
        );
    }

    async extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
        try {
            const result = await mammoth.extractRawText({ buffer });

            if (result.messages.length > 0) {
                logger.warn(`Warnings extracting ${filename}:`, { messages: result.messages });
            }

            // Clean up extracted text
            const text = this.cleanText(result.value);

            return {
                text,
                wordCount: countWords(text),
                metadata: {
                    warnings: result.messages.length,
                },
            };
        } catch (error) {
            throw new Error(
                `Failed to extract text from DOCX ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
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
