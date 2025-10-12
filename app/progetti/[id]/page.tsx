'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import EditProjectModal from '@/components/EditProjectModal';
import AISettingsTab from '@/components/AISettingsTab';
import { projectsApi } from '@/lib/api/projects';
import { ProjectFormData } from '@/types';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Edit2,
    Trash2,
    BookOpen,
    FileText,
    Download,
    Sparkles,
    Clock,
    Settings
} from 'lucide-react';

type TabType = 'overview' | 'outline' | 'chapters' | 'ai-settings' | 'export';

interface ProjectDetail {
    id: string;
    bookTitle: string;
    bookSubtitle?: string | null;
    authorName: string;
    authorRole: string;
    company: string;
    industry: string;
    targetReaders: string;
    currentSituation: string;
    challengeFaced: string;
    transformation: string;
    achievement: string;
    lessonLearned: string;
    businessGoals: string;
    uniqueValue: string;
    estimatedPages?: number | null;
    additionalNotes?: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    outline?: any;
    chapters: any[];
    _count: {
        chapters: number;
        generationLogs: number;
    };
}

export default function ProgettoDetailPage({ params }: { params: { id: string } }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 🚀 GLOBAL GENERATION STATES (persistent across tab changes)
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [generatingChapter, setGeneratingChapter] = useState<number | null>(null);
    const [regeneratingChapter, setRegeneratingChapter] = useState<number | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const router = useRouter();

    const fetchProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await projectsApi.getById(params.id);
            setProject(response.project);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
            console.error('Error fetching project:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione è irreversibile.')) {
            return;
        }

        try {
            await projectsApi.delete(params.id);
            router.push('/progetti');
        } catch (err) {
            alert('Errore durante l\'eliminazione del progetto');
            console.error('Error deleting project:', err);
        }
    };

    const handleUpdateProject = async (formData: ProjectFormData) => {
        try {
            await projectsApi.update(params.id, formData);
            await fetchProject(); // Ricarica i dati aggiornati
        } catch (err) {
            console.error('Error updating project:', err);
            throw err;
        }
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'Panoramica', icon: BookOpen },
        { id: 'ai-settings' as TabType, label: 'AI Settings', icon: Settings },
        { id: 'outline' as TabType, label: 'Outline', icon: FileText },
        { id: 'chapters' as TabType, label: 'Capitoli', icon: FileText },
        { id: 'export' as TabType, label: 'Esporta', icon: Download },
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
            draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-800' },
            generating_outline: { label: 'Generando Outline', color: 'bg-blue-100 text-blue-800' },
            generating_chapters: { label: 'Generando Capitoli', color: 'bg-purple-100 text-purple-800' },
            completed: { label: 'Completato', color: 'bg-green-100 text-green-800' },
            error: { label: 'Errore', color: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar collapsed={sidebarCollapsed} onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Caricamento progetto...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !project) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar collapsed={sidebarCollapsed} onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-md">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Errore</h3>
                            <p className="text-gray-600 mb-4">{error || 'Progetto non trovato'}</p>
                            <button
                                onClick={() => router.push('/progetti')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Torna ai Progetti
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push('/progetti')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Torna ai Progetti</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {getStatusBadge(project.status)}
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Modifica progetto"
                            >
                                <Edit2 size={18} />
                                <span>Modifica</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Elimina progetto"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.bookTitle}</h1>
                        {project.bookSubtitle && (
                            <p className="text-lg text-gray-600">{project.bookSubtitle}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Autore: <span className="font-medium">{project.authorName}</span></span>
                            <span>•</span>
                            <span>{project.company}</span>
                            <span>•</span>
                            <span>{project._count.chapters} capitoli</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-200">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Keep all tabs mounted but show/hide with CSS for state persistence */}
                    <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
                        <OverviewTab project={project} onRefresh={fetchProject} />
                    </div>

                    <div style={{ display: activeTab === 'ai-settings' ? 'block' : 'none' }}>
                        <AISettingsTab projectId={project.id} onRefresh={fetchProject} />
                    </div>

                    <div style={{ display: activeTab === 'outline' ? 'block' : 'none' }}>
                        <OutlineTab
                            project={project}
                            onRefresh={fetchProject}
                            // Global generation states
                            isGeneratingOutline={isGeneratingOutline}
                            setIsGeneratingOutline={setIsGeneratingOutline}
                            generatingChapter={generatingChapter}
                            setGeneratingChapter={setGeneratingChapter}
                            generationError={generationError}
                            setGenerationError={setGenerationError}
                        />
                    </div>

                    <div style={{ display: activeTab === 'chapters' ? 'block' : 'none' }}>
                        <ChaptersTab
                            project={project}
                            onRefresh={fetchProject}
                            // Global generation states for regeneration
                            regeneratingChapter={regeneratingChapter}
                            setRegeneratingChapter={setRegeneratingChapter}
                        />
                    </div>

                    <div style={{ display: activeTab === 'export' ? 'block' : 'none' }}>
                        <ExportTab project={project} />
                    </div>
                </div>
            </div>

            {/* Edit Project Modal */}
            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateProject}
                initialData={{
                    authorName: project.authorName,
                    authorRole: project.authorRole,
                    company: project.company,
                    industry: project.industry,
                    bookTitle: project.bookTitle,
                    bookSubtitle: project.bookSubtitle || undefined,
                    targetReaders: project.targetReaders,
                    currentSituation: project.currentSituation,
                    challengeFaced: project.challengeFaced,
                    transformation: project.transformation,
                    achievement: project.achievement,
                    lessonLearned: project.lessonLearned,
                    businessGoals: project.businessGoals,
                    uniqueValue: project.uniqueValue,
                    estimatedPages: project.estimatedPages || undefined,
                    additionalNotes: project.additionalNotes || undefined,
                }}
            />
        </div>
    );
}

