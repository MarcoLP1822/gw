import { AIConfig } from '@prisma/client';

export const mockAIConfig: Partial<AIConfig> = {
    id: 'test-ai-config-id-1',
    projectId: 'test-project-id-1',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 20000,
    reasoningEffort: 'low',
    systemPrompt: 'Sei un ghost writer esperto...',
    customInstructions: 'Scrivi in modo professionale ma accessibile',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

export const mockAIConfigs: Partial<AIConfig>[] = [
    mockAIConfig,
    {
        id: 'test-ai-config-id-2',
        projectId: 'test-project-id-2',
        modelName: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 15000,
        reasoningEffort: 'medium',
        systemPrompt: 'Sei un esperto di marketing...',
        customInstructions: 'Usa un tono creativo e coinvolgente',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
    },
];

export const defaultAIConfig = {
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 20000,
    reasoningEffort: 'low',
    systemPrompt: 'Sei un ghost writer professionista specializzato nella scrittura di libri aziendali...',
    customInstructions: null,
};
