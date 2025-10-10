import { ProjectFormData } from '@/types';

// ============================================================
// API CLIENT per Projects
// ============================================================

export const projectsApi = {
    // Crea un nuovo progetto
    async create(data: ProjectFormData) {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante la creazione del progetto');
        }

        return response.json();
    },

    // Ottieni tutti i progetti
    async getAll() {
        const response = await fetch('/api/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante il recupero dei progetti');
        }

        return response.json();
    },

    // Ottieni un progetto specifico
    async getById(id: string) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante il recupero del progetto');
        }

        return response.json();
    },

    // Aggiorna un progetto
    async update(id: string, data: Partial<ProjectFormData> & { status?: string }) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'aggiornamento del progetto');
        }

        return response.json();
    },

    // Elimina un progetto
    async delete(id: string) {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'eliminazione del progetto');
        }

        return response.json();
    },

    // ============================================================
    // CHAPTER GENERATION
    // ============================================================

    // Genera un capitolo
    async generateChapter(projectId: string, chapterNumber: number) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante la generazione del capitolo');
        }

        return response.json();
    },

    // Ottieni un capitolo
    async getChapter(projectId: string, chapterNumber: number) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante il recupero del capitolo');
        }

        return response.json();
    },

    // Aggiorna contenuto capitolo (edit manuale)
    async updateChapter(projectId: string, chapterNumber: number, content: string) {
        const response = await fetch(`/api/projects/${projectId}/chapters/${chapterNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'aggiornamento del capitolo');
        }

        return response.json();
    },

    // ============================================================
    // CONSISTENCY CHECK
    // ============================================================

    // Esegue consistency check finale
    async runConsistencyCheck(projectId: string) {
        const response = await fetch(`/api/projects/${projectId}/consistency-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante il consistency check');
        }

        return response.json();
    },

    // Ottieni ultimo consistency report
    async getConsistencyReport(projectId: string) {
        const response = await fetch(`/api/projects/${projectId}/consistency-check`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante il recupero del report');
        }

        return response.json();
    },
};
