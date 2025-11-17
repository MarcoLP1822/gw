import { prisma } from '@/lib/db';
import type { ProjectAIConfig } from '@prisma/client';
import { DEFAULT_AI_CONFIG, validateAIConfig } from './defaults';
import { randomUUID } from 'crypto';

/**
 * Service per gestire le configurazioni AI dei progetti
 */
export class AIConfigService {
    /**
     * Recupera la configurazione AI di un progetto
     * Se non esiste, crea una configurazione di default
     */
    static async getOrCreate(projectId: string): Promise<ProjectAIConfig> {
        // Cerca configurazione esistente
        let config = await prisma.projectAIConfig.findUnique({
            where: { projectId },
        });

        // Se non esiste, crea default
        if (!config) {
            config = await this.createDefault(projectId);
        }

        return config;
    }

    /**
     * Crea una configurazione di default per un progetto
     */
    static async createDefault(projectId: string): Promise<ProjectAIConfig> {
        const config = await prisma.projectAIConfig.create({
            data: {
                id: randomUUID(),
                projectId,
                ...DEFAULT_AI_CONFIG,
                updatedAt: new Date(),
            },
        });

        return config;
    }

    /**
     * Aggiorna la configurazione AI
     */
    static async update(
        projectId: string,
        data: Partial<Omit<ProjectAIConfig, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
    ): Promise<ProjectAIConfig> {
        // Valida i dati (cast temporaneo per validazione)
        const validation = validateAIConfig(data as any);
        if (!validation.valid) {
            throw new Error(`Configurazione non valida: ${validation.errors.join(', ')}`);
        }

        // Aggiorna nel database
        const config = await prisma.projectAIConfig.upsert({
            where: { projectId },
            create: {
                id: randomUUID(),
                projectId,
                ...DEFAULT_AI_CONFIG,
                ...data,
                updatedAt: new Date(),
            },
            update: { ...data, updatedAt: new Date() },
        });

        return config;
    }

    /**
     * Reset alla configurazione di default
     */
    static async reset(projectId: string): Promise<ProjectAIConfig> {
        const config = await prisma.projectAIConfig.upsert({
            where: { projectId },
            create: {
                id: randomUUID(),
                projectId,
                ...DEFAULT_AI_CONFIG,
                updatedAt: new Date(),
            },
            update: DEFAULT_AI_CONFIG,
        });

        return config;
    }

    /**
     * Salva output di test
     */
    static async saveTestOutput(projectId: string, output: string): Promise<void> {
        await prisma.projectAIConfig.update({
            where: { projectId },
            data: {
                lastTestAt: new Date(),
                testOutput: output,
            },
        });
    }

    /**
     * Verifica se un progetto ha una configurazione custom
     */
    static async hasCustomConfig(projectId: string): Promise<boolean> {
        const config = await prisma.projectAIConfig.findUnique({
            where: { projectId },
        });

        if (!config) return false;

        // Confronta con default - solo parametri tecnici
        const isCustom =
            config.model !== DEFAULT_AI_CONFIG.model ||
            config.temperature !== DEFAULT_AI_CONFIG.temperature ||
            config.maxTokens !== DEFAULT_AI_CONFIG.maxTokens ||
            config.topP !== DEFAULT_AI_CONFIG.topP ||
            config.frequencyPenalty !== DEFAULT_AI_CONFIG.frequencyPenalty ||
            config.presencePenalty !== DEFAULT_AI_CONFIG.presencePenalty ||
            config.targetWordsPerChapter !== DEFAULT_AI_CONFIG.targetWordsPerChapter ||
            config.useCustomPrompts;

        return isCustom;
    }

    /**
     * Duplica configurazione da un progetto all'altro
     */
    static async duplicate(sourceProjectId: string, targetProjectId: string): Promise<ProjectAIConfig> {
        const sourceConfig = await prisma.projectAIConfig.findUnique({
            where: { projectId: sourceProjectId },
        });

        if (!sourceConfig) {
            return this.createDefault(targetProjectId);
        }

        const { id, projectId, createdAt, updatedAt, ...configData } = sourceConfig;

        const newConfig = await prisma.projectAIConfig.create({
            data: {
                id: randomUUID(),
                projectId: targetProjectId,
                ...configData,
                updatedAt: new Date(),
            },
        });

        return newConfig;
    }

    /**
     * Elimina configurazione (torna a default)
     */
    static async delete(projectId: string): Promise<void> {
        await prisma.projectAIConfig.delete({
            where: { projectId },
        });
    }
}
