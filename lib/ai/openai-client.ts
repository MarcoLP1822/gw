import OpenAI from 'openai';

// Inizializza il client OpenAI
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Modello da usare (gpt-4o-mini è il più economico e veloce)
export const DEFAULT_MODEL = 'gpt-4o-mini';

// Configurazione default
export const DEFAULT_CONFIG = {
    model: DEFAULT_MODEL,
    temperature: 0.7, // Creatività moderata
    max_tokens: 4000, // Abbastanza per un outline completo
};
