'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import EditProjectModal from '@/components/EditProjectModal';
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
    Clock
} from 'lucide-react';

type TabType = 'overview' | 'outline' | 'chapters' | 'export';

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
                <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
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
                <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
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
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
                    {activeTab === 'overview' && (
                        <OverviewTab project={project} onRefresh={fetchProject} />
                    )}
                    {activeTab === 'outline' && (
                        <OutlineTab project={project} onRefresh={fetchProject} />
                    )}
                    {activeTab === 'chapters' && (
                        <ChaptersTab project={project} onRefresh={fetchProject} />
                    )}
                    {activeTab === 'export' && (
                        <ExportTab project={project} />
                    )}
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
// OUTLINE TAB (Sprint 3 - AI Generation)
// ============================================================

function OutlineTab({ project, onRefresh }: { project: ProjectDetail; onRefresh: () => void }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateOutline = async () => {
        setIsGenerating(true);
        setError(null);

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
            setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        } finally {
            setIsGenerating(false);
        }
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

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerateOutline}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
                        >
                            {isGenerating ? (
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
                        disabled={isGenerating}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2 transition-colors"
                    >
                        {isGenerating ? (
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
                        {outline.chapters?.length || 0} capitoli
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

            {/* Lista capitoli */}
            <div className="space-y-4">
                {outline.chapters?.map((chapter: any, index: number) => (
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

                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                                    <Sparkles size={12} />
                                    {chapter.heroJourneyPhase}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}

// ============================================================
// CHAPTERS TAB (Placeholder per Sprint 4)
// ============================================================

function ChaptersTab({ project, onRefresh }: { project: ProjectDetail; onRefresh: () => void }) {
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
                            Prima devi generare l&apos;outline, poi potrai generare i capitoli (Sprint 4)
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {project.chapters.map((chapter) => (
                <Card key={chapter.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Capitolo {chapter.chapterNumber}: {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                        {chapter.wordCount} parole • Status: {chapter.status}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700 line-clamp-3">{chapter.content}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ============================================================
// EXPORT TAB (Placeholder per Sprint 5)
// ============================================================

function ExportTab({ project }: { project: ProjectDetail }) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="text-center py-12">
                    <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Esportazione Documento</h3>
                    <p className="text-gray-600 mb-6">
                        L&apos;esportazione in DOCX sarà disponibile dopo aver generato i capitoli.
                    </p>
                    <button
                        disabled
                        className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        <Download size={20} />
                        Scarica DOCX (Coming Soon)
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Questa funzionalità sarà disponibile nello Sprint 5
                    </p>
                </div>
            </Card>
        </div>
    );
}
