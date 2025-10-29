import { ProjectAIConfig, ReasoningEffort, Verbosity } from '@/types';

/**
 * Valori di default per una nuova configurazione AI
 * Solo parametri tecnici - stile e contenuto vengono dall'onboarding del progetto
 */
export const DEFAULT_AI_CONFIG = {
    // AI Model Parameters
    model: 'gpt-5' as const,

    // GPT-5 Parameters
    reasoningEffort: 'medium' as ReasoningEffort,
    verbosity: 'medium' as Verbosity,
    maxTokens: 20000, // Aumentato per capitoli completi (evita troncamenti)

    // Legacy parameters (per compatibilità)
    temperature: null,
    topP: null,
    frequencyPenalty: null,
    presencePenalty: null,

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
 * Limiti e validazioni per i parametri AI GPT-5
 */
export const AI_CONFIG_LIMITS = {
    reasoningEffort: {
        options: ['minimal', 'low', 'medium', 'high'] as ReasoningEffort[],
        default: 'medium' as ReasoningEffort,
        descriptions: {
            minimal: 'Fastest, minimal reasoning tokens',
            low: 'Quick responses, basic reasoning',
            medium: 'Balanced speed and quality',
            high: 'Deep reasoning for complex tasks',
        },
    },
    verbosity: {
        options: ['low', 'medium', 'high'] as Verbosity[],
        default: 'medium' as Verbosity,
        descriptions: {
            low: 'Concise, brief responses',
            medium: 'Standard detail level',
            high: 'Detailed, thorough explanations',
        },
    },
    maxTokens: {
        min: 500,
        max: 16000,
        step: 100,
        default: 4000,
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
 * Valida una configurazione AI GPT-5
 */
export function validateAIConfig(config: Partial<ProjectAIConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valida reasoning effort
    if (config.reasoningEffort !== undefined) {
        if (!AI_CONFIG_LIMITS.reasoningEffort.options.includes(config.reasoningEffort as ReasoningEffort)) {
            errors.push(`Reasoning Effort deve essere uno di: ${AI_CONFIG_LIMITS.reasoningEffort.options.join(', ')}`);
        }
    }

    // Valida verbosity
    if (config.verbosity !== undefined) {
        if (!AI_CONFIG_LIMITS.verbosity.options.includes(config.verbosity as Verbosity)) {
            errors.push(`Verbosity deve essere uno di: ${AI_CONFIG_LIMITS.verbosity.options.join(', ')}`);
        }
    }

    // Valida maxTokens
    if (config.maxTokens !== undefined) {
        if (config.maxTokens < AI_CONFIG_LIMITS.maxTokens.min || config.maxTokens > AI_CONFIG_LIMITS.maxTokens.max) {
            errors.push(`Max Tokens deve essere tra ${AI_CONFIG_LIMITS.maxTokens.min} e ${AI_CONFIG_LIMITS.maxTokens.max}`);
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
