/**
 * Text File Extractor
 * 
 * Extracts text from plain text files (.txt)
 */

import { TextExtractor, ExtractionResult, countWords } from '../text-extractor';

export class TxtExtractor implements TextExtractor {
    supports(mimeType: string, filename: string): boolean {
        const extension = filename.split('.').pop()?.toLowerCase();
        return mimeType === 'text/plain' || extension === 'txt';
    }

    async extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
        try {
            // Try UTF-8 first
            let text = buffer.toString('utf-8');

            // If UTF-8 fails (contains invalid characters), try other encodings
            if (text.includes('�')) {
                text = buffer.toString('latin1');
            }

            // Clean up text
            text = this.cleanText(text);

            return {
                text,
                wordCount: countWords(text),
                metadata: {
                    encoding: 'utf-8',
                },
            };
        } catch (error) {
            throw new Error(
                `Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private cleanText(text: string): string {
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
            .trim();
    }
}
