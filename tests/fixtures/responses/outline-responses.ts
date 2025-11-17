// Mock AI responses for outline generation
export const mockOutlineResponse = {
    chapters: [
        {
            number: 1,
            title: 'Introduzione',
            description: 'Presentazione del libro e del percorso che affronteremo',
            estimatedWords: 5000,
        },
        {
            number: 2,
            title: 'La Situazione Attuale',
            description: 'Analisi del contesto e delle sfide presenti',
            estimatedWords: 5000,
        },
        {
            number: 3,
            title: 'Le Sfide da Affrontare',
            description: 'Identificazione degli ostacoli principali',
            estimatedWords: 5000,
        },
        {
            number: 4,
            title: 'Strategie di Successo',
            description: 'Metodologie e approcci vincenti',
            estimatedWords: 5000,
        },
        {
            number: 5,
            title: 'Implementazione Pratica',
            description: 'Guida step-by-step all\'applicazione',
            estimatedWords: 5000,
        },
        {
            number: 6,
            title: 'Conclusioni e Prossimi Passi',
            description: 'Riepilogo e guida per il futuro',
            estimatedWords: 5000,
        },
    ],
    totalChapters: 6,
    estimatedWords: 30000,
};

export const mockOutlineResponseJSON = JSON.stringify(mockOutlineResponse);
