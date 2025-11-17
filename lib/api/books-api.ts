/**
 * Books API Client
 * Helper functions per interagire con l'API dei libri esportati
 */

export interface ExportedBook {
    id: string;
    projectId: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSizeBytes: number;
    format: string;
    version: number;
    chaptersCount: number;
    totalWords: number;
    totalPages: number;
    status: string;
    generatedAt: string;
    lastAccessedAt: string;
    project?: {
        authorName: string;
        bookTitle?: string;
    };
}

export const booksApi = {
    /**
     * Lista tutti i libri disponibili
     */
    async list(): Promise<ExportedBook[]> {
        const response = await fetch('/api/books', {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        return response.json();
    },

    /**
     * Ottieni dettagli di un singolo libro
     */
    async get(bookId: string): Promise<ExportedBook> {
        const response = await fetch(`/api/books/${bookId}`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Book not found');
            }
            throw new Error('Failed to fetch book');
        }
        return response.json();
    },

    /**
     * Elimina un libro
     */
    async delete(bookId: string): Promise<void> {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to delete book' }));
            throw new Error(error.error || 'Failed to delete book');
        }
    },

    /**
     * Marca un libro come accessato (per tracking)
     */
    async markAccessed(bookId: string): Promise<void> {
        await fetch(`/api/books/${bookId}/access`, {
            method: 'POST',
        }).catch((error) => {
            // Non bloccare l'app se il tracking fallisce
            console.error('Failed to mark book as accessed:', error);
        });
    },
};
