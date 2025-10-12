'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import NewProjectModal from '@/components/NewProjectModal';
import { ProjectFormData } from '@/types';
import { projectsApi } from '@/lib/api/projects';
import { toast } from '@/lib/ui/toast';
import { FileText, Users, Clock, CheckCircle, Plus, Loader2 } from 'lucide-react';

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Mock data per la dashboard
  const stats = [
    { label: 'Progetti Attivi', value: '8', icon: FileText, color: 'bg-blue-500' },
    { label: 'Clienti', value: '12', icon: Users, color: 'bg-purple-500' },
    { label: 'In Scadenza', value: '3', icon: Clock, color: 'bg-orange-500' },
    { label: 'Completati Questo Mese', value: '15', icon: CheckCircle, color: 'bg-green-500' },
  ];

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

      // Naviga alla pagina del progetto appena creato
      router.push(`/progetti/${response.project.id}`);

    } catch (error) {
      console.error('Errore durante la creazione del progetto:', error);
      toast.error('Errore durante la creazione del progetto. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Dashboard Content */}
      <PageContainer
        title="Dashboard"
        description="Panoramica generale della tua attività"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action - Nuovo Progetto */}
        <Card className="mb-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 p-4 bg-blue-100 rounded-full">
              <Plus size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Crea un Nuovo Progetto
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Inizia un nuovo progetto di ghost writing e gestisci tutti i dettagli in un unico posto
            </p>
            <button
              onClick={handleNewProject}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Recent Activity Section */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attività Recente</h2>
          <p className="text-gray-600">Qui verranno mostrate le attività recenti...</p>
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

