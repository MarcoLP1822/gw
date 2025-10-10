'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';

interface Project {
    id: string;
    date: string;
    orderNumber: string;
    invoiceNumber: string;
    title: string;
    client: string;
    status: string;
    receiptDate?: string;
}

// Mock data con placeholder
const mockProjects: Project[] = [
    {
        id: '1',
        date: '09/10/2025',
        orderNumber: 'PRJ-001',
        invoiceNumber: 'INV-2025-001',
        title: 'Progetto Alpha',
        client: 'Cliente A',
        status: 'In lavorazione',
    },
    {
        id: '2',
        date: '08/10/2025',
        orderNumber: 'PRJ-002',
        invoiceNumber: 'INV-2025-002',
        title: 'Progetto Beta',
        client: 'Cliente B',
        status: 'Revisione',
        receiptDate: '08/10/2025',
    },
    {
        id: '3',
        date: '07/10/2025',
        orderNumber: 'PRJ-003',
        invoiceNumber: 'INV-2025-003',
        title: 'Progetto Gamma',
        client: 'Cliente C',
        status: 'Completato',
    },
    {
        id: '4',
        date: '06/10/2025',
        orderNumber: 'PRJ-004',
        invoiceNumber: 'INV-2025-004',
        title: 'Progetto Delta',
        client: 'Cliente D',
        status: 'In attesa',
    },
    {
        id: '5',
        date: '05/10/2025',
        orderNumber: 'PRJ-005',
        invoiceNumber: 'INV-2025-005',
        title: 'Progetto Epsilon',
        client: 'Cliente E',
        status: 'In lavorazione',
        receiptDate: '05/10/2025',
    },
];

export default function ProjectTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects] = useState<Project[]>(mockProjects);
    const router = useRouter();

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.orderNumber.includes(searchTerm)
    );

    const handleProjectClick = (projectId: string) => {
        router.push(`/progetti/${projectId}`);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Filtri Card */}
            <Card className="mb-6">
                {/* Filtri */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente:</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cerca cliente..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data da:</label>
                        <div className="relative">
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data a:</label>
                        <div className="relative">
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                {/* Pulsanti filtro */}
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2">
                        <Filter size={18} />
                        Filtra
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
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
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Data</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">ID Progetto</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Fattura</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Titolo</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Stato</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Data Consegna</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((project, index) => (
                                <tr
                                    key={project.id}
                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-pink-50 dark:bg-gray-750'
                                        }`}
                                    onClick={() => handleProjectClick(project.id)}
                                >
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.date}</td>
                                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{project.orderNumber}</td>
                                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{project.invoiceNumber}</td>
                                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200">{project.title}</td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.client}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${project.status === 'Completato' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            project.status === 'In lavorazione' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                project.status === 'Revisione' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{project.receiptDate || '-'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProjectClick(project.id);
                                            }}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            title="Visualizza progetto"
                                        >
                                            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
