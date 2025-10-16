'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import NewProjectModal from '@/components/NewProjectModal';
import { ProjectFormData } from '@/types';
import { projectsApi } from '@/lib/api/projects';
import { toast } from '@/lib/ui/toast';
import { FileText, Users, Clock, CheckCircle, Plus, Loader2, Upload } from 'lucide-react';

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUsers: number;
  projectsThisMonth: number;
  completedThisMonth: number;
  projectsNearDeadline: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  author?: string;
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carica statistiche reali dal database
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();

        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch recent activity
        const activityResponse = await fetch('/api/stats/recent-activity');
        const activityData = await activityResponse.json();

        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statsConfig = stats ? [
    {
      label: 'Progetti Attivi',
      value: stats.activeProjects.toString(),
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Totale Utenti',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'In Scadenza',
      value: stats.projectsNearDeadline.toString(),
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      label: 'Completati Questo Mese',
      value: stats.completedThisMonth.toString(),
      icon: CheckCircle,
      color: 'bg-green-500'
    },
  ] : [];

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUploadFile = () => {
    // TODO: Implementare logica per caricamento file
    toast.info('Funzionalità di caricamento in arrivo!');
  };

  const handleSubmitProject = async (projectData: ProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Salva il progetto nel database tramite API
      const response = await projectsApi.create(projectData);

      // Chiudi il modal
      setIsModalOpen(false);

      // Mostra notifica di successo
      toast.success('Progetto creato con successo!');

      // Ricarica i dati della dashboard
      const statsResponse = await fetch('/api/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Naviga alla pagina del progetto appena creato
      router.push(`/progetti/${response.project.id}`);

    } catch (error) {
      console.error('Errore durante la creazione del progetto:', error);
      toast.error('Errore durante la creazione del progetto. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatTimestamp(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minuti fa`;
    } else if (diffHours < 24) {
      return `${diffHours} ore fa`;
    } else if (diffDays === 1) {
      return '1 giorno fa';
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`;
    } else {
      return time.toLocaleDateString('it-IT');
    }
  }

  function getActivityColor(type: string): string {
    switch (type) {
      case 'completed':
        return 'bg-green-600 dark:bg-green-400';
      case 'generation':
        return 'bg-blue-600 dark:bg-blue-400';
      case 'updated':
        return 'bg-purple-600 dark:bg-purple-400';
      default:
        return 'bg-gray-600 dark:bg-gray-400';
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Dashboard Content */}
      <PageContainer
        title="Dashboard"
        description="Panoramica generale della tua attività"
        onMenuClick={() => setMobileMenuOpen(true)}
      >
        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="lg">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {statsConfig.map((stat, index) => (
              <Card key={index} padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action - Nuovo Progetto e Caricamento File */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Card Nuovo Progetto */}
          <Card>
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="mb-4 p-3 sm:p-4 bg-blue-100 rounded-full">
                <Plus size={28} className="sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Crea un Nuovo Progetto
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center max-w-md px-4">
                Inizia un nuovo progetto di ghost writing e gestisci tutti i dettagli in un unico posto
              </p>
              <button
                onClick={handleNewProject}
                disabled={isSubmitting}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Nuovo Progetto
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card padding="lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Attività Recente</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{activity.description}</p>
                    <p className="text-xs text-gray-600 break-words">
                      {activity.title} {activity.author && `- ${activity.author}`} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-600">Nessuna attività recente</p>
          )}
        </Card>
      </PageContainer>

      {/* Modal per nuovo progetto */}
      <NewProjectModal
        isOpen={isModalOpen}
        onCloseAction={handleCloseModal}
        onSubmitAction={handleSubmitProject}
      />
    </div>
  );
}