// ============================================================
// OVERVIEW TAB
// ============================================================

function OverviewTab({ project, onRefresh }: { project: ProjectDetail; onRefresh: () => void }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Informazioni Autore */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} />
                    Informazioni Autore
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nome" value={project.authorName} />
                    <InfoField label="Ruolo" value={project.authorRole} />
                    <InfoField label="Azienda" value={project.company} />
                    <InfoField label="Settore" value={project.industry} />
                </div>
            </Card>

            {/* Informazioni Libro */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informazioni Libro</h2>
                <div className="space-y-4">
                    <InfoField label="Target Lettori" value={project.targetReaders} />
                    {project.estimatedPages && (
                        <InfoField label="Pagine Stimate" value={project.estimatedPages.toString()} />
                    )}
                </div>
            </Card>

            {/* Hero's Journey */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Struttura Narrativa (Hero&apos;s Journey)</h2>
                <div className="space-y-4">
                    <InfoField label="Situazione di Partenza" value={project.currentSituation} multiline />
                    <InfoField label="Sfida Affrontata" value={project.challengeFaced} multiline />
                    <InfoField label="Trasformazione" value={project.transformation} multiline />
                    <InfoField label="Risultati Ottenuti" value={project.achievement} multiline />
                    <InfoField label="Lezione Appresa" value={project.lessonLearned} multiline />
                </div>
            </Card>

            {/* Obiettivi Business */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Obiettivi Business</h2>
                <div className="space-y-4">
                    <InfoField label="Obiettivi" value={project.businessGoals} multiline />
                    <InfoField label="Valore Unico" value={project.uniqueValue} multiline />
                </div>
            </Card>

            {/* Note Aggiuntive */}
            {project.additionalNotes && (
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Note Aggiuntive</h2>
                    <InfoField label="" value={project.additionalNotes} multiline />
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadati</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Creato:</span>
                        <p className="text-gray-900 mt-1">{new Date(project.createdAt).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Ultima modifica:</span>
                        <p className="text-gray-900 mt-1">{new Date(project.updatedAt).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function InfoField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            {multiline ? (
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{value}</p>
            ) : (
                <p className="text-gray-900">{value}</p>
            )}
        </div>
    );
}

// ============================================================
// OUTLINE TAB (Sprint 3 - AI Generation + Sprint 4 Chapter Triggers)
// ============================================================

interface OutlineTabProps {
    project: ProjectDetail;
    onRefresh: () => void;
    // Global generation states (persistent across tab changes)
    isGeneratingOutline: boolean;
    setIsGeneratingOutline: (value: boolean) => void;
    generatingChapter: number | null;
    setGeneratingChapter: (value: number | null) => void;
    generationError: string | null;
    setGenerationError: (value: string | null) => void;
}

function OutlineTab({
    project,
    onRefresh,
    isGeneratingOutline,
    setIsGeneratingOutline,
    generatingChapter,
    setGeneratingChapter,
    generationError,
    setGenerationError
}: OutlineTabProps) {
    // Removed local states - now using global ones from parent

    const handleGenerateOutline = async () => {
        setIsGeneratingOutline(true);
        setGenerationError(null);

        try {
            const response = await fetch(`/api/projects/${project.id}/generate-outline`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore nella generazione');
            }

            const data = await response.json();
            console.log('Outline generato:', data);

            // Ricarica i dati del progetto per mostrare l'outline
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            setGenerationError(err instanceof Error ? err.message : 'Errore sconosciuto');
        } finally {
            setIsGeneratingOutline(false);
        }
    };

    const handleGenerateChapter = async (chapterNumber: number) => {
        setGeneratingChapter(chapterNumber);
        setGenerationError(null);

        try {
            const response = await fetch(
                `/api/projects/${project.id}/chapters/${chapterNumber}/generate`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore nella generazione del capitolo');
            }

            const data = await response.json();
            console.log(`Capitolo ${chapterNumber} generato:`, data);

            // Ricarica per mostrare il nuovo capitolo
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            setGenerationError(err instanceof Error ? err.message : 'Errore sconosciuto');
        } finally {
            setGeneratingChapter(null);
        }
    };

    // Funzione per determinare se un capitolo può essere generato
    const canGenerateChapter = (chapterNumber: number): boolean => {
        if (chapterNumber === 1) return true;

        // Verifica se il capitolo precedente è completato
        const previousChapter = project.chapters.find(
            (ch) => ch.chapterNumber === chapterNumber - 1
        );
        return previousChapter?.status === 'completed';
    };

    // Funzione per determinare lo stato del pulsante
    const getChapterButtonState = (chapterNumber: number) => {
        const existingChapter = project.chapters.find(
            (ch) => ch.chapterNumber === chapterNumber
        );

        if (existingChapter?.status === 'completed') {
            return { label: '✅ Generato', disabled: true, generated: true };
        }

        if (generatingChapter === chapterNumber) {
            return { label: 'Generazione...', disabled: true, generating: true };
        }

        if (!canGenerateChapter(chapterNumber)) {
            return { label: '🔒 Bloccato', disabled: true, locked: true };
        }

        return { label: '✨ Genera Capitolo', disabled: false };
    };

    if (!project.outline) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Genera l&apos;Outline del Tuo Libro</h3>
                        <p className="text-gray-600 mb-6">
                            L&apos;AI analizzerà le informazioni che hai fornito e creerà una struttura completa per il tuo libro.
                        </p>

                        {generationError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {generationError}
                            </div>
                        )}

                        <button
                            onClick={handleGenerateOutline}
                            disabled={isGeneratingOutline}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
                        >
                            {isGeneratingOutline ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generazione in corso...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Genera Outline con AI
                                </>
                            )}
                        </button>

                        <p className="text-sm text-gray-500 mt-4">
                            Questo processo potrebbe richiedere 10-30 secondi
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    // Parse outline structure
    const outline = project.outline.structure as any;
    const totalChapters = outline.chapters?.length || 0;
    const completedChapters = project.chapters.filter(ch => ch.status === 'completed').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header con titolo e sottotitolo */}
            <Card>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{outline.title}</h2>
                        <p className="text-lg text-gray-600">{outline.subtitle}</p>
                    </div>
                    <button
                        onClick={handleGenerateOutline}
                        disabled={isGeneratingOutline}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2 transition-colors"
                    >
                        {isGeneratingOutline ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Rigenera...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Rigenera
                            </>
                        )}
                    </button>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{outline.description}</p>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {completedChapters}/{totalChapters} capitoli generati
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={16} />
                        Generato: {new Date(project.outline.generatedAt).toLocaleDateString('it-IT')}
                    </span>
                    <span className="flex items-center gap-1">
                        <Sparkles size={16} />
                        {project.outline.aiModel}
                    </span>
                </div>
            </Card>

            {/* Lista capitoli con pulsanti di generazione */}
            <div className="space-y-4">
                {outline.chapters?.map((chapter: any, index: number) => {
                    const buttonState = getChapterButtonState(chapter.number);

                    return (
                        <Card key={index}>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold text-indigo-600">{chapter.number}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{chapter.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{chapter.description}</p>

                                    <div className="mb-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Punti chiave:</h4>
                                        <ul className="space-y-1">
                                            {chapter.keyPoints?.map((point: string, idx: number) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-indigo-600">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                                            <Sparkles size={12} />
                                            {chapter.heroJourneyPhase}
                                        </div>

                                        {/* Pulsante generazione capitolo */}
                                        <button
                                            onClick={() => handleGenerateChapter(chapter.number)}
                                            disabled={buttonState.disabled}
                                            className={`px-4 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${buttonState.generated
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : buttonState.locked
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : buttonState.generating
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                        >
                                            {buttonState.generating && (
                                                <Loader2 size={14} className="animate-spin" />
                                            )}
                                            {buttonState.label}
                                        </button>
                                    </div>

                                    {!canGenerateChapter(chapter.number) && chapter.number > 1 && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Completa prima il Capitolo {chapter.number - 1}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {generationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {generationError}
                </div>
            )}
        </div>
    );
}

// ============================================================
// CHAPTERS TAB (Sprint 4 - Chapter Management & Consistency Check)
// ============================================================

interface ChaptersTabProps {
    project: ProjectDetail;
    onRefresh: () => void;
    // Global regeneration state (persistent across tab changes)
    regeneratingChapter: number | null;
    setRegeneratingChapter: (value: number | null) => void;
}

function ChaptersTab({
    project,
    onRefresh,
    regeneratingChapter,
    setRegeneratingChapter
}: ChaptersTabProps) {
    const [editingChapter, setEditingChapter] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    // Removed local regenerating state - now using global one
    const [runningCheck, setRunningCheck] = useState(false);
    const [consistencyReport, setConsistencyReport] = useState<any>(null);
    const [hasExistingReport, setHasExistingReport] = useState(false);
    const [contentChanged, setContentChanged] = useState(false); // Nuovo: traccia se il contenuto è cambiato

    // Calcolo variabili necessarie per l'useEffect
    const completedChapters = project.chapters.filter(ch => ch.status === 'completed').length;
    const allChaptersComplete = project.outline &&
        completedChapters === (project.outline.structure as any).chapters?.length;

    // Check se esiste già un consistency report
    useEffect(() => {
        const checkExistingReport = async () => {
            try {
                const response = await fetch(`/api/projects/${project.id}/consistency-check`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.report) {
                        setHasExistingReport(true);
                        setConsistencyReport(data.report);
                    }
                }
            } catch (error) {
                console.error('Error checking existing report:', error);
            }
        };

        if (allChaptersComplete) {
            checkExistingReport();
        }
    }, [project.id, allChaptersComplete]);

    const handleEdit = (chapter: any) => {
        setEditingChapter(chapter.chapterNumber);
        setEditContent(chapter.content);
    };

    const handleSave = async (chapterNumber: number) => {
        setSaving(true);
        try {
            await fetch(`/api/projects/${project.id}/chapters/${chapterNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent }),
            });

            setEditingChapter(null);
            // Marca che il contenuto è cambiato - il report è obsoleto
            setContentChanged(true);
            onRefresh();
        } catch (error) {
            console.error('Error saving chapter:', error);
            alert('Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async (chapterNumber: number) => {
        if (!confirm(`Rigenerare il Capitolo ${chapterNumber}? Il contenuto attuale verrà sostituito.`)) {
            return;
        }

        setRegeneratingChapter(chapterNumber);
        try {
            await fetch(`/api/projects/${project.id}/chapters/${chapterNumber}/generate`, {
                method: 'POST',
            });

            // Marca che il contenuto è cambiato - il report è obsoleto
            setContentChanged(true);
            onRefresh();
        } catch (error) {
            console.error('Error regenerating chapter:', error);
            alert('Errore durante la rigenerazione');
        } finally {
            setRegeneratingChapter(null);
        }
    };

    const handleConsistencyCheck = async () => {
        setRunningCheck(true);
        try {
            const response = await fetch(`/api/projects/${project.id}/consistency-check`, {
                method: 'POST',
            });
            const data = await response.json();
            setConsistencyReport(data.report);
            setHasExistingReport(true);
            setContentChanged(false); // Reset: il report è aggiornato
        } catch (error) {
            console.error('Error running consistency check:', error);
            alert('Errore durante il consistency check');
        } finally {
            setRunningCheck(false);
        }
    };

    if (project.chapters.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun Capitolo Generato</h3>
                        <p className="text-gray-600 mb-6">
                            I capitoli del libro non sono ancora stati generati con l&apos;AI.
                        </p>
                        <p className="text-sm text-gray-500">
                            Vai al tab &quot;Outline&quot; per generare i capitoli sequenzialmente
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const totalWords = project.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header con statistiche e consistency check */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Capitoli Generati</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{completedChapters} capitoli</span>
                            <span>•</span>
                            <span>{totalWords.toLocaleString()} parole totali</span>
                        </div>
                    </div>

                    {allChaptersComplete && (
                        <button
                            onClick={handleConsistencyCheck}
                            disabled={runningCheck}
                            className={`px-4 py-2 text-white text-sm rounded-lg flex items-center gap-2 transition-colors ${contentChanged
                                ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300'
                                : hasExistingReport
                                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                                    : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                                }`}
                        >
                            {runningCheck ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Analisi...
                                </>
                            ) : contentChanged ? (
                                <>
                                    <AlertCircle size={16} />
                                    ⚠️ Rigenera Check
                                </>
                            ) : hasExistingReport ? (
                                <>
                                    <AlertCircle size={16} />
                                    ✅ Rigenera Check
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} />
                                    Consistency Check
                                </>
                            )}
                        </button>
                    )}
                </div>

                {!allChaptersComplete && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        💡 Completa tutti i capitoli per eseguire il consistency check finale
                    </div>
                )}

                {contentChanged && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm">
                        ⚠️ Hai modificato o rigenerato dei capitoli. Il report precedente potrebbe essere obsoleto - considera di rigenerarlo.
                    </div>
                )}
            </Card>

            {/* Consistency Report (se disponibile) */}
            {consistencyReport && (
                <Card>
                    <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className={`flex-shrink-0 ${contentChanged ? 'text-orange-600' : 'text-purple-600'}`} size={24} />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Consistency Report
                                </h3>
                                {contentChanged && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                        ⚠️ Potrebbe essere obsoleto
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-3xl font-bold text-purple-600">
                                    {consistencyReport.overallScore || 0}/100
                                </div>
                                <div className="text-sm text-gray-600">
                                    Punteggio Generale
                                </div>
                            </div>

                            {/* Score breakdown */}
                            {consistencyReport.narrative && consistencyReport.style && consistencyReport.consistency && (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Narrativa</div>
                                        <div className="text-lg font-semibold">{consistencyReport.narrative.score || 0}/100</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Stile</div>
                                        <div className="text-lg font-semibold">{consistencyReport.style.score || 0}/100</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Coerenza</div>
                                        <div className="text-lg font-semibold">{consistencyReport.consistency.score || 0}/100</div>
                                    </div>
                                </div>
                            )}

                            {/* Issues */}
                            {consistencyReport.narrative?.issues || consistencyReport.style?.issues || consistencyReport.consistency?.issues ? (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Issues Rilevati:</h4>
                                    <div className="space-y-2">
                                        {[
                                            ...(consistencyReport.narrative?.issues || []),
                                            ...(consistencyReport.style?.issues || []),
                                            ...(consistencyReport.consistency?.issues || [])
                                        ].map((issue: any, idx: number) => (
                                            <div key={idx} className={`p-2 rounded text-sm ${issue.severity === 'high' ? 'bg-red-50 border-l-2 border-red-500' :
                                                issue.severity === 'medium' ? 'bg-yellow-50 border-l-2 border-yellow-500' :
                                                    'bg-gray-50 border-l-2 border-gray-300'
                                                }`}>
                                                <div className="font-medium">
                                                    {issue.chapter && `Cap. ${issue.chapter}: `}
                                                    {issue.description}
                                                </div>
                                                <div className="text-gray-600 mt-1">💡 {issue.suggestion}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Recommendations */}
                            {consistencyReport.recommendations && consistencyReport.recommendations.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Raccomandazioni:</h4>
                                    <ul className="space-y-1">
                                        {consistencyReport.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="text-purple-600">•</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}            {/* Lista capitoli */}
            <div className="space-y-4">
                {project.chapters.map((chapter) => (
                    <Card key={chapter.id}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Capitolo {chapter.chapterNumber}: {chapter.title.replace(/^Capitolo\s+\d+:\s*/i, '')}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{chapter.wordCount} parole</span>
                                    <span>•</span>
                                    <span>{chapter.aiModel}</span>
                                    {chapter.generatedAt && (
                                        <>
                                            <span>•</span>
                                            <span>{new Date(chapter.generatedAt).toLocaleDateString('it-IT')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingChapter === chapter.chapterNumber ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingChapter(null);
                                                setEditContent('');
                                            }}
                                            disabled={saving}
                                            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:bg-gray-300 flex items-center gap-1"
                                        >
                                            <ArrowLeft size={14} />
                                            Annulla
                                        </button>
                                        <button
                                            onClick={() => handleSave(chapter.chapterNumber)}
                                            disabled={saving}
                                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-green-300"
                                        >
                                            {saving ? 'Salvataggio...' : 'Salva'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(chapter)}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        <Edit2 size={14} />
                                        Modifica
                                    </button>
                                )}
                                <button
                                    onClick={() => handleRegenerate(chapter.chapterNumber)}
                                    disabled={regeneratingChapter === chapter.chapterNumber}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-1"
                                >
                                    {regeneratingChapter === chapter.chapterNumber ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Rigenera...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Rigenera
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {editingChapter === chapter.chapterNumber ? (
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                                placeholder="Contenuto del capitolo in Markdown..."
                            />
                        ) : (
                            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                                <div className="text-gray-700 whitespace-pre-wrap line-clamp-6">
                                    {chapter.content}
                                </div>
                                <button
                                    onClick={() => handleEdit(chapter)}
                                    className="text-blue-600 text-sm mt-2 hover:underline"
                                >
                                    Leggi tutto / Modifica →
                                </button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// EXPORT TAB ✅
// ============================================================

function ExportTab({ project }: { project: ProjectDetail }) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState(false);

    const hasChapters = project.chapters && project.chapters.length > 0;

    // Verifica se tutti i capitoli previsti nell'outline sono stati generati
    // L'outline è salvato come JSON nel campo structure
    const outlineStructure = project.outline?.structure as any;
    const totalChaptersExpected = outlineStructure?.chapters?.length || 0;
    const chaptersGenerated = project.chapters?.length || 0;
    const allChaptersGenerated = totalChaptersExpected > 0 && chaptersGenerated >= totalChaptersExpected;

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setExportError(null);
            setExportSuccess(false);

            await projectsApi.exportDocx(project.id);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            setExportError(err instanceof Error ? err.message : 'Errore durante l\'esportazione');
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Card */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Esporta Documento</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-1">
                                Formato: Microsoft Word (DOCX)
                            </h4>
                            <p className="text-sm text-blue-700">
                                Il documento include: copertina, indice, tutti i capitoli e biografia dell&apos;autore.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {project.chapters?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Capitoli generati</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {project.chapters?.reduce((sum: number, ch: any) => sum + (ch.wordCount || 0), 0).toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">Parole totali</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {Math.ceil((project.chapters?.reduce((sum: number, ch: any) => sum + (ch.wordCount || 0), 0) || 0) / 250)}
                        </div>
                        <div className="text-sm text-gray-600">Pagine stimate</div>
                    </div>
                </div>

                {/* Export Button */}
                <div className="flex flex-col items-center">
                    {!hasChapters && (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 mb-4">
                                Nessun capitolo disponibile per l&apos;esportazione
                            </p>
                            <p className="text-sm text-gray-500">
                                Prima devi generare l&apos;outline e i capitoli
                            </p>
                        </div>
                    )}

                    {hasChapters && !allChaptersGenerated && (
                        <div className="text-center py-4 mb-4">
                            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                            <p className="text-amber-700 text-sm">
                                ⚠️ Non tutti i capitoli sono stati generati. Il documento sarà incompleto.
                            </p>
                        </div>
                    )}

                    {hasChapters && (
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all ${isExporting
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                } text-white`}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Generazione DOCX...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={24} />
                                    <span>Scarica DOCX</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Success Message */}
                    {exportSuccess && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <div className="text-green-600">✅</div>
                            <p className="text-green-800 font-medium">
                                Documento esportato con successo!
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {exportError && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-800 font-medium mb-1">Errore durante l&apos;esportazione</p>
                                <p className="text-red-700 text-sm">{exportError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Info Card */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ Informazioni sull&apos;Export</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <strong>Formato:</strong> Microsoft Word (.docx) compatibile con Word 2013+
                    </p>
                    <p>
                        <strong>Contenuto:</strong> Copertina personalizzata, copyright, indice automatico,
                        tutti i capitoli formattati, biografia autore
                    </p>
                    <p>
                        <strong>Formattazione:</strong> Pronto per impaginazione professionale, con stili
                        tipografici standard
                    </p>
                    <p>
                        <strong>Editing:</strong> Puoi modificare ulteriormente il documento in Microsoft Word,
                        Google Docs o LibreOffice
                    </p>
                </div>
            </Card>
        </div>
    );
}
