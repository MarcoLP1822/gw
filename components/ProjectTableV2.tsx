'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import NewProjectModal from '@/components/NewProjectModal';
import { projectsApi } from '@/lib/api/projects';
import { ProjectTableSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/lib/ui/toast';
import { ProjectFormData } from '@/types';

interface ProjectListItem {
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
    _count: {
        chapters: number;
    };
}

export default function ProjectTableV2() {
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Fetch progetti dal database
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await projectsApi.getAll();
            setProjects(response.projects);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProjectClick = (projectId: string) => {
        router.push(`/progetti/${projectId}`);
    };

    const handleDelete = async (projectId: string, projectTitle: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Previeni la navigazione al progetto

        if (!confirm(`Sei sicuro di voler eliminare il progetto "${projectTitle}"?\n\nQuesta azione è irreversibile e eliminerà:\n- Tutte le informazioni del progetto\n- L'outline generato\n- Tutti i capitoli\n- I report di consistenza\n\nContinuare?`)) {
            return;
        }

        try {
            await projectsApi.delete(projectId);
            toast.success('✅ Progetto eliminato con successo');
            // Ricarica la lista progetti
            fetchProjects();
        } catch (err) {
            toast.error('❌ Errore durante l\'eliminazione del progetto');
            console.error('Error deleting project:', err);
        }
    };

    const handleEditClick = async (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // Fetch full project details
            const response = await projectsApi.getById(projectId);
            const projectDetail = response.project; // Estrae il progetto dalla response
            console.log('Loaded project details:', projectDetail); // Debug
            setEditingProject(projectDetail as any);
            // Aspetta che lo stato sia aggiornato prima di aprire il modal
            setTimeout(() => setIsEditModalOpen(true), 0);
        } catch (err) {
            toast.error('❌ Errore nel caricamento del progetto');
            console.error('Error loading project:', err);
        }
    };

    const handleUpdateProject = async (formData: ProjectFormData) => {
        if (!editingProject) return;

        try {
            await projectsApi.update(editingProject.id, formData);
            toast.success('✅ Progetto aggiornato con successo');
            setIsEditModalOpen(false);
            setEditingProject(null);
            fetchProjects(); // Ricarica la lista
        } catch (err) {
            toast.error('❌ Errore durante l\'aggiornamento del progetto');
            console.error('Error updating project:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-800' },
            generating_outline: { label: 'Outline', color: 'bg-blue-100 text-blue-800' },
            generating_chapters: { label: 'Capitoli', color: 'bg-purple-100 text-purple-800' },
            completed: { label: 'Completato', color: 'bg-green-100 text-green-800' },
            error: { label: 'Errore', color: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <ProjectTableSkeleton rows={6} />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Errore</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchProjects}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Riprova
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // Empty State
    if (projects.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun Progetto</h3>
                    <p className="text-gray-600 mb-4">
                        Non hai ancora creato nessun progetto. Inizia creando il tuo primo libro!
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Filtri Card */}
            <Card className="mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cerca per titolo, autore o azienda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Filter size={18} />
                        Filtri
                    </button>
                </div>

                {searchTerm && (
                    <div className="mt-3 text-sm text-gray-600">
                        Trovati <span className="font-semibold">{filteredProjects.length}</span> progetti
                    </div>
                )}
            </Card>

            {/* Projects Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Titolo Libro</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Autore</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Azienda</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Settore</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Capitoli</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Data Creazione</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-700">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleProjectClick(project.id)}
                                >
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{project.bookTitle}</div>
                                            {project.bookSubtitle && (
                                                <div className="text-sm text-gray-500">{project.bookSubtitle}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{project.authorName}</td>
                                    <td className="py-3 px-4 text-gray-700">{project.company}</td>
                                    <td className="py-3 px-4 text-gray-600 text-sm">{project.industry}</td>
                                    <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                                    <td className="py-3 px-4 text-center text-gray-700">
                                        {project._count.chapters || 0}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 text-sm">
                                        {formatDate(project.createdAt)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => handleEditClick(project.id, e)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 hover:scale-110 rounded-md transition-all duration-200"
                                                title="Modifica progetto"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(project.id, project.bookTitle, e)}
                                                className="p-2 text-red-600 hover:bg-red-50 hover:scale-110 rounded-md transition-all duration-200"
                                                title="Elimina progetto"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Totale: {filteredProjects.length} progetti
                    </div>
                </div>
            </Card>

            {/* Edit Project Modal */}
            {editingProject && (
                <NewProjectModal
                    isOpen={isEditModalOpen}
                    onCloseAction={() => {
                        setIsEditModalOpen(false);
                        setEditingProject(null);
                    }}
                    onSubmitAction={handleUpdateProject}
                    mode="edit"
                    initialData={{
                        authorName: editingProject.authorName || '',
                        authorRole: editingProject.authorRole || '',
                        company: editingProject.company || '',
                        industry: editingProject.industry || '',
                        bookTitle: editingProject.bookTitle || '',
                        bookSubtitle: editingProject.bookSubtitle || '',
                        targetReaders: editingProject.targetReaders || '',
                        currentSituation: editingProject.currentSituation || '',
                        challengeFaced: editingProject.challengeFaced || '',
                        transformation: editingProject.transformation || '',
                        achievement: editingProject.achievement || '',
                        lessonLearned: editingProject.lessonLearned || '',
                        businessGoals: editingProject.businessGoals || '',
                        uniqueValue: editingProject.uniqueValue || '',
                        estimatedPages: editingProject.estimatedPages || undefined,
                        additionalNotes: editingProject.additionalNotes || '',
                    }}
                />
            )}
        </div>
    );
}
