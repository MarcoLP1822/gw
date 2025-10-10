'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import type { Project } from '@/types';

interface ProjectListProps {
  selectedProject: string | null;
  onSelectProject: (projectId: string) => void;
}

// Mock data - in a real app, this would come from an API or database
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'AI Technology eBook',
    status: 'in-progress',
    dueDate: '2024-12-15',
    wordCount: 15000,
    client: 'Tech Corp',
    createdAt: '2024-11-01',
    updatedAt: '2024-11-18',
  },
  {
    id: '2',
    title: 'Business Leadership Guide',
    status: 'review',
    dueDate: '2024-11-30',
    wordCount: 25000,
    client: 'Leadership Inc',
    createdAt: '2024-10-15',
    updatedAt: '2024-11-17',
  },
  {
    id: '3',
    title: 'Marketing Strategies 2025',
    status: 'draft',
    wordCount: 5000,
    client: 'Marketing Pro',
    createdAt: '2024-11-10',
    updatedAt: '2024-11-16',
  },
  {
    id: '4',
    title: 'Personal Development Book',
    status: 'completed',
    dueDate: '2024-10-01',
    wordCount: 50000,
    client: 'Self Help Publishing',
    createdAt: '2024-08-01',
    updatedAt: '2024-10-01',
  },
];

const statusColors = {
  draft: 'bg-gray-200 text-gray-800',
  'in-progress': 'bg-blue-200 text-blue-800',
  review: 'bg-yellow-200 text-yellow-800',
  completed: 'bg-green-200 text-green-800',
};

export default function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects] = useState<Project[]>(mockProjects);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progetti</h2>
          <button
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Nuovo Progetto"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cerca progetti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter */}
        <button className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <Filter size={16} />
          <span>Filtra</span>
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nessun progetto trovato
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredProjects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={clsx(
                    'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                    selectedProject === project.id && 'bg-blue-50 border-l-4 border-blue-600'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">{project.title}</h3>
                    <span className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      statusColors[project.status]
                    )}>
                      {project.status}
                    </span>
                  </div>

                  {project.client && (
                    <p className="text-sm text-gray-600 mb-1">{project.client}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.wordCount.toLocaleString('en-US')} parole</span>
                    {project.dueDate && (
                      <span>Scadenza: {new Date(project.dueDate).toLocaleDateString('it-IT')}</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
