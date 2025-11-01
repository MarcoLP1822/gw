'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import NewProjectModal from '@/components/NewProjectModal';
import AISettingsTab from '@/components/AISettingsTab';
import WorkflowStepper from '@/components/WorkflowStepper';
import { projectsApi } from '@/lib/api/projects';
import { ProjectFormData } from '@/types';
import { toast } from '@/lib/ui/toast';
import { ProjectDetailPageSkeleton } from '@/components/ui/Skeleton';
import { GenerationStateManager } from '@/lib/generation-state';
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
    Settings,
    Undo2,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

type TabType = 'overview' | 'outline' | 'chapters' | 'consistency' | 'ai-settings' | 'export';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const [stopBatchGeneration, setStopBatchGeneration] = useState(false);

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

        // Ripristina lo stato della generazione se esiste
        const savedState = GenerationStateManager.getForProject(params.id);
        if (savedState && savedState.isGenerating) {
            setGeneratingChapter(savedState.currentChapter);
            setStopBatchGeneration(savedState.stopRequested);
            toast.info(`Generazione in corso ripristinata: Capitolo ${savedState.currentChapter}`);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione è irreversibile.')) {
            return;
        }

        try {
            await projectsApi.delete(params.id);
            toast.success('Progetto eliminato con successo');
            router.push('/progetti');
        } catch (err) {
            toast.error('Errore durante l\'eliminazione del progetto');
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
        { id: 'consistency' as TabType, label: 'Consistency', icon: AlertCircle },
        { id: 'export' as TabType, label: 'Esporta', icon: Download },
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
            draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-800' },
            generating_outline: { label: 'Outline', color: 'bg-blue-100 text-blue-800' },
            generating_chapters: { label: 'Capitoli', color: 'bg-purple-100 text-purple-800' },
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
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
                <ProjectDetailPageSkeleton />
            </div>
        );
    }

    // Error State
    if (error || !project) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
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
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Compatto */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => router.push('/progetti')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Torna ai Progetti</span>
                            <span className="sm:hidden">Indietro</span>
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Open menu"
                        >
                            <Settings size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="mb-3">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 truncate">{project.bookTitle}</h1>
                        {project.bookSubtitle && (
                            <p className="text-sm text-gray-600 truncate">{project.bookSubtitle}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="truncate">Autore: <span className="font-medium">{project.authorName}</span></span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline truncate">{project.company}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{project._count.chapters} cap.</span>

                            {/* Indicatore generazione in corso con pulsante Stop */}
                            {(generatingChapter !== null || regeneratingChapter !== null) && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-2 text-blue-600 font-medium">
                                        <Loader2 size={14} className="animate-spin" />
                                        {regeneratingChapter !== null
                                            ? `Rigenerando Cap. ${regeneratingChapter}`
                                            : `Generando Cap. ${generatingChapter}`
                                        }
                                        {generatingChapter !== null && (
                                            <>
                                                <button
                                                    onClick={() => setStopBatchGeneration(true)}
                                                    disabled={stopBatchGeneration}
                                                    className="ml-1 px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
                                                    title="Interrompi generazione batch"
                                                >
                                                    {stopBatchGeneration ? 'Fermando...' : 'Stop'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        GenerationStateManager.clear();
                                                        setGeneratingChapter(null);
                                                        setStopBatchGeneration(false);
                                                        toast.success('Stato generazione resettato');
                                                    }}
                                                    className="ml-1 px-2 py-0.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                                    title="Forza reset stato (usa se bloccato)"
                                                >
                                                    Reset
                                                </button>
                                            </>
                                        )}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm ${activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Workflow Stepper - TEMPORANEAMENTE DISATTIVATO */}
                {/* <WorkflowStepper
                    currentStep={activeTab === 'overview' ? 'info' : activeTab}
                    projectData={{
                        hasAIConfig: true, // Assuming AI config exists (can be enhanced)
                        hasOutline: !!project.outline,
                        chaptersCompleted: project.chapters.filter(ch => ch.status === 'completed').length,
                        totalChapters: project.outline?.structure ? (project.outline.structure as any).chapters?.length || 0 : 0,
                        hasConsistencyCheck: false // Can be enhanced with actual check
                    }}
                /> */}

                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                    {/* Keep all tabs mounted but show/hide with CSS for state persistence */}
                    <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
                        <OverviewTab
                            project={project}
                            onRefresh={fetchProject}
                            onEdit={() => setIsEditModalOpen(true)}
                        />
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
                            stopBatchGeneration={stopBatchGeneration}
                            setStopBatchGeneration={setStopBatchGeneration}
                        />
                    </div>

                    <div style={{ display: activeTab === 'chapters' ? 'block' : 'none' }}>
                        <ChaptersTab
                            project={project}
                            onRefresh={fetchProject}
                            // Global generation states for regeneration
                            regeneratingChapter={regeneratingChapter}
                            setRegeneratingChapter={setRegeneratingChapter}
                            // Global batch generation state to disable buttons
                            generatingChapter={generatingChapter}
                        />
                    </div>

                    <div style={{ display: activeTab === 'consistency' ? 'block' : 'none' }}>
                        <ConsistencyTab
                            project={project}
                            onRefresh={fetchProject}
                            // Generation states to disable button during operations
                            generatingChapter={generatingChapter}
                            regeneratingChapter={regeneratingChapter}
                        />
                    </div>

                    <div style={{ display: activeTab === 'export' ? 'block' : 'none' }}>
                        <ExportTab project={project} />
                    </div>
                </div>
            </div>

            {/* Edit Project Modal */}
            <NewProjectModal
                isOpen={isEditModalOpen}
                onCloseAction={() => setIsEditModalOpen(false)}
                onSubmitAction={handleUpdateProject}
                mode="edit"
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

function OverviewTab({ project, onRefresh, onEdit }: {
    project: ProjectDetail;
    onRefresh: () => void;
    onEdit: () => void;
}) {
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
                    <InfoField label="Titolo Libro" value={project.bookTitle} />
                    {project.bookSubtitle && (
                        <InfoField label="Sottotitolo" value={project.bookSubtitle} />
                    )}
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
    stopBatchGeneration: boolean;
    setStopBatchGeneration: (value: boolean) => void;
}

function OutlineTab({
    project,
    onRefresh,
    isGeneratingOutline,
    setIsGeneratingOutline,
    generatingChapter,
    setGeneratingChapter,
    generationError,
    setGenerationError,
    stopBatchGeneration,
    setStopBatchGeneration
}: OutlineTabProps) {
    // Removed local states - now using global ones from parent
    const [editingChapter, setEditingChapter] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleGenerateOutline = async () => {
        setIsGeneratingOutline(true);
        setGenerationError(null);

        try {
            const response = await fetch(`/api/projects/${project.id}/generate-outline`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Mostra il messaggio user-friendly se disponibile
                const errorMsg = errorData.message || errorData.error || 'Errore nella generazione';
                throw new Error(errorMsg);
            }

            const data = await response.json();
            toast.success('✨ Outline generato con successo!');

            // Ricarica i dati del progetto per mostrare l'outline
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
            setGenerationError(errorMessage);
            toast.error(errorMessage);
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
                // Mostra il messaggio user-friendly se disponibile
                const errorMsg = errorData.message || errorData.error || 'Errore nella generazione del capitolo';
                throw new Error(errorMsg);
            }

            const data = await response.json();
            toast.success(`✨ Capitolo ${chapterNumber} generato con successo!`);

            // Ricarica per mostrare il nuovo capitolo
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
            setGenerationError(errorMessage);
            toast.error(`Errore nella generazione: ${errorMessage}`);
        } finally {
            setGeneratingChapter(null);
        }
    };

    const handleEditChapter = (chapter: any) => {
        setEditingChapter(chapter);
        setIsEditModalOpen(true);
    };

    const handleAddChapter = () => {
        const outline = project.outline?.structure as any;
        setEditingChapter({
            number: 1, // Verrà scelto nel modal
            insertPosition: 0, // Default: alla fine (0 = alla fine)
            title: '',
            description: '',
            keyPoints: [''],
            heroJourneyPhase: 'Mondo ordinario'
        });
        setIsAddModalOpen(true);
    };

    const handleSaveChapter = async (chapterData: any) => {
        try {
            const outline = project.outline?.structure as any;
            let updatedChapters = [...(outline?.chapters || [])];

            if (isAddModalOpen) {
                // Aggiunta nuovo capitolo nella posizione specificata
                const insertPosition = chapterData.insertPosition || 0;

                if (insertPosition === 0) {
                    // Aggiungi alla fine
                    updatedChapters.push(chapterData);
                } else {
                    // Inserisci nella posizione specificata (insertPosition è 1-based)
                    updatedChapters.splice(insertPosition - 1, 0, chapterData);
                }

                // Ricalcola i numeri
                updatedChapters = updatedChapters.map((ch, idx) => ({ ...ch, number: idx + 1 }));
            } else {
                // Modifica capitolo esistente
                const index = updatedChapters.findIndex(ch => ch.number === chapterData.number);
                if (index !== -1) {
                    updatedChapters[index] = chapterData;
                }
            }

            const updatedOutline = {
                ...outline,
                chapters: updatedChapters
            };

            const response = await fetch(`/api/projects/${project.id}/outline`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ structure: updatedOutline })
            });

            if (!response.ok) {
                throw new Error('Errore nel salvataggio');
            }

            toast.success(isAddModalOpen ? '✨ Capitolo aggiunto!' : '✨ Capitolo aggiornato!');
            setIsEditModalOpen(false);
            setIsAddModalOpen(false);
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            toast.error('Errore nel salvataggio del capitolo');
        }
    };

    const handleDeleteChapter = async (chapterNumber: number) => {
        // Verifica se il capitolo è già stato generato
        const chapterExists = project.chapters.some(ch => ch.chapterNumber === chapterNumber);

        if (chapterExists) {
            toast.error('Non puoi eliminare un capitolo già generato');
            return;
        }

        if (!confirm(`Sei sicuro di voler eliminare il Capitolo ${chapterNumber}?`)) {
            return;
        }

        try {
            const outline = project.outline?.structure as any;
            let updatedChapters = outline?.chapters?.filter((ch: any) => ch.number !== chapterNumber) || [];

            // Ricalcola i numeri dei capitoli
            updatedChapters = updatedChapters.map((ch: any, idx: number) => ({ ...ch, number: idx + 1 }));

            const updatedOutline = {
                ...outline,
                chapters: updatedChapters
            };

            const response = await fetch(`/api/projects/${project.id}/outline`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ structure: updatedOutline })
            });

            if (!response.ok) {
                throw new Error('Errore nell\'eliminazione');
            }

            toast.success('✨ Capitolo eliminato!');
            onRefresh();
        } catch (err) {
            console.error('Errore:', err);
            toast.error('Errore nell\'eliminazione del capitolo');
        }
    };

    // Batch generation: Generate all remaining chapters
    const handleBatchGenerateAll = async () => {
        const outline = project.outline?.structure as any;
        const totalChapters = outline?.chapters?.length || 0;
        const existingChapters = project.chapters.map(ch => ch.chapterNumber);
        const remaining = Array.from({ length: totalChapters }, (_, i) => i + 1)
            .filter(num => !existingChapters.includes(num));

        // Se tutti i capitoli sono già stati generati, offri di rigenerarli tutti
        if (remaining.length === 0) {
            if (!confirm(`Tutti i ${totalChapters} capitoli sono già stati generati. Vuoi rigenerarli tutti da capo? Questa operazione potrebbe richiedere molto tempo e sovrascriverà i capitoli esistenti.`)) {
                return;
            }
            // Rigenera tutti i capitoli
            remaining.push(...Array.from({ length: totalChapters }, (_, i) => i + 1));
        } else {
            if (!confirm(`Vuoi generare tutti i ${remaining.length} capitoli rimanenti? Questa operazione potrebbe richiedere diversi minuti.`)) {
                return;
            }
        }

        // Reset stop flag
        setStopBatchGeneration(false);

        let completedCount = 0;
        const totalCount = remaining.length;

        // Salva stato iniziale
        GenerationStateManager.save({
            projectId: project.id,
            isGenerating: true,
            currentChapter: null,
            totalChapters: totalCount,
            completedChapters: 0,
            startedAt: Date.now(),
            stopRequested: false
        });

        // Show initial toast
        const toastId = toast.loading(`Generazione batch: 0/${totalCount} completati`);

        for (const chapterNum of remaining) {
            // Check if stop was requested BEFORE starting new chapter
            if (stopBatchGeneration) {
                console.log(`⏸️ Stop richiesto prima di Cap. ${chapterNum}`);
                toast.info(`⏸️ Generazione interrotta. Completati ${completedCount}/${totalCount} capitoli`);
                break;
            }

            setGeneratingChapter(chapterNum);

            // Aggiorna stato persistente
            GenerationStateManager.update({
                currentChapter: chapterNum,
                completedChapters: completedCount,
                stopRequested: stopBatchGeneration
            });

            try {
                const response = await fetch(
                    `/api/projects/${project.id}/chapters/${chapterNum}/generate`,
                    { method: 'POST' }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error(`❌ Error generating chapter ${chapterNum}:`, errorData);
                    toast.error(`Errore Cap. ${chapterNum}: ${errorData.error || 'Errore sconosciuto'}`, { duration: 5000 });
                    // Continue with next chapters even if one fails
                } else {
                    completedCount++;
                    console.log(`✅ Chapter ${chapterNum} generated successfully. Progress: ${completedCount}/${totalCount}`);
                }

                // Check if stop was requested DURING chapter generation
                if (stopBatchGeneration) {
                    console.log(`⏸️ Stop richiesto dopo Cap. ${chapterNum}`);
                    toast.info(`⏸️ Generazione interrotta dopo Cap. ${chapterNum}. Completati ${completedCount}/${totalCount} capitoli`);
                    break;
                }

                // Update toast with current progress (whether success or failure)
                const attempted = remaining.indexOf(chapterNum) + 1;
                toast.loading(`Generazione batch: ${completedCount}/${totalCount} completati (${attempted}/${totalCount} tentati)`, { id: toastId });

                // Refresh per aggiornare lo stato del capitolo appena generato
                await onRefresh();

            } catch (error) {
                console.error(`❌ Error generating chapter ${chapterNum}:`, error);
                toast.error(`Errore Cap. ${chapterNum}`, { duration: 3000 });
                // Continue with next chapters even if one fails
            }

            // Small delay to avoid rate limiting
            if (chapterNum !== remaining[remaining.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setGeneratingChapter(null);
        setStopBatchGeneration(false); // Reset flag
        toast.dismiss(toastId);

        // Pulisci stato persistente
        GenerationStateManager.clear();

        if (stopBatchGeneration) {
            toast.success(`⏸️ Generazione interrotta: ${completedCount}/${totalCount} capitoli completati`);
        } else {
            toast.success(`✨ Batch completato! ${completedCount}/${totalCount} capitoli generati`);
        }
        onRefresh();
    };

    // Batch generation: Generate next N chapters
    const handleBatchGenerateNext = async (count: number) => {
        const outline = project.outline?.structure as any;
        const totalChapters = outline?.chapters?.length || 0;
        const existingChapters = project.chapters.map(ch => ch.chapterNumber);
        const remaining = Array.from({ length: totalChapters }, (_, i) => i + 1)
            .filter(num => !existingChapters.includes(num))
            .slice(0, count);

        if (remaining.length === 0) {
            toast.info('Nessun capitolo da generare');
            return;
        }

        // Reset stop flag
        setStopBatchGeneration(false);

        let completedCount = 0;
        const totalCount = remaining.length;

        // Salva stato iniziale
        GenerationStateManager.save({
            projectId: project.id,
            isGenerating: true,
            currentChapter: null,
            totalChapters: totalCount,
            completedChapters: 0,
            startedAt: Date.now(),
            stopRequested: false
        });

        // Show initial toast
        const toastId = toast.loading(`Generazione: 0/${totalCount} completati`);

        for (const chapterNum of remaining) {
            // Check if stop was requested BEFORE starting new chapter
            if (stopBatchGeneration) {
                console.log(`⏸️ Stop richiesto prima di Cap. ${chapterNum}`);
                toast.info(`⏸️ Generazione interrotta. Completati ${completedCount}/${totalCount} capitoli`);
                break;
            }

            setGeneratingChapter(chapterNum);

            // Aggiorna stato persistente
            GenerationStateManager.update({
                currentChapter: chapterNum,
                completedChapters: completedCount,
                stopRequested: stopBatchGeneration
            });

            try {
                const response = await fetch(
                    `/api/projects/${project.id}/chapters/${chapterNum}/generate`,
                    { method: 'POST' }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error(`❌ Error generating chapter ${chapterNum}:`, errorData);
                    toast.error(`Errore Cap. ${chapterNum}: ${errorData.error || 'Errore sconosciuto'}`, { duration: 5000 });
                    // Continue with next chapters
                } else {
                    completedCount++;
                    console.log(`✅ Chapter ${chapterNum} generated successfully. Progress: ${completedCount}/${totalCount}`);
                }

                // Check if stop was requested DURING chapter generation
                if (stopBatchGeneration) {
                    console.log(`⏸️ Stop richiesto dopo Cap. ${chapterNum}`);
                    toast.info(`⏸️ Generazione interrotta dopo Cap. ${chapterNum}. Completati ${completedCount}/${totalCount} capitoli`);
                    break;
                }

                // Update toast with current progress (whether success or failure)
                const attempted = remaining.indexOf(chapterNum) + 1;
                toast.loading(`Generazione: ${completedCount}/${totalCount} completati (${attempted}/${totalCount} tentati)`, { id: toastId });

                // Refresh per aggiornare lo stato del capitolo appena generato
                await onRefresh();

            } catch (error) {
                console.error(`❌ Error generating chapter ${chapterNum}:`, error);
                toast.error(`Errore Cap. ${chapterNum}`, { duration: 3000 });
                // Continue with next chapters
            }

            // Small delay
            if (chapterNum !== remaining[remaining.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setGeneratingChapter(null);
        setStopBatchGeneration(false); // Reset flag
        toast.dismiss(toastId);

        // Pulisci stato persistente
        GenerationStateManager.clear();

        if (stopBatchGeneration) {
            toast.success(`⏸️ Generazione interrotta: ${completedCount}/${totalCount} capitoli completati`);
        } else {
            toast.success(`✨ Completato! ${completedCount}/${totalCount} capitoli generati`);
        }
        onRefresh();
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

        // Disabilita se c'è una generazione in corso (outline o altri capitoli)
        if (isGeneratingOutline || (generatingChapter !== null && generatingChapter !== chapterNumber)) {
            return { label: '⏸️ In attesa', disabled: true, locked: true };
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
                            disabled={isGeneratingOutline || generatingChapter !== null}
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
                        disabled={isGeneratingOutline || generatingChapter !== null}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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

            {/* Batch Generation Controls */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Generazione Multipla</h3>
                        <p className="text-sm text-gray-600">
                            {totalChapters === completedChapters
                                ? 'Rigenera tutti i capitoli da capo'
                                : 'Genera più capitoli in sequenza automaticamente'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* Pulsante Genera Prossimi 3 - solo se ci sono capitoli da completare */}
                        {totalChapters > completedChapters && totalChapters - completedChapters > 1 && (
                            <button
                                onClick={() => handleBatchGenerateNext(3)}
                                disabled={generatingChapter !== null || isGeneratingOutline}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                <Sparkles size={16} />
                                Genera Prossimi 3
                            </button>
                        )}
                        {/* Pulsante Genera Tutti - sempre visibile */}
                        <button
                            onClick={handleBatchGenerateAll}
                            disabled={generatingChapter !== null || isGeneratingOutline}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            title={totalChapters === completedChapters ? 'Rigenera tutti i capitoli da capo' : `Genera i ${totalChapters - completedChapters} capitoli rimanenti`}
                        >
                            <Sparkles size={16} />
                            {totalChapters === completedChapters
                                ? 'Rigenera Tutti'
                                : `Genera Tutti (${totalChapters - completedChapters})`}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Lista capitoli con pulsanti di generazione */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Capitoli</h3>
                <button
                    onClick={() => handleAddChapter()}
                    disabled={generatingChapter !== null || isGeneratingOutline}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    <Sparkles size={16} />
                    Aggiungi Capitolo
                </button>
            </div>

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

                                    <div className="flex items-center gap-3 flex-wrap">
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

                                        {/* Pulsanti modifica/elimina */}
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={() => handleEditChapter(chapter)}
                                                disabled={generatingChapter !== null || isGeneratingOutline}
                                                className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                title="Modifica capitolo"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChapter(chapter.number)}
                                                disabled={buttonState.generated || generatingChapter !== null || isGeneratingOutline}
                                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                title="Elimina capitolo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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

            {/* Modal per editare/aggiungere capitolo */}
            {(isEditModalOpen || isAddModalOpen) && editingChapter && (
                <ChapterEditModal
                    chapter={editingChapter}
                    existingChapters={outline.chapters || []}
                    isOpen={isEditModalOpen || isAddModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setIsAddModalOpen(false);
                        setEditingChapter(null);
                    }}
                    onSave={handleSaveChapter}
                    isNewChapter={isAddModalOpen}
                />
            )}
        </div>
    );
}

// Modal per editare/aggiungere capitolo
interface ChapterEditModalProps {
    chapter: any;
    existingChapters: any[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (chapter: any) => void;
    isNewChapter: boolean;
}

function ChapterEditModal({ chapter, existingChapters, isOpen, onClose, onSave, isNewChapter }: ChapterEditModalProps) {
    const [formData, setFormData] = useState({
        number: chapter.number,
        insertPosition: chapter.insertPosition || 0,
        title: chapter.title,
        description: chapter.description,
        keyPoints: chapter.keyPoints || [''],
        heroJourneyPhase: chapter.heroJourneyPhase || 'Mondo ordinario'
    });

    const heroJourneyPhases = [
        'Mondo ordinario',
        'Chiamata all\'avventura',
        'Rifiuto della chiamata',
        'Incontro con il mentore',
        'Varco della prima soglia',
        'Prove, alleati e nemici',
        'Avvicinamento alla caverna profonda',
        'Prova centrale',
        'Ricompensa',
        'Via del ritorno',
        'Resurrezione',
        'Ritorno con l\'elisir'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Filtra keyPoints vuoti
        const cleanedData = {
            ...formData,
            keyPoints: formData.keyPoints.filter((p: string) => p.trim() !== '')
        };
        onSave(cleanedData);
    };

    const addKeyPoint = () => {
        setFormData(prev => ({
            ...prev,
            keyPoints: [...prev.keyPoints, '']
        }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.filter((_: string, i: number) => i !== index)
        }));
    };

    const updateKeyPoint = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.map((p: string, i: number) => i === index ? value : p)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {isNewChapter ? 'Aggiungi Capitolo' : 'Modifica Capitolo'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Selettore posizione - solo per nuovi capitoli */}
                        {isNewChapter && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Posizione
                                </label>
                                <select
                                    value={formData.insertPosition}
                                    onChange={(e) => setFormData(prev => ({ ...prev, insertPosition: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={0}>Alla fine (dopo tutti i capitoli)</option>
                                    {existingChapters.map((ch: any, idx: number) => (
                                        <option key={ch.number} value={ch.number}>
                                            Prima del Capitolo {ch.number}: {ch.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Scegli dove inserire il nuovo capitolo
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titolo
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrizione
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fase del Viaggio dell&apos;Eroe
                            </label>
                            <select
                                value={formData.heroJourneyPhase}
                                onChange={(e) => setFormData(prev => ({ ...prev, heroJourneyPhase: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {heroJourneyPhases.map(phase => (
                                    <option key={phase} value={phase}>{phase}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Punti Chiave
                                </label>
                                <button
                                    type="button"
                                    onClick={addKeyPoint}
                                    className="text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    + Aggiungi punto
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.keyPoints.map((point: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={point}
                                            onChange={(e) => updateKeyPoint(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder={`Punto chiave ${index + 1}`}
                                        />
                                        {formData.keyPoints.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeKeyPoint(index)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {isNewChapter ? 'Aggiungi' : 'Salva Modifiche'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
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
    // Global batch generation state (to disable buttons during batch operations)
    generatingChapter: number | null;
}

function ChaptersTab({
    project,
    onRefresh,
    regeneratingChapter,
    setRegeneratingChapter,
    generatingChapter
}: ChaptersTabProps) {
    const [editingChapter, setEditingChapter] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [undoingChapter, setUndoingChapter] = useState<number | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
    // Removed local regenerating state - now using global one
    const [runningCheck, setRunningCheck] = useState(false);
    const [consistencyReport, setConsistencyReport] = useState<any>(null);
    const [hasExistingReport, setHasExistingReport] = useState(false);
    const [lastReportDate, setLastReportDate] = useState<Date | null>(null);

    const toggleChapter = (chapterNumber: number) => {
        setExpandedChapters(prev =>
            prev.includes(chapterNumber)
                ? [] // Chiudi il capitolo se è già aperto
                : [chapterNumber] // Apri solo questo capitolo (chiudendo tutti gli altri)
        );
    };

    // Calcolo variabili necessarie per l'useEffect
    const completedChapters = project.chapters.filter(ch => ch.status === 'completed').length;
    const allChaptersComplete = project.outline &&
        completedChapters === (project.outline.structure as any).chapters?.length;

    // Verifica se ci sono capitoli modificati dopo l'ultimo report
    const contentChanged = lastReportDate !== null && project.chapters.some((chapter: any) => {
        const chapterUpdated = new Date(chapter.updatedAt);
        return chapterUpdated > lastReportDate;
    });

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
                        // Salva la data dell'ultimo report per confronto
                        if (data.createdAt) {
                            setLastReportDate(new Date(data.createdAt));
                        }
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
            // Il refresh aggiornerà updatedAt del capitolo, causando contentChanged = true automaticamente
            onRefresh();
        } catch (error) {
            console.error('Error saving chapter:', error);
            alert('Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async (chapterNumber: number) => {
        // Se il capitolo è in modalità editing, chiudi prima l'editor
        if (editingChapter === chapterNumber) {
            setEditingChapter(null);
            setEditContent('');
            return; // Esci dalla funzione, l'utente deve ricliccare per rigenerare
        }

        if (!confirm(`Rigenerare il Capitolo ${chapterNumber}? Il contenuto attuale verrà sostituito.`)) {
            return;
        }

        setRegeneratingChapter(chapterNumber);
        try {
            await fetch(`/api/projects/${project.id}/chapters/${chapterNumber}/generate`, {
                method: 'POST',
            });

            toast.success(`Capitolo ${chapterNumber} rigenerato con successo!`);

            // Il refresh aggiornerà updatedAt del capitolo, causando contentChanged = true automaticamente
            onRefresh();
        } catch (error) {
            console.error('Error regenerating chapter:', error);
            toast.error('Errore durante la rigenerazione del capitolo');
        } finally {
            setRegeneratingChapter(null);
        }
    };

    const handleUndo = async (chapterNumber: number) => {
        if (!confirm(`Ripristinare la versione precedente del Capitolo ${chapterNumber}?`)) {
            return;
        }

        setUndoingChapter(chapterNumber);
        try {
            const response = await fetch(`/api/projects/${project.id}/chapters/${chapterNumber}/undo`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore durante l\'undo');
            }

            toast.success(`✅ Versione precedente ripristinata!`);
            onRefresh();
        } catch (error: any) {
            console.error('Error undoing chapter:', error);
            toast.error(error.message || 'Errore durante il ripristino');
        } finally {
            setUndoingChapter(null);
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
            // Aggiorna la data dell'ultimo report - questo farà diventare contentChanged = false automaticamente
            setLastReportDate(new Date());
            toast.success('✅ Consistency check completato!');
        } catch (error) {
            console.error('Error running consistency check:', error);
            toast.error('Errore durante il consistency check');
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
            {/* Header con statistiche */}
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
                </div>
            </Card>

            {/* Lista capitoli */}
            <div className="space-y-4">
                {project.chapters.map((chapter) => {
                    const isExpanded = expandedChapters.includes(chapter.chapterNumber);

                    return (
                        <div key={chapter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Header - sempre visibile */}
                            <div className="p-4 flex items-center justify-between">
                                <button
                                    onClick={() => toggleChapter(chapter.chapterNumber)}
                                    className="flex-1 flex items-center gap-3 hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
                                >
                                    <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Capitolo {chapter.chapterNumber}: {chapter.title.replace(/^Capitolo\s+\d+:\s*/i, '')}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
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
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </div>

                            {/* Contenuto espandibile */}
                            {isExpanded && (
                                <div className="border-t border-gray-100">
                                    {/* Action buttons */}
                                    <div className="px-4 py-3 bg-gray-50 flex items-center gap-2 justify-end">
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
                                            <>
                                                {/* Show Undo button if previousContent exists */}
                                                {(chapter as any).previousContent && (
                                                    <button
                                                        onClick={() => handleUndo(chapter.chapterNumber)}
                                                        disabled={undoingChapter !== null || regeneratingChapter !== null || generatingChapter !== null}
                                                        className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center gap-1"
                                                        title="Ripristina versione precedente"
                                                    >
                                                        {undoingChapter === chapter.chapterNumber ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" />
                                                                Undo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Undo2 size={14} />
                                                                Undo
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(chapter)}
                                                    disabled={regeneratingChapter !== null || generatingChapter !== null}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
                                                >
                                                    <Edit2 size={14} />
                                                    Modifica
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleRegenerate(chapter.chapterNumber)}
                                            disabled={regeneratingChapter !== null || generatingChapter !== null}
                                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-1"
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

                                    {/* Content area */}
                                    <div className="px-4 pb-4">
                                        {editingChapter === chapter.chapterNumber ? (
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                                                placeholder="Contenuto del capitolo in Markdown..."
                                            />
                                        ) : (
                                            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                                                <div className="text-gray-700 whitespace-pre-wrap">
                                                    {chapter.content}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================
// CONSISTENCY TAB (Dedicated tab for consistency reports)
// ============================================================

interface ConsistencyTabProps {
    project: ProjectDetail;
    onRefresh: () => void;
    generatingChapter: number | null;
    regeneratingChapter: number | null;
}

function ConsistencyTab({
    project,
    onRefresh,
    generatingChapter,
    regeneratingChapter
}: ConsistencyTabProps) {
    const [runningCheck, setRunningCheck] = useState(false);
    const [consistencyReport, setConsistencyReport] = useState<any>(null);
    const [hasExistingReport, setHasExistingReport] = useState(false);
    const [lastReportDate, setLastReportDate] = useState<Date | null>(null);

    // Calcolo variabili necessarie
    const completedChapters = project.chapters.filter(ch => ch.status === 'completed').length;
    const allChaptersComplete = project.outline &&
        completedChapters === (project.outline.structure as any).chapters?.length;

    // Verifica se ci sono capitoli modificati dopo l'ultimo report
    const contentChanged = lastReportDate !== null && project.chapters.some((chapter: any) => {
        const chapterUpdated = new Date(chapter.updatedAt);
        return chapterUpdated > lastReportDate;
    });

    // Check se esiste già un consistency report
    useEffect(() => {
        const checkExistingReport = async () => {
            try {
                const response = await fetch(`/api/projects/${project.id}/consistency-check`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.report) {
                        setConsistencyReport(data.report);
                        setHasExistingReport(true);
                        setLastReportDate(new Date(data.report.createdAt || Date.now()));
                    }
                }
            } catch (error) {
                console.error('Error checking for existing report:', error);
            }
        };

        if (allChaptersComplete) {
            checkExistingReport();
        }
    }, [project.id, allChaptersComplete]);

    const handleConsistencyCheck = async () => {
        setRunningCheck(true);
        try {
            const response = await fetch(`/api/projects/${project.id}/consistency-check`, {
                method: 'POST',
            });
            const data = await response.json();
            setConsistencyReport(data.report);
            setHasExistingReport(true);
            setLastReportDate(new Date());
            toast.success('✅ Consistency check completato!');
        } catch (error) {
            console.error('Error running consistency check:', error);
            toast.error('Errore durante il consistency check');
        } finally {
            setRunningCheck(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <Card>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Consistency Check</h2>
                        <p className="text-sm text-gray-600">
                            Analisi automatica della coerenza narrativa, stilistica e fattuale del libro completo
                        </p>
                    </div>
                </div>

                {/* Status & Action Button */}
                {!allChaptersComplete ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-medium mb-1">Capitoli incompleti</p>
                                <p className="text-sm">
                                    Completa tutti i {(project.outline?.structure as any)?.chapters?.length || 0} capitoli per eseguire il consistency check finale.
                                    Capitoli completati: {completedChapters}/{(project.outline?.structure as any)?.chapters?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contentChanged && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm flex items-start gap-2">
                                <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                                <span>
                                    ⚠️ Hai modificato o rigenerato dei capitoli. Il report precedente potrebbe essere obsoleto - considera di rigenerarlo.
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleConsistencyCheck}
                            disabled={runningCheck || regeneratingChapter !== null || generatingChapter !== null}
                            className={`w-full px-6 py-3 text-white text-base font-medium rounded-lg flex items-center justify-center gap-3 transition-colors disabled:cursor-not-allowed ${contentChanged
                                ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300'
                                : hasExistingReport
                                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                                    : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                                }`}
                        >
                            {runningCheck ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Analisi in corso...
                                </>
                            ) : contentChanged ? (
                                <>
                                    <AlertCircle size={20} />
                                    ⚠️ Rigenera Consistency Check
                                </>
                            ) : hasExistingReport ? (
                                <>
                                    <AlertCircle size={20} />
                                    ✅ Rigenera Consistency Check
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Esegui Consistency Check
                                </>
                            )}
                        </button>
                    </div>
                )}
            </Card>

            {/* Consistency Report (se disponibile) */}
            {consistencyReport && (
                <Card>
                    <div className="space-y-6">
                        {/* Header con Overall Score */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {consistencyReport.overallScore || 0}
                                    </div>
                                    <div className="text-xs text-purple-600">/100</div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Completo</h3>
                                <p className="text-gray-600">
                                    Analisi dettagliata della qualità e coerenza del libro
                                </p>
                                {contentChanged && (
                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                        <AlertCircle size={12} />
                                        Potrebbe essere obsoleto
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score breakdown cards */}
                        {consistencyReport.narrative && consistencyReport.style && consistencyReport.consistency && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="text-xs font-semibold text-blue-600 uppercase mb-2">Coerenza Narrativa</div>
                                    <div className="text-3xl font-bold text-blue-900 mb-1">
                                        {consistencyReport.narrative.score || 0}<span className="text-lg">/100</span>
                                    </div>
                                    <div className="text-xs text-blue-700">
                                        Arco narrativo, progressione, transizioni
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                    <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Coerenza Stilistica</div>
                                    <div className="text-3xl font-bold text-purple-900 mb-1">
                                        {consistencyReport.style.score || 0}<span className="text-lg">/100</span>
                                    </div>
                                    <div className="text-xs text-purple-700">
                                        Tono, stile di scrittura, POV
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <div className="text-xs font-semibold text-green-600 uppercase mb-2">Coerenza Fattuale</div>
                                    <div className="text-3xl font-bold text-green-900 mb-1">
                                        {consistencyReport.consistency.score || 0}<span className="text-lg">/100</span>
                                    </div>
                                    <div className="text-xs text-green-700">
                                        Fatti, nomi, numeri, timeline
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Issues Section */}
                        {(consistencyReport.narrative?.issues?.length > 0 ||
                            consistencyReport.style?.issues?.length > 0 ||
                            consistencyReport.consistency?.issues?.length > 0) && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <AlertCircle size={20} className="text-orange-600" />
                                        Criticità Rilevate
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            ...(consistencyReport.narrative?.issues || []),
                                            ...(consistencyReport.style?.issues || []),
                                            ...(consistencyReport.consistency?.issues || [])
                                        ]
                                            .sort((a: any, b: any) => {
                                                // Ordina per capitolo (numerico ascendente)
                                                // Se chapter non esiste o è null, metti alla fine
                                                const chapterA = a.chapter || 999;
                                                const chapterB = b.chapter || 999;
                                                if (chapterA !== chapterB) {
                                                    return chapterA - chapterB;
                                                }
                                                // Se stesso capitolo, ordina per severity (high > medium > low)
                                                const severityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
                                                return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
                                            })
                                            .map((issue: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 rounded-lg border-l-4 ${issue.severity === 'high'
                                                        ? 'bg-red-50 border-red-500'
                                                        : issue.severity === 'medium'
                                                            ? 'bg-yellow-50 border-yellow-500'
                                                            : 'bg-gray-50 border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="font-medium text-gray-900">
                                                            {issue.chapter && (
                                                                <span className="text-purple-600 mr-2">Cap. {issue.chapter}:</span>
                                                            )}
                                                            {issue.description}
                                                        </div>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded uppercase font-semibold ${issue.severity === 'high'
                                                                ? 'bg-red-200 text-red-800'
                                                                : issue.severity === 'medium'
                                                                    ? 'bg-yellow-200 text-yellow-800'
                                                                    : 'bg-gray-200 text-gray-800'
                                                                }`}
                                                        >
                                                            {issue.severity}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 flex items-start gap-2">
                                                        <span className="text-gray-400">💡</span>
                                                        <span>{issue.suggestion}</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Recommendations */}
                        {consistencyReport.recommendations && consistencyReport.recommendations.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Raccomandazioni</h4>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <ul className="space-y-2">
                                        {consistencyReport.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx} className="text-gray-800 flex items-start gap-3">
                                                <span className="text-purple-600 font-bold flex-shrink-0">•</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Info Card */}
            {!consistencyReport && allChaptersComplete && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ Come funziona il Consistency Check</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>
                            Il consistency check utilizza <strong>GPT-5</strong> per analizzare l&apos;intero libro e verificare:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span><strong>Coerenza Narrativa:</strong> Arco narrativo completo, progressione logica, transizioni fluide</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600">•</span>
                                <span><strong>Coerenza Stilistica:</strong> Tono uniforme, stile consistente, POV e tempi verbali coerenti</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span><strong>Coerenza Fattuale:</strong> Assenza di contraddizioni in fatti, numeri, date, nomi</span>
                            </li>
                        </ul>
                        <p className="pt-2 text-gray-600">
                            L&apos;analisi impiega circa 30-60 secondi e genera un report dettagliato con score 0-100, criticità rilevate e raccomandazioni specifiche.
                        </p>
                    </div>
                </Card>
            )}
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

            // Mostra toast di avvio
            toast.info('📝 Generazione documento in corso... potrebbero essere necessari 1-2 minuti per libri completi');

            await projectsApi.exportDocx(project.id);

            setExportSuccess(true);
            toast.success('📄 Download completato! Il documento è stato salvato');
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'esportazione';
            setExportError(errorMessage);
            toast.error(`Errore nell'esportazione: ${errorMessage}`);
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
