'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Edit2, Trash2, Loader2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import NewProjectModal from '@/components/NewProjectModal';
import { projectsApi } from '@/lib/api/projects';
import { ProjectTableSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/lib/ui/toast';
import { ProjectFormData } from '@/types';

type SortField = 'bookTitle' | 'authorName' | 'company' | 'industry' | 'status' | 'chapters' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

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
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.company.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !statusFilter || project.status === statusFilter;

        const matchesDate = !dateFrom || new Date(project.createdAt) >= new Date(dateFrom);

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort projects
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortDirection) return 0;

        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'bookTitle':
                aValue = a.bookTitle.toLowerCase();
                bValue = b.bookTitle.toLowerCase();
                break;
            case 'authorName':
                aValue = a.authorName.toLowerCase();
                bValue = b.authorName.toLowerCase();
                break;
            case 'company':
                aValue = a.company.toLowerCase();
                bValue = b.company.toLowerCase();
                break;
            case 'industry':
                aValue = a.industry.toLowerCase();
                bValue = b.industry.toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'chapters':
                aValue = a._count.chapters;
                bValue = b._count.chapters;
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') setSortDirection('desc');
            else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField('createdAt');
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
        if (sortDirection === 'asc') return <ArrowUp size={14} className="ml-1 text-blue-600" />;
        if (sortDirection === 'desc') return <ArrowDown size={14} className="ml-1 text-blue-600" />;
        return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFrom('');
    };

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
                {/* Filtri */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cerca:</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Titolo, autore o azienda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data creazione da:</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stato:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        >
                            <option value="">Tutti</option>
                            <option value="draft">Bozza</option>
                            <option value="generating_outline">Generando Outline</option>
                            <option value="generating_chapters">Generando Capitoli</option>
                            <option value="completed">Completato</option>
                            <option value="error">Errore</option>
                        </select>
                    </div>
                </div>

                {/* Pulsanti filtro */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { /* Filtri già applicati in real-time */ }}
                        className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Filtra
                    </button>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Annulla filtro
                    </button>
                </div>
            </Card>

            {/* Tabella progetti Card */}
            <Card padding="none" className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('bookTitle')}
                                >
                                    <div className="flex items-center">
                                        Titolo Libro
                                        <SortIcon field="bookTitle" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('authorName')}
                                >
                                    <div className="flex items-center">
                                        Autore
                                        <SortIcon field="authorName" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('company')}
                                >
                                    <div className="flex items-center">
                                        Azienda
                                        <SortIcon field="company" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('industry')}
                                >
                                    <div className="flex items-center">
                                        Settore
                                        <SortIcon field="industry" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center">
                                        Status
                                        <SortIcon field="status" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('chapters')}
                                >
                                    <div className="flex items-center">
                                        Capitoli
                                        <SortIcon field="chapters" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center">
                                        Data Creazione
                                        <SortIcon field="createdAt" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProjects.map((project, index) => (
                                <tr
                                    key={project.id}
                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-750'
                                        }`}
                                    onClick={() => handleProjectClick(project.id)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900 dark:text-gray-200">{project.bookTitle}</div>
                                        {project.bookSubtitle && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{project.bookSubtitle}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.authorName}</td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.company}</td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.industry}</td>
                                    <td className="px-4 py-3 text-sm">{getStatusBadge(project.status)}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                            {project._count.chapters || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{formatDate(project.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleEditClick(project.id, e)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Modifica progetto"
                                            >
                                                <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(project.id, project.bookTitle, e)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Elimina progetto"
                                            >
                                                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer con contatore */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Totale: <span className="font-semibold">{sortedProjects.length}</span> progetti
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
