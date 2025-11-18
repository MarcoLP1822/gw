/**
 * Sistema di gestione dello stato della generazione batch
 * Usa localStorage per persistere lo stato tra navigazioni
 */

import { logger } from '@/lib/logger';

export interface GenerationState {
    projectId: string;
    isGenerating: boolean;
    currentChapter: number | null;
    totalChapters: number;
    completedChapters: number;
    startedAt: number; // timestamp
    stopRequested: boolean;
}

const STORAGE_KEY = 'ghost-generation-state';

export const GenerationStateManager = {
    /**
     * Salva lo stato corrente della generazione
     */
    save(state: GenerationState): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            logger.error('Error saving generation state:', error);
        }
    },

    /**
     * Carica lo stato della generazione
     */
    load(): GenerationState | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const state = JSON.parse(stored) as GenerationState;

            // Verifica che non sia troppo vecchio (max 24 ore)
            const age = Date.now() - state.startedAt;
            if (age > 24 * 60 * 60 * 1000) {
                this.clear();
                return null;
            }

            return state;
        } catch (error) {
            logger.error('Error loading generation state:', error);
            return null;
        }
    },

    /**
     * Aggiorna lo stato esistente
     */
    update(updates: Partial<GenerationState>): void {
        const current = this.load();
        if (!current) return;

        this.save({ ...current, ...updates });
    },

    /**
     * Pulisce lo stato
     */
    clear(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            logger.error('Error clearing generation state:', error);
        }
    },

    /**
     * Controlla se c'è una generazione in corso
     */
    hasActiveGeneration(): boolean {
        const state = this.load();
        return state?.isGenerating ?? false;
    },

    /**
     * Ottieni lo stato per un progetto specifico
     */
    getForProject(projectId: string): GenerationState | null {
        const state = this.load();
        if (!state || state.projectId !== projectId) return null;
        return state;
    }
};
