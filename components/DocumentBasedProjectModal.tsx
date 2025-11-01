/**
 * Document-Based Project Creation Modal
 * 
 * Flow:
 * 1. User uploads 1 document (PDF, DOCX, TXT - max 50MB)
 * 2. AI analyzes document → extracts project data + generates style guide
 * 3. Form appears with fields populated (but editable)
 * 4. User reviews, edits if needed, confirms
 * 5. Project is created normally
 */

'use client';

import { useState, useRef } from 'react';
import Modal from './Modal';
import { ProjectFormData } from '@/types';
import { Upload, Loader2, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { User, Building2, Target, BookOpen, Lightbulb, Users as UsersIcon, TrendingUp } from 'lucide-react';

interface DocumentBasedProjectModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction: (projectData: ProjectFormData & { styleGuide: string }) => void;
}

type Stage = 'upload' | 'analyzing' | 'review';

export default function DocumentBasedProjectModal({
    isOpen,
    onCloseAction,
    onSubmitAction
}: DocumentBasedProjectModalProps) {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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
    const [styleGuide, setStyleGuide] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validExtensions = ['pdf', 'docx', 'txt'];
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

        if (!validExtensions.includes(fileExtension || '')) {
            setError('Tipo di file non supportato. Usa PDF, DOCX o TXT');
            return;
        }

        // Validate file size (50MB)
        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('File troppo grande. Massimo 50MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        try {
            setAnalyzing(true);
            setError(null);
            setStage('analyzing');

            const formDataToSend = new FormData();
            formDataToSend.append('file', file);

            const response = await fetch('/api/projects/analyze-document', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante l\'analisi');
            }

            // Populate form with extracted data
            setFormData({
                authorName: data.projectData.authorName || '',
                authorRole: data.projectData.authorRole || '',
                company: data.projectData.company || '',
                industry: data.projectData.industry || '',
                bookTitle: data.projectData.bookTitle || '',
                bookSubtitle: data.projectData.bookSubtitle || '',
                targetAudience: data.projectData.targetReaders || '',
                currentSituation: data.projectData.currentSituation || '',
                challengeFaced: data.projectData.challengeFaced || '',
                transformation: data.projectData.transformation || '',
                achievement: data.projectData.achievement || '',
                lessonLearned: data.projectData.lessonLearned || '',
                businessGoals: data.projectData.businessGoals || '',
                targetReaders: data.projectData.targetReaders || '',
                uniqueValue: data.projectData.uniqueValue || '',
                estimatedPages: undefined,
                additionalNotes: data.projectData.additionalNotes || '',
            });

            setStyleGuide(data.styleGuide || '');
            setStage('review');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante l\'analisi');
            setStage('upload');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📤 Submitting document-based project with data:', formData);
        console.log('📝 Style guide length:', styleGuide.length);

        setSubmitting(true);

        onSubmitAction({
            ...formData,
            styleGuide
        });

        // Note: setSubmitting(false) sarà gestito dal parent component dopo la creazione
    };

    const handleClose = () => {
        // Reset state
        setStage('upload');
        setFile(null);
        setError(null);
        setAnalyzing(false);
        setSubmitting(false);
        setFormData({
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
        setStyleGuide('');
        onCloseAction();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Modal
            isOpen={isOpen}
            onCloseAction={handleClose}
            title="Crea Progetto da Documento"
            size="xl"
            preventClose={analyzing || stage === 'review'} // Blocca chiusura durante analisi e review
        >
            {/* Stage 1: Upload */}
            {stage === 'upload' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mb-4 p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Carica un documento di riferimento
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            L&apos;AI analizzerà il documento per estrarre informazioni e creare lo style guide
                        </p>
                    </div>

                    {/* File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Upload Area */}
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                Click per caricare un documento
                            </p>
                            <p className="text-xs text-gray-500">
                                PDF, DOCX, TXT • Max 50MB
                            </p>
                        </div>
                    ) : (
                        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <FileText className="w-10 h-10 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Rimuovi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || analyzing}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Analizza Documento
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 2: Analyzing */}
            {stage === 'analyzing' && (
                <div className="py-12 text-center">
                    <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-6" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Analisi in corso...
                    </h3>
                    <p className="text-sm text-gray-600 mb-8">
                        L&apos;AI sta analizzando il documento ed estraendo le informazioni
                    </p>

                    {/* Messaggio non chiudere */}
                    <div className="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                        <p className="text-xs text-blue-800">
                            ⚠️ Non chiudere questa finestra durante l&apos;analisi
                        </p>
                    </div>

                    <div className="space-y-3 max-w-md mx-auto">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <p className="text-sm text-blue-900">Estrazione testo dal documento</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                            <p className="text-sm text-purple-900">Generazione style guide</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                            <p className="text-sm text-green-900">Estrazione dati progetto</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage 3: Review Form (Same as NewProjectModal but pre-filled) */}
            {stage === 'review' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Success Message */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900">Analisi completata!</p>
                            <p className="text-xs text-green-700 mt-1">
                                I campi sono stati compilati automaticamente. Controlla e modifica se necessario.
                            </p>
                        </div>
                    </div>

                    {/* Sezione 1: Informazioni Autore */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                            <User size={20} className="text-blue-600" />
                            <h3>Informazioni Autore</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Nome Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="authorName"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="es. Mario Rossi"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Ruolo/Posizione <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="authorRole"
                                    value={formData.authorRole}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Azienda/Brand <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Nome azienda o brand personale"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Settore/Industria <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="es. Tech, Finance, E-commerce"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione 2: Informazioni Libro */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Titolo principale"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Chi dovrebbe leggere questo libro?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione 3: Storia e Contenuto */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                            <Lightbulb size={20} className="text-orange-600" />
                            <h3>Storia e Contenuto</h3>
                        </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Descrivi la situazione iniziale..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sfida/Problema Affrontato <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="challengeFaced"
                                    value={formData.challengeFaced}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Qual è stata la sfida principale?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trasformazione Avvenuta <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="transformation"
                                    value={formData.transformation}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Come è cambiata la situazione?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Risultato/Traguardo Raggiunto <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="achievement"
                                    value={formData.achievement}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Quali risultati sono stati ottenuti?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lezione Principale Appresa <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="lessonLearned"
                                    value={formData.lessonLearned}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Qual è l'insegnamento chiave?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione 4: Obiettivi */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                            <Target size={20} className="text-green-600" />
                            <h3>Obiettivi e Valore</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Obiettivi Business del Libro <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="businessGoals"
                                    value={formData.businessGoals}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Cosa vuoi ottenere con questo libro?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valore Unico/Differenziante <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="uniqueValue"
                                    value={formData.uniqueValue}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Cosa rende questa storia unica?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note Aggiuntive (opzionale)
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Altre informazioni rilevanti..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creazione...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Crea Progetto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
