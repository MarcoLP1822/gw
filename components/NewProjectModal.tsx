'use client';

import { useState } from 'react';
import Modal from './Modal';
import { User, Building2, Target, BookOpen, Lightbulb, Users as UsersIcon, TrendingUp, AlertCircle } from 'lucide-react';
import { ProjectFormData } from '@/types';

interface NewProjectModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction: (projectData: ProjectFormData) => void;
}

export default function NewProjectModal({ isOpen, onCloseAction, onSubmitAction }: NewProjectModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        authorName: '',
        authorRole: '',
        company: '',
        industry: '',
        bookTitle: '',
        bookSubtitle: '',
        targetAudience: '',
        currentSituation: '',
        challengeFaced: '',
        transformation: '',
        achievement: '',
        lessonLearned: '',
        businessGoals: '',
        targetReaders: '',
        uniqueValue: '',
        estimatedPages: undefined,
        additionalNotes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitAction(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Modal isOpen={isOpen} onCloseAction={onCloseAction} title="Nuovo Progetto Ghost Writing" size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sezione 1: Informazioni Autore */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                        <User size={20} className="text-blue-600" />
                        <h3>Informazioni Autore</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="authorName"
                                value={formData.authorName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="es. Mario Rossi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ruolo/Posizione <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="authorRole"
                                value={formData.authorRole}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Seleziona...</option>
                                <option value="Imprenditore">Imprenditore</option>
                                <option value="CEO">CEO</option>
                                <option value="Founder/Co-founder">Founder/Co-founder</option>
                                <option value="YouTuber">YouTuber/Content Creator</option>
                                <option value="Startupper">Startupper</option>
                                <option value="Consulente">Consulente Aziendale</option>
                                <option value="Coach">Business Coach</option>
                                <option value="Investitore">Investitore</option>
                                <option value="Altro">Altro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Azienda/Brand <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nome azienda o brand personale"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Settore/Industria <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="es. Tech, Finance, E-commerce"
                            />
                        </div>
                    </div>
                </div>

                {/* Sezione 2: Informazioni Libro */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                        <BookOpen size={20} className="text-purple-600" />
                        <h3>Informazioni Libro</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titolo del Libro <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bookTitle"
                                value={formData.bookTitle}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Titolo principale (può essere provvisorio)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sottotitolo (opzionale)
                            </label>
                            <input
                                type="text"
                                name="bookSubtitle"
                                value={formData.bookSubtitle}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Sottotitolo esplicativo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target di Lettori <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="targetReaders"
                                value={formData.targetReaders}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Chi dovrebbe leggere questo libro? (es. giovani imprenditori, aspiranti founder, professionisti del settore tech...)"
                            />
                        </div>
                    </div>
                </div>

                {/* Sezione 3: Il Viaggio dell'Eroe (Business Journey) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                        <TrendingUp size={20} className="text-green-600" />
                        <h3>Il Viaggio Imprenditoriale</h3>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                        Raccontiamo la storia dell&apos;autore attraverso il framework narrativo applicato al business
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Situazione di Partenza <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="currentSituation"
                                value={formData.currentSituation}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Com'era la vita/carriera dell'autore prima di intraprendere questo percorso? Qual era il 'mondo ordinario'?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                La Sfida/Problema Affrontato <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="challengeFaced"
                                value={formData.challengeFaced}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Quale problema o opportunità ha spinto l'autore ad agire? Quali ostacoli ha dovuto superare?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Il Percorso di Trasformazione <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="transformation"
                                value={formData.transformation}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Come si è trasformato l'autore durante questo viaggio? Quali competenze, mindset, strategie ha sviluppato?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Risultati e Successi Ottenuti <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="achievement"
                                value={formData.achievement}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Quali sono i traguardi raggiunti? Risultati concreti, metriche, impatto generato..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lezione Principale e Messaggio <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="lessonLearned"
                                value={formData.lessonLearned}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Qual è il messaggio chiave che l'autore vuole trasmettere? La lezione più importante appresa?"
                            />
                        </div>
                    </div>
                </div>

                {/* Sezione 4: Obiettivi e Valore Unico */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                        <Target size={20} className="text-orange-600" />
                        <h3>Obiettivi e Posizionamento</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Obiettivi del Libro <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="businessGoals"
                                value={formData.businessGoals}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Perché scrivere questo libro? (es. autorevolezza, lead generation, personal branding, legacy...)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proposta di Valore Unica <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="uniqueValue"
                                value={formData.uniqueValue}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Cosa rende unica la storia/esperienza/metodo dell'autore? Perché i lettori dovrebbero leggere proprio questo libro?"
                            />
                        </div>
                    </div>
                </div>

                {/* Sezione 5: Dettagli Tecnici */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                        <AlertCircle size={20} className="text-indigo-600" />
                        <h3>Dettagli Progetto</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pagine Stimate
                            </label>
                            <input
                                type="number"
                                name="estimatedPages"
                                value={formData.estimatedPages || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="es. 200"
                                min="50"
                                max="1000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note Aggiuntive
                        </label>
                        <textarea
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Altre informazioni rilevanti, riferimenti, materiali esistenti, preferenze stilistiche..."
                        />
                    </div>
                </div>

                {/* Footer con pulsanti */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Crea Progetto
                    </button>
                </div>
            </form>
        </Modal>
    );
}
