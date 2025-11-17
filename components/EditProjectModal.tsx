'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProjectFormData } from '@/types';
import { logger } from '@/lib/logger';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    initialData: ProjectFormData;
}

export default function EditProjectModal({ isOpen, onClose, onSubmit, initialData }: EditProjectModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Aggiorna formData quando initialData cambia
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (field: keyof ProjectFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            logger.error('Error updating project', error);
            alert('Errore durante l\'aggiornamento del progetto');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const steps = [
        { number: 1, title: 'Informazioni Autore' },
        { number: 2, title: 'Informazioni Libro' },
        { number: 3, title: 'Hero\'s Journey' },
        { number: 4, title: 'Business Goals' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Modifica Progetto</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Aggiorna le informazioni del tuo libro
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${currentStep === step.number
                                        ? 'bg-blue-600 text-white'
                                        : currentStep > step.number
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {step.number}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                                    }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-250px)]">
                    <div className="p-6 space-y-6">
                        {/* Step 1: Informazioni Autore */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome Autore *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.authorName}
                                            onChange={(e) => handleInputChange('authorName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Mario Rossi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ruolo/Professione *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.authorRole}
                                            onChange={(e) => handleInputChange('authorRole', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="CEO, Imprenditore, Coach..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Azienda *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Nome dell'azienda"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Settore *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.industry}
                                            onChange={(e) => handleInputChange('industry', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tech, Finanza, Consulenza..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Informazioni Libro */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titolo del Libro *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bookTitle}
                                        onChange={(e) => handleInputChange('bookTitle', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Il titolo principale del libro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sottotitolo (opzionale)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.bookSubtitle || ''}
                                        onChange={(e) => handleInputChange('bookSubtitle', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Un sottotitolo descrittivo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Lettori *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.targetReaders}
                                        onChange={(e) => handleInputChange('targetReaders', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Chi dovrebbe leggere questo libro? (es. imprenditori che vogliono scalare il business...)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valore Unico *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.uniqueValue}
                                        onChange={(e) => handleInputChange('uniqueValue', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Cosa rende unico questo libro? Quale prospettiva originale offri?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pagine Stimate (opzionale)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.estimatedPages || ''}
                                        onChange={(e) => handleInputChange('estimatedPages', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="200"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Hero's Journey */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Racconta la tua storia seguendo la struttura del Viaggio dell&apos;Eroe
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        1. Situazione di Partenza (Mondo Ordinario) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.currentSituation}
                                        onChange={(e) => handleInputChange('currentSituation', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Qual era la tua situazione prima di iniziare questo percorso?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        2. Sfida Affrontata (La Chiamata) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.challengeFaced}
                                        onChange={(e) => handleInputChange('challengeFaced', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Quale problema o sfida ti ha spinto al cambiamento?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        3. Trasformazione (Il Viaggio) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.transformation}
                                        onChange={(e) => handleInputChange('transformation', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Come sei cambiato durante questo percorso?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        4. Risultato Ottenuto (La Vittoria) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.achievement}
                                        onChange={(e) => handleInputChange('achievement', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Quale risultato hai ottenuto?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        5. Lezione Appresa (L&apos;Elisir) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.lessonLearned}
                                        onChange={(e) => handleInputChange('lessonLearned', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Qual è la lezione principale che vuoi condividere?"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Business Goals */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Obiettivi del Libro *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.businessGoals}
                                        onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Cosa vuoi ottenere con questo libro? (es. aumentare autorevolezza, generare lead, lanciare un prodotto...)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note Aggiuntive (opzionale)
                                    </label>
                                    <textarea
                                        value={formData.additionalNotes || ''}
                                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Qualsiasi altra informazione utile per scrivere il libro..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with navigation */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
                        <button
                            type="button"
                            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Indietro
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Annulla
                            </button>

                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Avanti
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
