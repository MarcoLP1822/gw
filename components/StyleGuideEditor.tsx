/**
 * Style Guide Editor Component
 * 
 * Allows users to view, edit, and generate custom style guides
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Sparkles, AlertCircle, CheckCircle2, FileText, Trash2 } from 'lucide-react';

interface StyleGuideEditorProps {
    projectId: string;
    hasDocuments: boolean;
    onGenerateSuccess?: () => void;
}

export default function StyleGuideEditor({
    projectId,
    hasDocuments,
    onGenerateSuccess,
}: StyleGuideEditorProps) {
    const [styleGuide, setStyleGuide] = useState<string>('');
    const [originalStyleGuide, setOriginalStyleGuide] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadStyleGuide();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const loadStyleGuide = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/projects/${projectId}/style-guide`);
            const data = await response.json();

            if (data.success) {
                setStyleGuide(data.styleGuide || '');
                setOriginalStyleGuide(data.styleGuide || '');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch(`/api/projects/${projectId}/style-guide`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ styleGuide }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante il salvataggio');
            }

            setOriginalStyleGuide(styleGuide);
            setSuccessMessage('Style guide salvato con successo!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        if (!hasDocuments) {
            setError('Carica almeno un documento prima di generare lo style guide');
            return;
        }

        if (styleGuide && !confirm('Generare un nuovo style guide? Quello attuale verrà sovrascritto.')) {
            return;
        }

        try {
            setGenerating(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch(`/api/projects/${projectId}/style-guide/generate`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante la generazione');
            }

            setStyleGuide(data.styleGuide);
            // NON aggiorniamo originalStyleGuide così il pulsante Salva rimane abilitato
            setSuccessMessage('Style guide generato! Clicca "Salva" per confermare.');
            setTimeout(() => setSuccessMessage(null), 5000);

            if (onGenerateSuccess) {
                onGenerateSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la generazione');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Eliminare lo style guide personalizzato? Verrà usato quello auto-generato se disponibile.')) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);

            const response = await fetch(`/api/projects/${projectId}/style-guide`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante l\'eliminazione');
            }

            setStyleGuide('');
            setOriginalStyleGuide('');
            setSuccessMessage('Style guide eliminato');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
        } finally {
            setDeleting(false);
        }
    };

    const hasChanges = styleGuide !== originalStyleGuide;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Cos&apos;è lo Style Guide?</p>
                        <p className="text-blue-800">
                            Lo style guide definisce il tono, lo stile e le regole di scrittura per i capitoli generati dall&apos;AI.
                            Puoi crearlo manualmente o generarlo automaticamente dai documenti caricati.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Generate Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleGenerate}
                    disabled={generating || !hasDocuments}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generazione in corso...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            <span>Genera da Documenti</span>
                        </>
                    )}
                </button>

                {styleGuide && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Elimina</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Editor */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style Guide
                </label>
                <textarea
                    value={styleGuide}
                    onChange={(e) => setStyleGuide(e.target.value)}
                    placeholder="Scrivi qui le regole di stile per i capitoli, oppure genera automaticamente dai documenti caricati..."
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                    {styleGuide.length} caratteri • {Math.ceil(styleGuide.split(/\s+/).filter(w => w.length > 0).length)} parole
                </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    {hasChanges && (
                        <span className="text-sm text-orange-600 font-medium">⚠️ Modifiche non salvate</span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges || !styleGuide}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Salvataggio...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Salva Style Guide</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
