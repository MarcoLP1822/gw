/**
 * Web-Based Project Creation Modal
 * 
 * Flow:
 * 1. User inputs website URL(s)
 * 2. AI scrapes website → extracts text + generates style guide + extracts project data
 * 3. Form appears with fields populated (but editable)
 * 4. User reviews, edits if needed, confirms
 * 5. Project is created normally
 */

'use client';

import { useState } from 'react';
import Modal from './Modal';
import { ProjectFormData } from '@/types';
import { Loader2, CheckCircle2, AlertCircle, Globe, Sparkles, Plus, X } from 'lucide-react';
import { User, Building2, Target, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';

interface WebBasedProjectModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction: (projectData: ProjectFormData & { styleGuide: string }) => void;
}

type Stage = 'input-url' | 'analyzing' | 'review';

export default function WebBasedProjectModal({
    isOpen,
    onCloseAction,
    onSubmitAction
}: WebBasedProjectModalProps) {
    const [stage, setStage] = useState<Stage>('input-url');
    const [url, setUrl] = useState<string>('');
    const [urls, setUrls] = useState<string[]>(['']);
    const [multiUrlMode, setMultiUrlMode] = useState(false);
    const [crawlMode, setCrawlMode] = useState(false);
    const [maxDepth, setMaxDepth] = useState<number>(2);
    const [maxPages, setMaxPages] = useState<number>(20);
    const [error, setError] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [analysisStep, setAnalysisStep] = useState<number>(0); // 0=estrazione, 1=style guide, 2=dati progetto, 3=completato
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

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
        setError(null);
    };

    const handleUrlsChange = (index: number, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
        setError(null);
    };

    const addUrlField = () => {
        if (urls.length < 5) {
            setUrls([...urls, '']);
        }
    };

    const removeUrlField = (index: number) => {
        if (urls.length > 1) {
            const newUrls = urls.filter((_, i) => i !== index);
            setUrls(newUrls);
        }
    };

    const validateUrl = (urlString: string) => {
        try {
            const parsedUrl = new URL(urlString);
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch {
            return false;
        }
    };

    const handleAnalyze = async () => {
        // Determina quale modalità usare
        const urlsToAnalyze = multiUrlMode
            ? urls.filter(u => u.trim().length > 0)
            : [url];

        // Validazione
        if (urlsToAnalyze.length === 0 || (urlsToAnalyze.length === 1 && !urlsToAnalyze[0].trim())) {
            setError('Inserisci almeno un URL valido');
            return;
        }

        // Valida tutti gli URL
        for (const u of urlsToAnalyze) {
            if (!validateUrl(u)) {
                setError(`URL non valido: ${u}. Assicurati che inizi con http:// o https://`);
                return;
            }
        }

        try {
            setAnalyzing(true);
            setError(null);
            setStage('analyzing');
            setAnalysisStep(0); // Estrazione contenuto

            const body = urlsToAnalyze.length === 1
                ? {
                    url: urlsToAnalyze[0],
                    crawl: crawlMode,
                    maxDepth,
                    maxPages
                }
                : { urls: urlsToAnalyze };

            // Simula progresso visivo
            const progressTimer1 = setTimeout(() => setAnalysisStep(1), 3000); // Style guide dopo 3s
            const progressTimer2 = setTimeout(() => setAnalysisStep(2), 8000); // Dati progetto dopo 8s

            const response = await fetch('/api/projects/analyze-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            clearTimeout(progressTimer1);
            clearTimeout(progressTimer2);
            setAnalysisStep(3); // Completato

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante l\'analisi del sito web');
            }

            // Populate form with extracted data
            setFormData({
                authorName: data.projectData.authorName || '',
                authorRole: data.projectData.authorRole || '',
                company: data.projectData.company || '',
                industry: data.projectData.industry || '',
                bookTitle: data.projectData.bookTitle || '',
                bookSubtitle: data.projectData.bookSubtitle || '',
                targetAudience: data.projectData.targetAudience || '',
                currentSituation: data.projectData.currentSituation || '',
                challengeFaced: data.projectData.challengeFaced || '',
                transformation: data.projectData.transformation || '',
                achievement: data.projectData.achievement || '',
                lessonLearned: data.projectData.lessonLearned || '',
                businessGoals: data.projectData.businessGoals || '',
                targetReaders: data.projectData.targetReaders || '',
                uniqueValue: data.projectData.uniqueValue || '',
                estimatedPages: data.projectData.estimatedPages,
                additionalNotes: data.projectData.additionalNotes || `Analisi automatica da: ${urlsToAnalyze.join(', ')}`,
            });

            setStyleGuide(data.styleGuide || '');

            // Move to review stage
            setStage('review');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante l\'analisi');
            setStage('input-url');
            setAnalysisStep(0);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'estimatedPages' ? (value === '' ? undefined : parseInt(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        onSubmitAction({
            ...formData,
            styleGuide
        });

        // Note: setSubmitting(false) sarà gestito dal parent component dopo la creazione
    };

    const handleClose = () => {
        // Reset state
        setStage('input-url');
        setUrl('');
        setUrls(['']);
        setMultiUrlMode(false);
        setCrawlMode(false);
        setMaxDepth(2);
        setMaxPages(20);
        setError(null);
        setAnalyzing(false);
        setSubmitting(false);
        setAnalysisStep(0);
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

    return (
        <Modal
            isOpen={isOpen}
            onCloseAction={handleClose}
            title="Crea Progetto da Sito Web"
            size="xl"
            preventClose={analyzing || stage === 'review'} // Blocca chiusura durante analisi e review
        >
            {/* Stage 1: Input URL */}
            {stage === 'input-url' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                            <Globe className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Inserisci l&apos;URL del sito web
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            L&apos;AI analizzerà il sito per estrarre informazioni e creare lo style guide
                        </p>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-4">
                        {!multiUrlMode ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL del Sito Web
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={handleUrlChange}
                                            placeholder="https://example.com"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAnalyze();
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Inserisci l&apos;URL del sito dell&apos;autore, azienda o brand (es. homepage, pagina about, profilo LinkedIn)
                                    </p>
                                </div>

                                {/* Crawl Mode Toggle */}
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="crawlMode"
                                            checked={crawlMode}
                                            onChange={(e) => setCrawlMode(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="crawlMode" className="text-sm font-semibold text-purple-900 cursor-pointer flex items-center gap-2">
                                                🕷️ Crawling Intelligente Multi-Livello
                                                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-bold">NEW</span>
                                            </label>
                                            <p className="text-xs text-purple-800 mt-1">
                                                L&apos;AI esplorerà automaticamente le pagine interne del sito (fino a {maxDepth} livelli, max {maxPages} pagine) per ottenere contenuti più ricchi e completi
                                            </p>

                                            {crawlMode && (
                                                <div className="mt-3 space-y-3 pl-1">
                                                    <div>
                                                        <label className="text-xs font-medium text-purple-900">
                                                            Profondità: {maxDepth} {maxDepth === 1 ? 'livello' : 'livelli'}
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="3"
                                                            value={maxDepth}
                                                            onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                                                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                        />
                                                        <div className="flex justify-between text-xs text-purple-700 mt-1">
                                                            <span>Veloce</span>
                                                            <span>Bilanciato</span>
                                                            <span>Profondo</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-purple-900">
                                                            Massimo pagine: {maxPages}
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="5"
                                                            max="50"
                                                            step="5"
                                                            value={maxPages}
                                                            onChange={(e) => setMaxPages(parseInt(e.target.value))}
                                                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                        />
                                                        <div className="flex justify-between text-xs text-purple-700 mt-1">
                                                            <span>5</span>
                                                            <span>25</span>
                                                            <span>50</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMultiUrlMode(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Oppure specifica manualmente più URL
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        URL delle Pagine (max 5)
                                    </label>
                                    {urls.map((urlItem, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="url"
                                                value={urlItem}
                                                onChange={(e) => handleUrlsChange(index, e.target.value)}
                                                placeholder={`URL ${index + 1} (es. https://example.com/about)`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                            {urls.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeUrlField(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {urls.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addUrlField}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Aggiungi URL
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Suggerimento: aggiungi homepage + pagina &quot;Chi siamo&quot; + pagina &quot;Storia&quot; per risultati migliori
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMultiUrlMode(false);
                                        setUrls(['']);
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                                >
                                    ← Torna a un solo URL
                                </button>
                            </>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">L&apos;AI estrarrà automaticamente:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                                        <li>Informazioni sull&apos;autore/founder</li>
                                        <li>Storia dell&apos;azienda o brand</li>
                                        <li>Mission, valori e obiettivi</li>
                                        <li>Stile di comunicazione per lo style guide</li>
                                    </ul>
                                    {crawlMode && (
                                        <p className="mt-2 text-purple-700 font-medium">
                                            🕷️ Crawling attivo: esplorerà automaticamente {maxPages} pagine fino a {maxDepth} {maxDepth === 1 ? 'livello' : 'livelli'} di profondità!
                                        </p>
                                    )}
                                    {multiUrlMode && (
                                        <p className="mt-2 text-blue-700 font-medium">
                                            💡 Con più URL otterrai informazioni più complete e dettagliate!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={(!multiUrlMode && !url.trim()) || (multiUrlMode && urls.every(u => !u.trim())) || analyzing}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            {multiUrlMode && urls.filter(u => u.trim()).length > 1
                                ? `Analizza ${urls.filter(u => u.trim()).length} Pagine`
                                : 'Analizza Sito'
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 2: Analyzing */}
            {stage === 'analyzing' && (
                <div className="py-12">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto">
                                <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Analisi in corso...
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Stiamo analizzando il sito web con l&apos;AI
                            </p>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisStep >= 0 ? 'bg-blue-50' : 'bg-gray-50'
                                }`}>
                                {analysisStep === 0 ? (
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                ) : analysisStep > 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${analysisStep === 0 ? 'text-blue-900 font-medium' :
                                    analysisStep > 0 ? 'text-green-900' :
                                        'text-gray-600'
                                    }`}>Estrazione contenuto dal sito web...</span>
                            </div>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisStep >= 1 ? 'bg-blue-50' : 'bg-gray-50'
                                }`}>
                                {analysisStep === 1 ? (
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                ) : analysisStep > 1 ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${analysisStep === 1 ? 'text-blue-900 font-medium' :
                                    analysisStep > 1 ? 'text-green-900' :
                                        'text-gray-600'
                                    }`}>Generazione style guide...</span>
                            </div>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisStep >= 2 ? 'bg-blue-50' : 'bg-gray-50'
                                }`}>
                                {analysisStep === 2 ? (
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                ) : analysisStep > 2 ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${analysisStep === 2 ? 'text-blue-900 font-medium' :
                                    analysisStep > 2 ? 'text-green-900' :
                                        'text-gray-600'
                                    }`}>Estrazione dati progetto...</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">
                            Questo può richiedere 20-40 secondi
                        </p>
                    </div>
                </div>
            )}

            {/* Stage 3: Review Form */}
            {stage === 'review' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Success Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="text-sm text-green-900">
                                <p className="font-medium">Analisi completata!</p>
                                <p className="text-green-800 mt-1">
                                    Abbiamo estratto le informazioni dal sito. Rivedi e modifica i campi se necessario.
                                </p>
                            </div>
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
