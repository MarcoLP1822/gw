'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { DiffChange, ApplySuggestionResult, ConsistencyIssue } from '@/types';
import { AlertCircle, Check, X, RotateCcw, Loader2, Edit3 } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import { logger } from '@/lib/logger';

interface DiffViewerModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    issue: ConsistencyIssue;
    chapterNumber: number;
    projectId: string;
    onAppliedAction: () => void;  // Callback quando modifica applicata
}

export default function DiffViewerModal({
    isOpen,
    onCloseAction,
    issue,
    chapterNumber,
    projectId,
    onAppliedAction
}: DiffViewerModalProps) {
    const [loading, setLoading] = useState(false);
    const [diffData, setDiffData] = useState<ApplySuggestionResult['diff'] | null>(null);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFullText, setShowFullText] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    // Fetch preview on open
    useEffect(() => {
        if (isOpen && !diffData && !loading) {
            handleLoadPreview();
        }
    }, [isOpen]);

    const handleLoadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/suggestions/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue,
                    chapterNumber,
                    preview: true
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore durante la generazione del preview');
            }

            const data = await response.json();
            setDiffData(data.diff);
            setEditedContent(data.diff.newContent); // Initialize editable content
            logger.info('✅ Preview loaded', { chapterNumber, wordsChanged: data.diff?.wordsChanged });

        } catch (err: any) {
            logger.error('❌ Error loading preview', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!diffData) return;

        if (!confirm(`Applicare questa modifica al Capitolo ${chapterNumber}? La versione precedente sarà salvata e potrai fare undo.`)) {
            return;
        }

        setApplying(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/suggestions/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue,
                    chapterNumber,
                    preview: false,  // Apply for real
                    customContent: isEditing ? editedContent : undefined  // Send edited content if user modified it
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore durante l\'applicazione');
            }

            toast.success(`✅ Modifica applicata al Cap. ${chapterNumber}!`);
            onAppliedAction();  // Trigger refresh
            onCloseAction();

        } catch (err: any) {
            logger.error('❌ Error applying suggestion', err);
            toast.error(err.message);
        } finally {
            setApplying(false);
        }
    };

    const handleRegenerate = () => {
        setDiffData(null);
        setError(null);
        handleLoadPreview();
    };

    const getRelevantText = (fullText: string, targetText: string, contextLines: number = 3) => {
        const lines = fullText.split('\n');
        const targetLines = targetText.split('\n');

        // Trova l'indice della prima riga del target
        let startIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(targetLines[0])) {
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) {
            // Se non trova il target, mostra comunque un estratto
            return lines.slice(0, 10).join('\n');
        }

        // Calcola range con contesto
        const start = Math.max(0, startIndex - contextLines);
        const end = Math.min(lines.length, startIndex + targetLines.length + contextLines);

        // Aggiungi ellipsis se necessario
        const relevantLines = lines.slice(start, end);
        const prefix = start > 0 ? '...\n' : '';
        const suffix = end < lines.length ? '\n...' : '';

        return prefix + relevantLines.join('\n') + suffix;
    };

    const highlightText = (text: string, changes: DiffChange[], view: 'old' | 'new') => {
        let highlighted = text;

        changes.forEach((change) => {
            if (view === 'old' && (change.type === 'deletion' || change.type === 'replacement')) {
                // Highlight removed text in red
                const escapedTarget = change.targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                highlighted = highlighted.replace(
                    new RegExp(escapedTarget, 'g'),
                    `<mark class="bg-red-200 text-red-900 px-1 rounded">${change.targetText}</mark>`
                );
            } else if (view === 'new' && (change.type === 'replacement' || change.type === 'addition') && change.newText) {
                // Highlight new text in green
                const escapedNew = change.newText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                highlighted = highlighted.replace(
                    new RegExp(escapedNew, 'g'),
                    `<mark class="bg-green-200 text-green-900 px-1 rounded">${change.newText}</mark>`
                );
            }
        });

        return highlighted;
    };

    return (
        <Modal
            isOpen={isOpen}
            onCloseAction={onCloseAction}
            title={`Preview Modifica - Capitolo ${chapterNumber}`}
            size="full"
            preventClose={true}
        >
            <div className="space-y-4">
                {/* Issue Context */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Problema Rilevato</h3>
                            <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                            <div className="bg-white rounded p-3 border border-orange-100">
                                <p className="text-sm text-gray-600">
                                    <strong className="text-purple-600">💡 Suggerimento AI:</strong> {issue.suggestion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                        <p className="text-gray-600 font-medium">Generazione proposta di modifica...</p>
                        <p className="text-sm text-gray-500 mt-2">
                            L&apos;AI sta analizzando il capitolo (10-20 secondi)
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-red-800 font-medium mb-2">{error}</p>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Riprova
                            </button>
                        </div>
                    </div>
                )}

                {/* Diff View */}
                {diffData && !loading && (
                    <>
                        {/* Toggle Full Text Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowFullText(!showFullText)}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                {showFullText ? '📖 Mostra solo paragrafo modificato' : '📄 Mostra testo completo'}
                            </button>
                        </div>

                        {/* Split View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
                            {/* Original */}
                            <div className="bg-red-50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <X size={16} className="text-red-600" />
                                    <h4 className="font-semibold text-red-900">Originale</h4>
                                </div>
                                <div className="bg-white rounded p-2 max-h-96 overflow-y-auto border border-red-200">
                                    <div
                                        className="text-sm text-gray-700 whitespace-pre-wrap font-mono"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightText(
                                                showFullText
                                                    ? diffData.oldContent
                                                    : getRelevantText(diffData.oldContent, diffData.changes[0]?.targetText || '', 3),
                                                diffData.changes,
                                                'old'
                                            )
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Modified */}
                            <div className="bg-green-50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check size={16} className="text-green-600" />
                                    <h4 className="font-semibold text-green-900">Con Modifica</h4>
                                    {!isEditing && (
                                        <Edit3 size={14} className="text-gray-400 ml-1" />
                                    )}
                                    {isEditing && (
                                        <div className="ml-auto flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(false);
                                                    setEditedContent(diffData.newContent); // Reset to original
                                                }}
                                                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                                            >
                                                Annulla
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(false);
                                                    toast.success('Modifiche salvate! Clicca "Applica" per confermare.');
                                                }}
                                                className="text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded font-medium"
                                            >
                                                Salva
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="bg-white rounded p-2 max-h-96 overflow-y-auto border border-green-200 cursor-pointer hover:border-green-400 transition-colors"
                                    onClick={() => !isEditing && setIsEditing(true)}
                                >
                                    {isEditing ? (
                                        <textarea
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            className="w-full min-h-[200px] text-sm text-gray-700 whitespace-pre-wrap font-mono border-none focus:outline-none focus:ring-2 focus:ring-green-400 rounded p-2"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                            {editedContent !== diffData.newContent ? (
                                                // Se l'utente ha editato, mostra testo senza highlighting
                                                showFullText ? editedContent : getRelevantText(editedContent, diffData.changes[0]?.newText || '', 3)
                                            ) : (
                                                // Se non ha editato, mostra con highlighting
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: highlightText(
                                                            showFullText
                                                                ? editedContent
                                                                : getRelevantText(editedContent, diffData.changes[0]?.newText || '', 3),
                                                            diffData.changes,
                                                            'new'
                                                        )
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-sm">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-yellow-800 font-bold">
                                <p className="mb-3">
                                    ATTENZIONE!!! L&apos;applicazione di questa modifica potrebbe invalidare altri suggerimenti.
                                    Considera di rigenerare il consistency report dopo l&apos;applicazione.
                                </p>
                                <p>
                                    Se clicchi su RIFIUTA, la modifica si perderà e dovrai rigenerarla.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={onCloseAction}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                ❌ Rifiuta
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <RotateCcw size={16} />
                                Rigenera
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Applicando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Applica
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
