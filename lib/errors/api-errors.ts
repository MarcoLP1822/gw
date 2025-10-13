/**
 * Sistema di gestione errori migliorato per l'applicazione
 * Fornisce tipi di errore strutturati, codici e messaggi user-friendly
 */

// ============================================================
// TIPI DI ERRORE
// ============================================================

export enum ErrorType {
    // Errori di validazione input
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    // Errori di autenticazione/autorizzazione
    AUTH_ERROR = 'AUTH_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',

    // Errori relativi alle API esterne (OpenAI, ecc.)
    API_KEY_INVALID = 'API_KEY_INVALID',
    API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
    API_RATE_LIMIT = 'API_RATE_LIMIT',
    API_TIMEOUT = 'API_TIMEOUT',
    API_ERROR = 'API_ERROR',

    // Errori di database
    DATABASE_ERROR = 'DATABASE_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',

    // Errori di business logic
    INVALID_STATE = 'INVALID_STATE',
    PREREQUISITE_NOT_MET = 'PREREQUISITE_NOT_MET',

    // Errori generici
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
    LOW = 'LOW',           // Info/warning
    MEDIUM = 'MEDIUM',     // Errore recuperabile
    HIGH = 'HIGH',         // Errore critico
    CRITICAL = 'CRITICAL', // Sistema non funzionante
}

// ============================================================
// INTERFACCE
// ============================================================

export interface ApiErrorResponse {
    error: string;              // Messaggio tecnico
    code: ErrorType;            // Codice errore strutturato
    message?: string;           // Messaggio user-friendly (opzionale)
    details?: any;              // Dettagli aggiuntivi
    severity?: ErrorSeverity;   // Severità dell'errore
    retryable?: boolean;        // Se l'operazione può essere ritentata
    timestamp?: string;         // Timestamp dell'errore
}

export interface ErrorContext {
    projectId?: string;
    chapterNumber?: number;
    operation?: string;
    [key: string]: any;
}

// ============================================================
// CLASSE CUSTOM ERROR
// ============================================================

export class ApiError extends Error {
    public readonly code: ErrorType;
    public readonly statusCode: number;
    public readonly severity: ErrorSeverity;
    public readonly retryable: boolean;
    public readonly context?: ErrorContext;
    public readonly originalError?: Error;

    constructor(
        message: string,
        code: ErrorType = ErrorType.UNKNOWN_ERROR,
        statusCode: number = 500,
        options: {
            severity?: ErrorSeverity;
            retryable?: boolean;
            context?: ErrorContext;
            originalError?: Error;
        } = {}
    ) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.statusCode = statusCode;
        this.severity = options.severity || ErrorSeverity.MEDIUM;
        this.retryable = options.retryable ?? false;
        this.context = options.context;
        this.originalError = options.originalError;

        // Mantiene lo stack trace corretto
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): ApiErrorResponse {
        return {
            error: this.message,
            code: this.code,
            message: getErrorMessage(this.code),
            severity: this.severity,
            retryable: this.retryable,
            timestamp: new Date().toISOString(),
            details: this.context,
        };
    }
}

// ============================================================
// FACTORY FUNCTIONS per creare errori specifici
// ============================================================

export const ApiErrors = {
    // Validazione
    validation: (message: string, context?: ErrorContext) =>
        new ApiError(message, ErrorType.VALIDATION_ERROR, 400, {
            severity: ErrorSeverity.LOW,
            context,
        }),

    // Non trovato
    notFound: (resource: string, id?: string) =>
        new ApiError(
            `${resource} non trovato${id ? `: ${id}` : ''}`,
            ErrorType.NOT_FOUND,
            404,
            {
                severity: ErrorSeverity.LOW,
                context: { resource, id },
            }
        ),

    // API Key non valida
    invalidApiKey: (provider: string = 'OpenAI') =>
        new ApiError(
            `API Key ${provider} non valida o mancante`,
            ErrorType.API_KEY_INVALID,
            401,
            {
                severity: ErrorSeverity.CRITICAL,
                retryable: false,
                context: { provider },
            }
        ),

    // Quota/Credito esaurito
    quotaExceeded: (provider: string = 'OpenAI') =>
        new ApiError(
            `Credito ${provider} esaurito`,
            ErrorType.API_QUOTA_EXCEEDED,
            402,
            {
                severity: ErrorSeverity.HIGH,
                retryable: false,
                context: { provider },
            }
        ),

    // Rate limit
    rateLimit: (retryAfter?: number) =>
        new ApiError(
            'Troppi tentativi. Riprova tra qualche istante',
            ErrorType.API_RATE_LIMIT,
            429,
            {
                severity: ErrorSeverity.MEDIUM,
                retryable: true,
                context: { retryAfter },
            }
        ),

    // Timeout
    timeout: (operation: string) =>
        new ApiError(
            `Timeout durante: ${operation}`,
            ErrorType.API_TIMEOUT,
            504,
            {
                severity: ErrorSeverity.MEDIUM,
                retryable: true,
                context: { operation },
            }
        ),

    // Prerequisiti non soddisfatti
    prerequisiteNotMet: (message: string, context?: ErrorContext) =>
        new ApiError(message, ErrorType.PREREQUISITE_NOT_MET, 400, {
            severity: ErrorSeverity.MEDIUM,
            context,
        }),

    // Stato non valido
    invalidState: (message: string, context?: ErrorContext) =>
        new ApiError(message, ErrorType.INVALID_STATE, 400, {
            severity: ErrorSeverity.MEDIUM,
            context,
        }),

    // Database error
    database: (message: string, originalError?: Error) =>
        new ApiError(message, ErrorType.DATABASE_ERROR, 500, {
            severity: ErrorSeverity.HIGH,
            originalError,
        }),

    // Errore generico API esterna
    externalApi: (provider: string, originalError?: Error) =>
        new ApiError(
            `Errore nell'API di ${provider}`,
            ErrorType.API_ERROR,
            502,
            {
                severity: ErrorSeverity.HIGH,
                retryable: true,
                originalError,
                context: { provider },
            }
        ),

    // Errore interno
    internal: (message: string, originalError?: Error) =>
        new ApiError(message, ErrorType.INTERNAL_ERROR, 500, {
            severity: ErrorSeverity.HIGH,
            originalError,
        }),
};

