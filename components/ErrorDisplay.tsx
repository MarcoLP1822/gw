/**
 * Componente per mostrare errori in modo user-friendly
 * Supporta diversi livelli di severità e azioni suggerite
 */

import React from 'react';
import { ErrorType, ErrorSeverity } from '@/lib/errors/api-errors';

export interface ErrorDisplayProps {
    error: {
        message?: string;
        code?: ErrorType;
        severity?: ErrorSeverity;
        retryable?: boolean;
    } | string;
    onRetry?: () => void;
    onDismiss?: () => void;
    showDetails?: boolean;
}

export function ErrorDisplay({ error, onRetry, onDismiss, showDetails = false }: ErrorDisplayProps) {
    // Normalizza l'errore
    const errorObj = typeof error === 'string'
        ? { message: error, severity: ErrorSeverity.MEDIUM }
        : error;

    const { message, code, severity = ErrorSeverity.MEDIUM, retryable = false } = errorObj;

    // Determina il colore in base alla severità
    const getSeverityStyles = () => {
        switch (severity) {
            case ErrorSeverity.LOW:
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    icon: '⚠️',
                };
            case ErrorSeverity.MEDIUM:
                return {
                    bg: 'bg-orange-50 border-orange-200',
                    text: 'text-orange-800',
                    icon: '❌',
                };
            case ErrorSeverity.HIGH:
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: '🚨',
                };
            case ErrorSeverity.CRITICAL:
                return {
                    bg: 'bg-red-100 border-red-300',
                    text: 'text-red-900',
                    icon: '🔴',
                };
            default:
                return {
                    bg: 'bg-gray-50 border-gray-200',
                    text: 'text-gray-800',
                    icon: 'ℹ️',
                };
        }
    };

    const styles = getSeverityStyles();

    // Suggerimenti basati sul tipo di errore
    const getSuggestion = () => {
        switch (code) {
            case ErrorType.API_KEY_INVALID:
                return 'Vai su Impostazioni → Configurazione AI per configurare la tua API Key OpenAI.';
            case ErrorType.API_QUOTA_EXCEEDED:
                return 'Ricarica il credito sul tuo account OpenAI o aggiorna la chiave API nelle impostazioni.';
            case ErrorType.API_RATE_LIMIT:
                return 'Attendi qualche secondo prima di riprovare.';
            case ErrorType.PREREQUISITE_NOT_MET:
                return 'Completa i passi precedenti prima di continuare.';
            case ErrorType.API_TIMEOUT:
                return 'La richiesta sta richiedendo troppo tempo. Prova a ridurre la dimensione del contenuto.';
            default:
                return null;
        }
    };

    const suggestion = getSuggestion();

    return (
        <div className={`rounded-lg border-2 ${styles.bg} p-4 ${styles.text}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{styles.icon}</span>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">
                        {severity === ErrorSeverity.CRITICAL ? 'Errore Critico' : 'Si è verificato un errore'}
                    </h3>
                    <p className="text-sm mb-2">{message}</p>

                    {suggestion && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                            <strong>💡 Suggerimento:</strong> {suggestion}
                        </div>
                    )}

                    {showDetails && code && (
                        <details className="mt-2 text-xs opacity-75">
                            <summary className="cursor-pointer hover:opacity-100">
                                Dettagli tecnici
                            </summary>
                            <div className="mt-1 p-2 bg-white bg-opacity-50 rounded font-mono">
                                Codice errore: {code}
                                {retryable && <div>Ritentabile: Sì</div>}
                            </div>
                        </details>
                    )}

                    <div className="flex gap-2 mt-3">
                        {retryable && onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-sm font-medium transition-all"
                            >
                                🔄 Riprova
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-3 py-1 bg-white bg-opacity-60 hover:bg-opacity-80 rounded text-sm transition-all"
                            >
                                Chiudi
                            </button>
                        )}
                        {code === ErrorType.API_KEY_INVALID && (
                            <a
                                href="/settings"
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-all"
                            >
                                ⚙️ Vai alle Impostazioni
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook per gestire gli errori con retry automatico
 */
export function useErrorHandler() {
    const [error, setError] = React.useState<any>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const handleError = React.useCallback((err: any) => {
        console.error('Error caught:', err);
        setError(err);
    }, []);

    const retry = React.useCallback(() => {
        setRetryCount(prev => prev + 1);
        setError(null);
    }, []);

    const clear = React.useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    return {
        error,
        handleError,
        retry,
        clear,
        retryCount,
    };
}
