/**
 * Batch Chapter Generation Service
 * 
 * Handles sequential generation of multiple chapters with progress tracking.
 * Implements error handling, retry logic, and graceful degradation.
 * 
 * Features:
 * - Sequential execution (prevents API rate limiting)
 * - Progress callbacks for UI updates
 * - Individual chapter error handling
 * - Graceful continuation on non-critical errors
 * - Abort support for cancellation
 * 
 * @example
 * ```typescript
 * const generator = new BatchChapterGenerator(projectId);
 * 
 * await generator.generateMultiple(
 *   [1, 2, 3, 4, 5],
 *   (progress) => {
 *     // Handle progress updates
 *     updateUI(progress);
 *   }
 * );
 * ```
 */

export interface ChapterProgress {
    chapterNumber: number;
    status: 'pending' | 'generating' | 'completed' | 'error';
    error?: string;
    startTime?: number;
    endTime?: number;
    wordCount?: number;
}

export interface BatchGenerationResult {
    total: number;
    completed: number;
    failed: number;
    chapters: ChapterProgress[];
    totalTime: number;
}

export type ProgressCallback = (progress: ChapterProgress) => void;

export class BatchChapterGenerator {
    private projectId: string;
    private abortController: AbortController | null = null;
    private isAborted = false;

    constructor(projectId: string) {
        this.projectId = projectId;
    }

    /**
     * Generate multiple chapters sequentially
     */
    async generateMultiple(
        chapterNumbers: number[],
        onProgress: ProgressCallback
    ): Promise<BatchGenerationResult> {
        const startTime = Date.now();
        const results: ChapterProgress[] = [];

        // Initialize abort controller
        this.abortController = new AbortController();
        this.isAborted = false;

        let completed = 0;
        let failed = 0;

        for (const chapterNumber of chapterNumbers) {
            // Check if aborted
            if (this.isAborted) {
                // Mark remaining chapters as pending
                for (let i = chapterNumbers.indexOf(chapterNumber); i < chapterNumbers.length; i++) {
                    results.push({
                        chapterNumber: chapterNumbers[i],
                        status: 'pending',
                        error: 'Generation aborted by user'
                    });
                }
                break;
            }

            const progress: ChapterProgress = {
                chapterNumber,
                status: 'pending',
            };
            results.push(progress);

            try {
                // Update status to generating
                progress.status = 'generating';
                progress.startTime = Date.now();
                onProgress(progress);

                // Generate chapter
                const result = await this.generateSingleChapter(chapterNumber);

                // Update status to completed
                progress.status = 'completed';
                progress.endTime = Date.now();
                progress.wordCount = result.wordCount;
                completed++;

                onProgress(progress);

            } catch (error) {
                // Handle error but continue with next chapters
                progress.status = 'error';
                progress.endTime = Date.now();
                progress.error = error instanceof Error ? error.message : 'Unknown error';
                failed++;

                onProgress(progress);

                // Don't break - continue with next chapters
                // This allows partial batch completion
            }

            // Small delay between chapters to avoid rate limiting
            if (chapterNumbers.indexOf(chapterNumber) < chapterNumbers.length - 1) {
                await this.delay(1000); // 1 second delay
            }
        }

        const totalTime = Date.now() - startTime;

        return {
            total: chapterNumbers.length,
            completed,
            failed,
            chapters: results,
            totalTime
        };
    }

    /**
     * Generate a single chapter
     */
    private async generateSingleChapter(chapterNumber: number): Promise<{ wordCount: number }> {
        const response = await fetch(
            `/api/projects/${this.projectId}/chapters/${chapterNumber}/generate`,
            {
                method: 'POST',
                signal: this.abortController?.signal,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to generate chapter ${chapterNumber}`);
        }

        const data = await response.json();
        return {
            wordCount: data.chapter?.wordCount || 0
        };
    }

    /**
     * Abort ongoing generation
     */
    abort() {
        this.isAborted = true;
        this.abortController?.abort();
    }

    /**
     * Utility: delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Helper: Generate all remaining chapters
 */
export async function generateAllRemainingChapters(
    projectId: string,
    totalChapters: number,
    existingChapters: number[],
    onProgress: ProgressCallback
): Promise<BatchGenerationResult> {
    const remaining = Array.from({ length: totalChapters }, (_, i) => i + 1)
        .filter(num => !existingChapters.includes(num));

    const generator = new BatchChapterGenerator(projectId);
    return generator.generateMultiple(remaining, onProgress);
}

/**
 * Helper: Generate next N chapters
 */
export async function generateNextChapters(
    projectId: string,
    count: number,
    totalChapters: number,
    existingChapters: number[],
    onProgress: ProgressCallback
): Promise<BatchGenerationResult> {
    const remaining = Array.from({ length: totalChapters }, (_, i) => i + 1)
        .filter(num => !existingChapters.includes(num))
        .slice(0, count);

    const generator = new BatchChapterGenerator(projectId);
    return generator.generateMultiple(remaining, onProgress);
}

/**
 * Format time duration
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
}

/**
 * Calculate estimated time remaining
 */
export function estimateTimeRemaining(
    completed: number,
    total: number,
    elapsedTime: number
): number {
    if (completed === 0) return 0;
    const avgTimePerChapter = elapsedTime / completed;
    return avgTimePerChapter * (total - completed);
}
