/**
 * Book Export Service
 * Gestione libri esportati (list, get, delete)
 * 
 * Note: Generation + save è già in `/export-pdf` route.
 * Questo service fornisce solo metodi di management.
 */

import { del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { ExportedBook } from '@prisma/client';

export class BookExportService {
    /**
     * Lista tutti i libri disponibili
     * Ritorna libri in stato "ready" ordinati per data (più recenti prima)
     */
    static async listAvailableBooks(): Promise<
        (ExportedBook & { Project: { authorName: string } })[]
    > {
        return prisma.exportedBook.findMany({
            where: {
                status: 'ready',
            },
            include: {
                Project: {
                    select: {
                        authorName: true,
                    },
                },
            },
            orderBy: {
                generatedAt: 'desc',
            },
        });
    }

    /**
     * Ottieni singolo libro con informazioni progetto
     */
    static async getBook(bookId: string): Promise<
        (ExportedBook & { Project: { authorName: string; bookTitle: string } }) | null
    > {
        return prisma.exportedBook.findUnique({
            where: { id: bookId },
            include: {
                Project: {
                    select: {
                        authorName: true,
                        bookTitle: true,
                    },
                },
            },
        });
    }

    /**
     * Elimina libro (Vercel Blob + Supabase)
     * Rimuove il file da Vercel Blob e il record dal database
     */
    static async deleteBook(bookId: string): Promise<void> {
        const book = await prisma.exportedBook.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new Error('Libro non trovato');
        }

        // Delete from Vercel Blob
        try {
            await del(book.fileUrl);
            console.log(`✅ Deleted from Vercel Blob: ${book.fileUrl}`);
        } catch (error) {
            console.error('Failed to delete from Vercel Blob:', error);
            // Continue to delete DB record anyway
        }

        // Delete DB record
        await prisma.exportedBook.delete({
            where: { id: bookId },
        });

        console.log(`✅ Deleted from database: ${bookId}`);
    }

    /**
     * Marca come accessato (tracking)
     * Aggiorna il timestamp lastAccessedAt per analytics
     */
    static async markAsAccessed(bookId: string): Promise<void> {
        await prisma.exportedBook.update({
            where: { id: bookId },
            data: { lastAccessedAt: new Date() },
        });
    }

    /**
     * Cleanup old books (maintenance)
     * Elimina libri non accessati da X giorni
     * @param daysOld Numero di giorni (default: 90)
     * @returns Numero di libri eliminati
     */
    static async cleanupOldBooks(daysOld: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const oldBooks = await prisma.exportedBook.findMany({
            where: {
                lastAccessedAt: {
                    lt: cutoffDate,
                },
            },
        });

        if (oldBooks.length === 0) {
            console.log('No old books to cleanup');
            return 0;
        }

        // Delete from Vercel Blob
        await Promise.all(
            oldBooks.map((book) =>
                del(book.fileUrl).catch((err) =>
                    console.error(`Failed to delete ${book.fileUrl}:`, err)
                )
            )
        );

        // Delete from DB
        const result = await prisma.exportedBook.deleteMany({
            where: {
                id: {
                    in: oldBooks.map((b) => b.id),
                },
            },
        });

        console.log(`✅ Cleaned up ${result.count} old books`);
        return result.count;
    }

    /**
     * Ottieni statistiche sui libri esportati
     */
    static async getStats(): Promise<{
        totalBooks: number;
        totalSize: number;
        byFormat: Record<string, number>;
    }> {
        const books = await prisma.exportedBook.findMany({
            where: { status: 'ready' },
        });

        const stats = {
            totalBooks: books.length,
            totalSize: books.reduce((sum, book) => sum + book.fileSizeBytes, 0),
            byFormat: books.reduce((acc, book) => {
                acc[book.format] = (acc[book.format] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
        };

        return stats;
    }
}
