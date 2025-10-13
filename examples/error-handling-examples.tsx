/**
 * Esempio di utilizzo del sistema di gestione errori migliorato
 * Questo file mostra come integrare ErrorDisplay in un componente React
 */

'use client';

import { useState } from 'react';
import { ErrorDisplay, useErrorHandler } from '@/components/ErrorDisplay';
import { projectsApi, getErrorMessage, isRetryableError } from '@/lib/api/projects';
import { toast } from '@/lib/ui/toast';

// ============================================================
// ESEMPIO 1: Gestione Base con Toast
// ============================================================

export function BasicErrorHandlingExample() {
    const [loading, setLoading] = useState(false);

    const handleGenerateChapter = async (projectId: string, chapterNumber: number) => {
        setLoading(true);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
        } catch (error) {
            // Mostra messaggio user-friendly
            const message = getErrorMessage(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={() => handleGenerateChapter('project-id', 1)}
            disabled={loading}
        >
            {loading ? 'Generazione...' : 'Genera Capitolo'}
        </button>
    );
}

// ============================================================
// ESEMPIO 2: Con Componente ErrorDisplay
// ============================================================

export function ErrorDisplayExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [projectId] = useState('project-id');
    const [chapterNumber] = useState(1);

    const handleGenerateChapter = async () => {
        setLoading(true);
        setError(null);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Mostra errore con componente dedicato */}
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={handleGenerateChapter}
                    onDismiss={() => setError(null)}
                    showDetails={true}
                />
            )}

            <button
                onClick={handleGenerateChapter}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                {loading ? 'Generazione...' : 'Genera Capitolo'}
            </button>
        </div>
    );
}

// ============================================================
// ESEMPIO 3: Con Hook useErrorHandler
// ============================================================

export function ErrorHandlerHookExample() {
    const [loading, setLoading] = useState(false);
    const { error, handleError, retry, clear, retryCount } = useErrorHandler();

    const handleGenerateChapter = async (projectId: string, chapterNumber: number) => {
        setLoading(true);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
            clear();
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // Retry automatico quando richiesto
    const handleRetry = () => {
        retry();
        handleGenerateChapter('project-id', 1);
    };

    return (
        <div className="space-y-4">
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={handleRetry}
                    onDismiss={clear}
                    showDetails={true}
                />
            )}

            {retryCount > 0 && (
                <div className="text-sm text-gray-600">
                    Tentativi: {retryCount}
                </div>
            )}

            <button
                onClick={() => handleGenerateChapter('project-id', 1)}
                disabled={loading}
            >
                {loading ? 'Generazione...' : 'Genera Capitolo'}
            </button>
        </div>
    );
}

// ============================================================
// ESEMPIO 4: Con Retry Condizionale
// ============================================================

export function ConditionalRetryExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [showRetry, setShowRetry] = useState(false);

    const handleGenerateChapter = async (projectId: string, chapterNumber: number) => {
        setLoading(true);
        setError(null);
        setShowRetry(false);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
        } catch (err) {
            setError(err);

            // Mostra pulsante retry solo per errori ritentabili
            if (isRetryableError(err)) {
                setShowRetry(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={showRetry ? () => handleGenerateChapter('project-id', 1) : undefined}
                    onDismiss={() => setError(null)}
                    showDetails={true}
                />
            )}

            <button
                onClick={() => handleGenerateChapter('project-id', 1)}
                disabled={loading}
            >
                {loading ? 'Generazione...' : 'Genera Capitolo'}
            </button>
        </div>
    );
}

// ============================================================
// ESEMPIO 5: Con Gestione Multipli Errori
// ============================================================

export function MultipleErrorsExample() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any[]>([]);

    const handleBatchOperation = async (projectId: string, chapters: number[]) => {
        setLoading(true);
        setErrors([]);
        const newErrors: any[] = [];

        // Esegui operazioni su più capitoli
        for (const chapterNumber of chapters) {
            try {
                await projectsApi.generateChapter(projectId, chapterNumber);
                toast.success(`✨ Capitolo ${chapterNumber} completato`);
            } catch (err: any) {
                newErrors.push({
                    chapter: chapterNumber,
                    error: err,
                    message: getErrorMessage(err),
                });
            }
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
        } else {
            toast.success('✅ Tutti i capitoli generati con successo!');
        }

        setLoading(false);
    };

    return (
        <div className="space-y-4">
            {/* Mostra tutti gli errori */}
            {errors.map((err, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-3">
                    <h4 className="font-semibold">Capitolo {err.chapter}</h4>
                    <ErrorDisplay
                        error={err.error}
                        onRetry={() => handleBatchOperation('project-id', [err.chapter])}
                        showDetails={false}
                    />
                </div>
            ))}

            <button
                onClick={() => handleBatchOperation('project-id', [1, 2, 3])}
                disabled={loading}
            >
                {loading ? 'Generazione...' : 'Genera Capitoli 1-3'}
            </button>
        </div>
    );
}

// ============================================================
// ESEMPIO 6: Con Redirect Automatico per Errori Critici
// ============================================================

export function AutoRedirectExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const handleGenerateChapter = async (projectId: string, chapterNumber: number) => {
        setLoading(true);
        setError(null);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
        } catch (err: any) {
            setError(err);

            // Redirect automatico per errori di API Key
            if (err.code === 'API_KEY_INVALID') {
                setTimeout(() => {
                    window.location.href = '/settings';
                }, 3000);
                toast.error('Reindirizzamento alle impostazioni tra 3 secondi...');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <ErrorDisplay
                    error={error}
                    onDismiss={() => setError(null)}
                    showDetails={true}
                />
            )}

            <button
                onClick={() => handleGenerateChapter('project-id', 1)}
                disabled={loading}
            >
                {loading ? 'Generazione...' : 'Genera Capitolo'}
            </button>
        </div>
    );
}

// ============================================================
// ESEMPIO 7: Con Fallback e Logging
// ============================================================

export function ErrorLoggingExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const logError = (err: any, context: any) => {
        // In produzione, invia a servizio di logging (es. Sentry)
        console.error('Error logged:', {
            error: err,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
        });
    };

    const handleGenerateChapter = async (projectId: string, chapterNumber: number) => {
        setLoading(true);
        setError(null);

        try {
            await projectsApi.generateChapter(projectId, chapterNumber);
            toast.success('✨ Capitolo generato con successo!');
        } catch (err: any) {
            setError(err);

            // Log dell'errore con context
            logError(err, {
                action: 'generateChapter',
                projectId,
                chapterNumber,
            });

            // Mostra messaggio generico se non è un errore strutturato
            if (!err.code) {
                toast.error('Si è verificato un errore imprevisto. Il team è stato notificato.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={() => handleGenerateChapter('project-id', 1)}
                    onDismiss={() => setError(null)}
                    showDetails={process.env.NODE_ENV === 'development'}
                />
            )}

            <button
                onClick={() => handleGenerateChapter('project-id', 1)}
                disabled={loading}
            >
                {loading ? 'Generazione...' : 'Genera Capitolo'}
            </button>
        </div>
    );
}
