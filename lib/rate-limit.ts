/**
 * Rate Limiting Middleware
 * 
 * Protegge le API routes da abusi limitando il numero di richieste
 * per IP address in una finestra temporale
 */

import { NextRequest } from 'next/server'
import { ApiErrors } from '@/lib/errors/api-errors'

interface RateLimitConfig {
    interval: number // Finestra temporale in ms
    uniqueTokenPerInterval: number // Max richieste per finestra
}

// Store per tracking richieste (in produzione usare Redis)
const tokenCache = new Map<string, number[]>()

/**
 * Estrae identificatore univoco dalla richiesta
 */
function getIdentifier(request: NextRequest): string {
    // In produzione, usare l'IP o l'user ID
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return ip
}

/**
 * Pulisce token vecchi dalla cache
 */
function cleanupOldTokens(tokens: number[], windowStart: number): number[] {
    return tokens.filter(timestamp => timestamp > windowStart)
}

/**
 * Rate limiting function
 */
export async function rateLimit(
    request: NextRequest,
    config: RateLimitConfig = {
        interval: 60 * 1000, // 1 minuto
        uniqueTokenPerInterval: 10, // 10 richieste per minuto
    }
): Promise<void> {
    const identifier = getIdentifier(request)
    const now = Date.now()
    const windowStart = now - config.interval

    // Ottieni o inizializza i token per questo identifier
    const tokens = tokenCache.get(identifier) || []

    // Pulisci token vecchi
    const validTokens = cleanupOldTokens(tokens, windowStart)

    // Verifica se ha superato il limite
    if (validTokens.length >= config.uniqueTokenPerInterval) {
        const oldestToken = validTokens[0]
        const resetTime = Math.ceil((oldestToken + config.interval - now) / 1000)

        throw ApiErrors.rateLimit(resetTime)
    }

    // Aggiungi nuovo token
    validTokens.push(now)
    tokenCache.set(identifier, validTokens)
}

/**
 * Configurazioni predefinite per diversi endpoint
 */
export const RateLimitPresets = {
    // Generazione AI - molto costosa
    AI_GENERATION: {
        interval: 60 * 1000, // 1 minuto
        uniqueTokenPerInterval: 2, // Max 2 generazioni al minuto
    },

    // Upload documenti
    FILE_UPLOAD: {
        interval: 60 * 1000,
        uniqueTokenPerInterval: 5, // Max 5 upload al minuto
    },

    // API lettura (GET)
    READ_API: {
        interval: 60 * 1000,
        uniqueTokenPerInterval: 30, // Max 30 richieste al minuto
    },

    // API scrittura (POST/PUT/DELETE)
    WRITE_API: {
        interval: 60 * 1000,
        uniqueTokenPerInterval: 15, // Max 15 richieste al minuto
    },

    // Autenticazione
    AUTH: {
        interval: 60 * 1000,
        uniqueTokenPerInterval: 5, // Max 5 tentativi al minuto
    },
}

/**
 * Helper per applicare rate limit in API routes
 */
export async function withRateLimit<T>(
    request: NextRequest,
    handler: () => Promise<T>,
    config?: RateLimitConfig
): Promise<T> {
    await rateLimit(request, config)
    return handler()
}

// Example usage in API routes:
/*
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors/api-errors'

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        await rateLimit(request, RateLimitPresets.AI_GENERATION)
        
        // Your handler logic
        const result = await generateChapter(...)
        
        return NextResponse.json({ success: true, result })
    } catch (error) {
        const apiError = handleApiError(error)
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
    }
}

// O con helper
export async function POST(request: NextRequest) {
    return withRateLimit(
        request,
        async () => {
            const result = await generateChapter(...)
            return NextResponse.json({ success: true, result })
        },
        RateLimitPresets.AI_GENERATION
    )
}
*/

/**
 * Cleanup periodico della cache (esegui ogni ora)
 */
export function startRateLimitCleanup() {
    setInterval(() => {
        const now = Date.now()
        const maxAge = 60 * 60 * 1000 // 1 ora

        for (const [identifier, tokens] of tokenCache.entries()) {
            const validTokens = tokens.filter(timestamp => timestamp > now - maxAge)

            if (validTokens.length === 0) {
                tokenCache.delete(identifier)
            } else {
                tokenCache.set(identifier, validTokens)
            }
        }
    }, 60 * 60 * 1000) // Ogni ora
}

// Auto-start cleanup in server environment
if (typeof window === 'undefined') {
    startRateLimitCleanup()
}
