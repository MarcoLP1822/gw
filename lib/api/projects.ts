import { ProjectFormData } from '@/types';
import { saveAs } from 'file-saver';
import { ApiErrorResponse, ErrorType } from '@/lib/errors/api-errors';

// ============================================================
// ENHANCED ERROR HANDLING
// ============================================================

/**
 * Gestisce la risposta di errore dal backend
 * Estrae informazioni strutturate e fornisce messaggi user-friendly
 */
async function handleErrorResponse(response: Response, defaultMessage: string): Promise<never> {
    try {
        const errorData: ApiErrorResponse = await response.json();

        // Se il backend ha restituito un errore strutturato
        if (errorData.code) {
            const error = new Error(errorData.message || errorData.error || defaultMessage);
            (error as any).code = errorData.code;
            (error as any).severity = errorData.severity;
            (error as any).retryable = errorData.retryable;
            (error as any).details = errorData.details;
            throw error;
        }

        // Altrimenti usa il messaggio generico
        throw new Error(errorData.error || defaultMessage);
    } catch (parseError) {
        // Se non riesce a parsare la risposta, usa il messaggio di default
        throw new Error(defaultMessage);
    }
}

/**
 * Ottiene un messaggio di errore user-friendly
 */
export function getErrorMessage(error: any): string {
    // Se l'errore ha un code strutturato, usa il messaggio appropriato
    if (error.code) {
        // Messaggi user-friendly basati sul codice
        const friendlyMessages: Record<string, string> = {
            [ErrorType.API_KEY_INVALID]: '⚠️ API Key non valida. Configura le credenziali nelle impostazioni.',
            [ErrorType.API_QUOTA_EXCEEDED]: '💳 Credito API esaurito. Ricarica il tuo account o aggiorna la chiave API.',
            [ErrorType.API_RATE_LIMIT]: '⏱️ Troppi tentativi. Attendi qualche secondo e riprova.',
            [ErrorType.API_TIMEOUT]: '⏰ L\'operazione sta richiedendo troppo tempo. Riprova.',
            [ErrorType.API_ERROR]: '🔌 Problema di connessione con il servizio esterno. Riprova tra poco.',
            [ErrorType.NOT_FOUND]: '🔍 Elemento non trovato.',
            [ErrorType.PREREQUISITE_NOT_MET]: '📋 Prerequisiti non soddisfatti. Completa i passi precedenti.',
            [ErrorType.VALIDATION_ERROR]: '⚠️ I dati inseriti non sono validi.',
            [ErrorType.DATABASE_ERROR]: '💾 Errore nel salvataggio dei dati.',
            [ErrorType.INTERNAL_ERROR]: '❌ Errore interno del server.',
        };

        return friendlyMessages[error.code] || error.message || 'Errore imprevisto';
    }

    // Altrimenti, usa il messaggio dell'errore
    return error.message || 'Errore imprevisto';
}

/**
 * Verifica se un errore è ritentabile
 */
export function isRetryableError(error: any): boolean {
    if (error.retryable !== undefined) {
        return error.retryable;
    }

    // Alcuni errori sono ritentabili per natura
    const retryableCodes = [
        ErrorType.API_RATE_LIMIT,
        ErrorType.API_TIMEOUT,
        ErrorType.NETWORK_ERROR,
    ];

    return error.code && retryableCodes.includes(error.code);
}

// ============================================================
// API CLIENT per Projects
// ============================================================

export const projectsApi = {
    // Crea un nuovo progetto
    async create(data: ProjectFormData) {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante la creazione del progetto');
        }

        return response.json();
    },

    // Ottieni tutti i progetti
    async getAll() {
        const response = await fetch('/api/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante il recupero dei progetti');
        }

        return response.json();
    },

    // Ottieni un progetto specifico
    async getById(id: string) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante il recupero del progetto');
        }

        return response.json();
    },

    // Aggiorna un progetto
    async update(id: string, data: Partial<ProjectFormData> & { status?: string }) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante l\'aggiornamento del progetto');
        }

        return response.json();
    },

    // Elimina un progetto
    async delete(id: string) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante l\'eliminazione del progetto');
        }

        return response.json();
    },

    // ============================================================
    // CHAPTER GENERATION
    // ============================================================

    // Genera un capitolo
    async generateChapter(projectId: string, chapterNumber: number) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante la generazione del capitolo');
        }

        return response.json();
    },

    // Ottieni un capitolo
    async getChapter(projectId: string, chapterNumber: number) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante il recupero del capitolo');
        }

        return response.json();
    },

    // Aggiorna contenuto capitolo (edit manuale)
    async updateChapter(projectId: string, chapterNumber: number, content: string) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante l\'aggiornamento del capitolo');
        }

        return response.json();
    },

    // ============================================================
    // CONSISTENCY CHECK
    // ============================================================

    // Esegue consistency check finale
    async runConsistencyCheck(projectId: string) {
        const response = await fetch(`/api/projects/${projectId}/consistency-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante il consistency check');
        }

        return response.json();
    },

    // Ottieni ultimo consistency report
    async getConsistencyReport(projectId: string) {
        const response = await fetch(`/api/projects/${projectId}/consistency-check`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleErrorResponse(response, 'Errore durante il recupero del report');
        }

        return response.json();
    },

    // ============================================================
    // DOCUMENT EXPORT
    // ============================================================

    // Esporta progetto come DOCX
    async exportDocx(projectId: string) {
        try {
            const response = await fetch(`/api/projects/${projectId}/export`, {
                method: 'GET',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore durante l\'esportazione del documento');
            }

            // Ottieni il blob del file
            const blob = await response.blob();

            logger.info('Blob received:', { size: blob.size, type: blob.type });

            // Ottieni il nome del file dall'header Content-Disposition
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = 'libro.docx';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    fileName = match[1].replace(/['"]/g, '');
                }
            }

            logger.info('Downloading as:', { fileName });

            // Usa file-saver per un download più affidabile
            saveAs(blob, fileName);

            return { success: true, fileName };
        } catch (error) {
            logger.error('Export error:', error);
            throw error;
        }
    },
};
