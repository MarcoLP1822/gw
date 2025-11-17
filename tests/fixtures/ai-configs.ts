import { ProjectAIConfig } from '@prisma/client';

export const mockAIConfig: Partial<ProjectAIConfig> = {
    id: 'test-ai-config-id-1',
    projectId: 'test-project-id-1',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 20000,
    reasoningEffort: 'low',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

export const mockAIConfigs: Partial<ProjectAIConfig>[] = [
    mockAIConfig,
    {
        id: 'test-ai-config-id-2',
        projectId: 'test-project-id-2',
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 15000,
        reasoningEffort: 'medium',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
    },
];

export const defaultAIConfig = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 20000,
    reasoningEffort: 'low',
};
