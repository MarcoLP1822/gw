/**
 * Sistema di Logging Strutturato
 * 
 * Sostituisce console.log con un sistema più robusto
 * che supporta livelli, contesto e integrazione con servizi esterni
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, any>

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: LogContext
    error?: Error
}

class Logger {
    private isDevelopment: boolean
    private isProduction: boolean

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development'
        this.isProduction = process.env.NODE_ENV === 'production'
    }

    /**
     * Formatta un log entry
     */
    private format(entry: LogEntry): string {
        const { level, message, timestamp, context } = entry
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`
        const contextStr = context ? ` ${JSON.stringify(context)}` : ''
        return `${prefix} ${message}${contextStr}`
    }

    /**
     * Invia log a servizio esterno (Sentry, LogRocket, etc.)
     */
    private sendToExternalService(entry: LogEntry) {
        if (!this.isProduction) return

        // TODO: Implementare integrazione con Sentry o altro servizio
        // Example:
        // if (entry.level === 'error' && entry.error) {
        //     Sentry.captureException(entry.error, {
        //         extra: entry.context
        //     })
        // }
    }

    /**
     * Log generico
     */
    private log(level: LogLevel, message: string, contextOrError?: LogContext | Error | unknown) {
        const timestamp = new Date().toISOString()
        const entry: LogEntry = {
            level,
            message,
            timestamp,
        }

        if (contextOrError instanceof Error) {
            entry.error = contextOrError
            entry.context = {
                errorMessage: contextOrError.message,
                errorStack: contextOrError.stack
            }
        } else if (contextOrError && typeof contextOrError === 'object') {
            // Handle unknown errors from catch blocks
            const errorObj = contextOrError as any
            if (errorObj.message) {
                entry.error = new Error(errorObj.message)
                entry.context = {
                    errorMessage: errorObj.message,
                    errorStack: errorObj.stack,
                    ...errorObj
                }
            } else {
                entry.context = contextOrError as LogContext
            }
        } else if (contextOrError) {
            entry.context = { value: contextOrError }
        }

        // Console output (solo in development o per warn/error)
        if (this.isDevelopment || level === 'warn' || level === 'error') {
            const formatted = this.format(entry)

            switch (level) {
                case 'debug':
                case 'info':
                    console.log(formatted)
                    break
                case 'warn':
                    console.warn(formatted)
                    break
                case 'error':
                    console.error(formatted, entry.error)
                    break
            }
        }

        // Invia a servizio esterno in produzione
        if (this.isProduction && (level === 'warn' || level === 'error')) {
            this.sendToExternalService(entry)
        }
    }

    /**
     * Debug - Solo in development
     */
    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            this.log('debug', message, context)
        }
    }

    /**
     * Info - Informazioni generali
     */
    info(message: string, context?: LogContext) {
        this.log('info', message, context)
    }

    /**
     * Warning - Situazioni anomale ma non critiche
     */
    warn(message: string, context?: LogContext) {
        this.log('warn', message, context)
    }

    /**
     * Error - Errori che richiedono attenzione
     */
    error(message: string, error?: Error | unknown, context?: LogContext) {
        const combinedContext = {
            ...context,
            ...(error instanceof Error ? {
                errorName: error.name,
                errorMessage: error.message,
            } : {})
        }
        this.log('error', message, error || combinedContext)
    }

    /**
     * Helper per timing operations
     */
    time(label: string): () => void {
        const start = Date.now()
        return () => {
            const duration = Date.now() - start
            this.debug(`⏱️  ${label}`, { duration: `${duration}ms` })
        }
    }

    /**
     * Helper per API calls logging
     */
    apiCall(method: string, path: string, status: number, duration?: number) {
        const context: LogContext = {
            method,
            path,
            status,
            ...(duration ? { duration: `${duration}ms` } : {})
        }

        if (status >= 500) {
            this.error(`API ${method} ${path} - ${status}`, undefined, context)
        } else if (status >= 400) {
            this.warn(`API ${method} ${path} - ${status}`, context)
        } else {
            this.info(`API ${method} ${path} - ${status}`, context)
        }
    }

    /**
     * Helper per database operations
     */
    db(operation: string, model: string, success: boolean, error?: Error) {
        const context: LogContext = {
            operation,
            model,
            success
        }

        if (success) {
            this.debug(`DB ${operation} ${model}`, context)
        } else {
            this.error(`DB ${operation} ${model} failed`, error, context)
        }
    }

    /**
     * Helper per OpenAI API calls
     */
    openai(operation: string, model: string, tokens?: number, cost?: number) {
        const context: LogContext = {
            operation,
            model,
            ...(tokens ? { tokens } : {}),
            ...(cost ? { cost: `$${cost.toFixed(4)}` } : {})
        }
        this.info(`OpenAI ${operation}`, context)
    }
}

// Export singleton instance
export const logger = new Logger()

// Export helper per migrare da console.log
export const log = logger.info.bind(logger)
export const logError = logger.error.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logDebug = logger.debug.bind(logger)

// Example usage:
/*
// Prima
console.log('Project created:', projectId)
console.error('Error generating chapter:', error)

// Dopo
import { logger } from '@/lib/logger'

logger.info('Project created', { projectId })
logger.error('Error generating chapter', error, { projectId, chapterNumber })

// Con timing
const endTimer = logger.time('Generate Chapter')
await generateChapter(projectId, chapterNumber)
endTimer() // Logga: ⏱️  Generate Chapter (1234ms)

// API logging
logger.apiCall('POST', '/api/projects', 201, 150)

// Database logging
try {
    const project = await prisma.project.create({ data })
    logger.db('create', 'Project', true)
} catch (error) {
    logger.db('create', 'Project', false, error)
}

// OpenAI logging
logger.openai('chat.completions', 'gpt-5-mini', 1500, 0.025)
*/
