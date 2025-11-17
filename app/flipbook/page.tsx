'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import BookSelector from '@/components/BookSelector';
import Card from '@/components/Card';
import { BookOpen } from 'lucide-react';

// Import BookViewer dynamically to avoid SSR issues with react-pdf
const BookViewer = dynamic(() => import('@/components/BookViewer'), {
    ssr: false,
    loading: () => (
        <Card>
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Caricamento viewer...</p>
            </div>
        </Card>
    ),
});

interface ExportedBook {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    version: number;
    chaptersCount: number;
    totalWords: number;
    totalPages: number;
    generatedAt: string;
    project: {
        authorName: string;
    };
}

export default function FlipbookPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [books, setBooks] = useState<ExportedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Error loading books:', error);
            setError('Errore nel caricamento dei libri');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex-1 overflow-auto">
                <PageContainer
                    title="📚 Flipbook - Libreria Digitale"
                    onMenuClick={() => setMobileOpen(true)}
                >
                    {/* Book Selector */}
                    <Card>
                        <BookSelector
                            books={books}
                            selectedBookId={selectedBookId}
                            onSelectBookAction={setSelectedBookId}
                            onRefreshAction={loadBooks}
                            loading={loading}
                        />
                    </Card>

                    {/* Error State */}
                    {error && (
                        <Card>
                            <div className="text-center py-8">
                                <div className="text-red-500 mb-2">⚠️</div>
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={loadBooks}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Riprova
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* Book Viewer or Empty State */}
                    {!error && (
                        selectedBookId ? (
                            <BookViewer
                                bookId={selectedBookId}
                                onDelete={() => {
                                    loadBooks();
                                    setSelectedBookId(null);
                                }}
                            />
                        ) : (
                            <EmptyState hasBooks={books.length > 0} loading={loading} />
                        )
                    )}
                </PageContainer>
            </div>
        </div>
    );
}

function EmptyState({ hasBooks, loading }: { hasBooks: boolean; loading: boolean }) {
    if (loading) {
        return (
            <Card>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento libri...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasBooks
                        ? 'Nessun Libro Selezionato'
                        : 'Nessun Libro Disponibile'}
                </h3>
                <p className="text-gray-600 mb-4">
                    {hasBooks
                        ? 'Seleziona un libro dal menu a tendina per visualizzarlo'
                        : 'Esporta un libro in PDF per vederlo qui'}
                </p>
                {!hasBooks && (
                    <p className="text-sm text-gray-500">
                        Vai su <strong>Progetti → Esporta</strong> per generare il tuo primo PDF
                    </p>
                )}
            </div>
        </Card>
    );
}
