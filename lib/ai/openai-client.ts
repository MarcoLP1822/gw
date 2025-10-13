import OpenAI from 'openai';

// Inizializza il client OpenAI
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Modello da usare - AGGIORNATO al nuovo modello
export const DEFAULT_MODEL = 'gpt-5-mini-2025-08-07';

// Configurazione default
export const DEFAULT_CONFIG = {
    model: DEFAULT_MODEL,
    temperature: 0.7, // Creatività moderata
    max_tokens: 4000, // Abbastanza per un outline completo
};

/**
 * Helper per loggare le chiamate API con il modello utilizzato
 */
export function logAPICall(operation: string, model: string, tokens?: number) {
    console.log(`[OpenAI API] ${operation} - Model: ${model}${tokens ? ` - Tokens: ${tokens}` : ''}`);
}
