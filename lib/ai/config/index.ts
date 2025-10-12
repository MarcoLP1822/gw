/**
 * AI Configuration Module
 * 
 * Questo modulo gestisce la configurazione AI per ogni progetto,
 * permettendo di personalizzare i parametri tecnici e i prompts.
 * Lo stile e il contenuto sono definiti durante l'onboarding del progetto.
 */

export * from './defaults';
export * from './ai-config-service';

// Re-export Prisma type
export type { ProjectAIConfig } from '@prisma/client';

// Re-export custom types
export type {
    AIConfigFormData,
    AIModel,
} from '@/types';