// ============================================================
// MESSAGGI USER-FRIENDLY
// ============================================================

const ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.VALIDATION_ERROR]: 'I dati inseriti non sono validi. Controlla e riprova.',
    [ErrorType.AUTH_ERROR]: 'Errore di autenticazione. Effettua nuovamente il login.',
    [ErrorType.UNAUTHORIZED]: 'Non hai i permessi per eseguire questa operazione.',
    [ErrorType.API_KEY_INVALID]:
        '⚠️ API Key non valida. Configura le credenziali nelle impostazioni.',
    [ErrorType.API_QUOTA_EXCEEDED]:
        '💳 Credito API esaurito. Ricarica il tuo account o aggiorna la chiave API.',
    [ErrorType.API_RATE_LIMIT]:
        '⏱️ Troppi tentativi. Attendi qualche secondo e riprova.',
    [ErrorType.API_TIMEOUT]:
        '⏰ L\'operazione sta richiedendo troppo tempo. Riprova.',
    [ErrorType.API_ERROR]:
        '🔌 Problema di connessione con il servizio esterno. Riprova tra poco.',
    [ErrorType.DATABASE_ERROR]:
        '💾 Errore nel salvataggio dei dati. Riprova o contatta il supporto.',
    [ErrorType.NOT_FOUND]: '🔍 Elemento non trovato.',
    [ErrorType.ALREADY_EXISTS]: 'Elemento già esistente.',
    [ErrorType.INVALID_STATE]:
        '⚠️ Operazione non valida nello stato attuale.',
    [ErrorType.PREREQUISITE_NOT_MET]:
        '📋 Prerequisiti non soddisfatti. Completa i passi precedenti.',
    [ErrorType.INTERNAL_ERROR]:
        '❌ Errore interno del server. Riprova o contatta il supporto.',
    [ErrorType.NETWORK_ERROR]:
        '🌐 Problema di connessione. Controlla la tua rete.',
    [ErrorType.UNKNOWN_ERROR]: '❓ Si è verificato un errore imprevisto.',
};

export function getErrorMessage(code: ErrorType): string {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
}

// ============================================================
// UTILITY per identificare tipo di errore da messaggio OpenAI
// ============================================================

export function parseOpenAIError(error: any): ApiError {
    const message = error?.message || error?.toString() || 'Unknown error';
    const statusCode = error?.status || error?.statusCode;

    // API Key non valida
    if (
        message.includes('Invalid API Key') ||
        message.includes('Incorrect API key') ||
        statusCode === 401
    ) {
        return ApiErrors.invalidApiKey();
    }

    // Quota esaurita
    if (
        message.includes('insufficient_quota') ||
        message.includes('quota exceeded') ||
        message.includes('billing') ||
        statusCode === 429
    ) {
        return ApiErrors.quotaExceeded();
    }

    // Rate limit
    if (message.includes('rate limit') || message.includes('Rate limit')) {
        const retryAfter = error?.headers?.['retry-after'];
        return ApiErrors.rateLimit(retryAfter);
    }

    // Timeout
    if (
        message.includes('timeout') ||
        message.includes('timed out') ||
        statusCode === 504
    ) {
        return ApiErrors.timeout('chiamata API OpenAI');
    }

    // Errore generico API
    return ApiErrors.externalApi('OpenAI', error);
}

// ============================================================
// HELPER per gestire errori nel backend
// ============================================================

export function handleApiError(error: unknown): ApiError {
    // Se è già un ApiError, ritornalo
    if (error instanceof ApiError) {
        return error;
    }

    // Se è un errore di OpenAI
    if (error && typeof error === 'object' && 'status' in error) {
        return parseOpenAIError(error);
    }

    // Se è un errore standard
    if (error instanceof Error) {
        return ApiErrors.internal(error.message, error);
    }

    // Errore sconosciuto
    return ApiErrors.internal(String(error));
}
