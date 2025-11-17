'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Card from '@/components/Card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash2, Loader2 } from 'lucide-react';

// Import CSS - react-pdf v10 uses cjs path
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface Book {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    totalPages: number;
    Project: {
        authorName: string;
        bookTitle: string;
    };
}

interface BookViewerProps {
    bookId: string;
    onDelete?: () => void;
}

export default function BookViewer({ bookId, onDelete }: BookViewerProps) {
    const [book, setBook] = useState<Book | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Setup PDF.js worker only on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Use the worker from react-pdf's bundled pdfjs-dist
            const pdfjsVersion = pdfjs.version;
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
        }
    }, []);

    const loadBook = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) throw new Error('Failed to fetch book');
            const data = await response.json();
            setBook(data);

            // Mark as accessed
            await fetch(`/api/books/${bookId}/access`, { method: 'POST' }).catch(err =>
                console.error('Failed to mark as accessed:', err)
            );
        } catch (error) {
            console.error('Error loading book:', error);
            setError('Errore nel caricamento del libro');
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        loadBook();
    }, [loadBook]);

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questo libro?')) return;

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete book');

            onDelete?.();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Errore durante l\'eliminazione del libro');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF load error:', error);
        setError('Errore nel caricamento del PDF');
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Caricamento libro...</p>
                </div>
            </Card>
        );
    }

    if (error || !book) {
        return (
            <Card>
                <div className="text-center py-12">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-red-600">{error || 'Libro non trovato'}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            {/* Header with Book Title */}
            <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
                <p className="text-sm text-gray-600 mt-1">di {book.Project.authorName}</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pagina precedente"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-700 min-w-[120px] text-center px-3 py-2 bg-white rounded border border-gray-300">
                        Pagina {currentPage} di {numPages || '...'}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(numPages || 1, p + 1))}
                        disabled={currentPage === numPages}
                        className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pagina successiva"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Zoom and Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                        className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded"
                        title="Rimpicciolisci"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-700 min-w-[60px] text-center px-3 py-2 bg-white rounded border border-gray-300">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
                        className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded"
                        title="Ingrandisci"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <button
                        onClick={() => window.open(book.fileUrl, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        title="Scarica PDF"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Scarica</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        title="Elimina libro"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Elimina</span>
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex justify-center bg-gray-100 rounded-lg p-4 min-h-[600px] overflow-auto">
                <Document
                    file={book.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-600">Caricamento PDF...</p>
                        </div>
                    }
                    error={
                        <div className="text-center py-12">
                            <div className="text-red-500 mb-2">⚠️</div>
                            <p className="text-red-600">Errore nel caricamento del PDF</p>
                            <button
                                onClick={loadBook}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Riprova
                            </button>
                        </div>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                    />
                </Document>
            </div>

            {/* Page Navigation (Mobile Friendly) */}
            <div className="flex items-center justify-center gap-2 mt-4 sm:hidden">
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                    Prima
                </button>
                <button
                    onClick={() => setCurrentPage(numPages || 1)}
                    disabled={currentPage === numPages}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                    Ultima
                </button>
            </div>
        </Card>
    );
}
