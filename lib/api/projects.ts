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
};
