import OpenAI from 'openai';

// Inizializza il client OpenAI
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Modello da usare - GPT-5 mini con Responses API (bilanciato qualità/costo)
export const DEFAULT_MODEL = 'gpt-5-mini';

// Configurazione default per GPT-5
// Nota: GPT-5 NON supporta temperature, top_p, frequency_penalty, presence_penalty
// Usa invece reasoning effort e verbosity
export const DEFAULT_CONFIG = {
    model: DEFAULT_MODEL,
    reasoning: {
        effort: 'medium' as const, // minimal, low, medium, high
    },
    text: {
        verbosity: 'medium' as const, // low, medium, high
    },
    max_output_tokens: 16000, // Aumentato per contenuti lunghi come capitoli
};

/**
 * Helper per loggare le chiamate API con il modello utilizzato
 */
export function logAPICall(operation: string, model: string, tokens?: number) {
    console.log(`[OpenAI API] ${operation} - Model: ${model}${tokens ? ` - Tokens: ${tokens}` : ''}`);
}
