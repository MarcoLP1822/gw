'use client';

import { RefreshCw } from 'lucide-react';

// Client component - can receive functions as props
interface Book {
    id: string;
    title: string;
    version: number;
    generatedAt: string;
    chaptersCount: number;
    totalWords: number;
    Project: {
        authorName: string;
    };
}

interface BookSelectorProps {
    books: Book[];
    selectedBookId: string | null;
    onSelectBookAction: (bookId: string | null) => void;
    onRefreshAction: () => void;
    loading?: boolean;
}

export default function BookSelector({
    books,
    selectedBookId,
    onSelectBookAction,
    onRefreshAction,
    loading = false
}: BookSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Seleziona Libro</h3>
                <button
                    onClick={onRefreshAction}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Aggiorna lista"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Aggiorna</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* Dropdown */}
                <div className="flex-1">
                    <select
                        value={selectedBookId || ''}
                        onChange={(e) => onSelectBookAction(e.target.value || null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || books.length === 0}
                    >
                        <option value="">
                            {books.length === 0
                                ? '-- Nessun libro disponibile --'
                                : '-- Seleziona un libro --'}
                        </option>
                        {books.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.title} - {book.Project.authorName} (v{book.version}) - {' '}
                                {new Date(book.generatedAt).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
