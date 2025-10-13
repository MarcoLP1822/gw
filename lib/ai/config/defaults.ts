import { ProjectAIConfig } from '@/types';

/**
 * Valori di default per una nuova configurazione AI
 * Solo parametri tecnici - stile e contenuto vengono dall'onboarding del progetto
 */
export const DEFAULT_AI_CONFIG = {
    // AI Model Parameters
    model: 'gpt-5-mini-2025-08-07' as const,
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.95,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,

    // Chapter Generation Settings
    targetWordsPerChapter: 2000,

    // Custom Prompts
    useCustomPrompts: false,
    customSystemPrompt: undefined,
    customOutlineInstructions: undefined,
    customChapterInstructions: undefined,

    // Testing
    lastTestAt: undefined,
    testOutput: undefined,
};

/**
 * Limiti e validazioni per i parametri AI
 */
export const AI_CONFIG_LIMITS = {
    temperature: {
        min: 0.0,
        max: 2.0,
        step: 0.1,
        default: 0.7,
    },
    maxTokens: {
        min: 500,
        max: 16000,
        step: 100,
        default: 4000,
    },
    topP: {
        min: 0.0,
        max: 1.0,
        step: 0.05,
        default: 0.95,
    },
    frequencyPenalty: {
        min: -2.0,
        max: 2.0,
        step: 0.1,
        default: 0.3,
    },
    presencePenalty: {
        min: -2.0,
        max: 2.0,
        step: 0.1,
        default: 0.3,
    },
    targetWordsPerChapter: {
        min: 1000,
        max: 7000,
        step: 100,
        default: 2000,
    },
};

/**
 * Crea una configurazione AI di default per un progetto
 */
export function createDefaultAIConfig(projectId: string): Omit<ProjectAIConfig, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        projectId,
        ...DEFAULT_AI_CONFIG,
    };
}

/**
 * Valida una configurazione AI
 */
export function validateAIConfig(config: Partial<ProjectAIConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valida temperature
    if (config.temperature !== undefined) {
        if (config.temperature < AI_CONFIG_LIMITS.temperature.min || config.temperature > AI_CONFIG_LIMITS.temperature.max) {
            errors.push(`Temperature deve essere tra ${AI_CONFIG_LIMITS.temperature.min} e ${AI_CONFIG_LIMITS.temperature.max}`);
        }
    }

    // Valida maxTokens
    if (config.maxTokens !== undefined) {
        if (config.maxTokens < AI_CONFIG_LIMITS.maxTokens.min || config.maxTokens > AI_CONFIG_LIMITS.maxTokens.max) {
            errors.push(`Max Tokens deve essere tra ${AI_CONFIG_LIMITS.maxTokens.min} e ${AI_CONFIG_LIMITS.maxTokens.max}`);
        }
    }

    // Valida topP
    if (config.topP !== undefined) {
        if (config.topP < AI_CONFIG_LIMITS.topP.min || config.topP > AI_CONFIG_LIMITS.topP.max) {
            errors.push(`Top P deve essere tra ${AI_CONFIG_LIMITS.topP.min} e ${AI_CONFIG_LIMITS.topP.max}`);
        }
    }

    // Valida frequencyPenalty
    if (config.frequencyPenalty !== undefined) {
        if (config.frequencyPenalty < AI_CONFIG_LIMITS.frequencyPenalty.min || config.frequencyPenalty > AI_CONFIG_LIMITS.frequencyPenalty.max) {
            errors.push(`Frequency Penalty deve essere tra ${AI_CONFIG_LIMITS.frequencyPenalty.min} e ${AI_CONFIG_LIMITS.frequencyPenalty.max}`);
        }
    }

    // Valida presencePenalty
    if (config.presencePenalty !== undefined) {
        if (config.presencePenalty < AI_CONFIG_LIMITS.presencePenalty.min || config.presencePenalty > AI_CONFIG_LIMITS.presencePenalty.max) {
            errors.push(`Presence Penalty deve essere tra ${AI_CONFIG_LIMITS.presencePenalty.min} e ${AI_CONFIG_LIMITS.presencePenalty.max}`);
        }
    }

    // Valida targetWordsPerChapter
    if (config.targetWordsPerChapter !== undefined) {
        if (config.targetWordsPerChapter < AI_CONFIG_LIMITS.targetWordsPerChapter.min || config.targetWordsPerChapter > AI_CONFIG_LIMITS.targetWordsPerChapter.max) {
            errors.push(`Target words per chapter deve essere tra ${AI_CONFIG_LIMITS.targetWordsPerChapter.min} e ${AI_CONFIG_LIMITS.targetWordsPerChapter.max}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
