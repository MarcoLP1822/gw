'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Eye, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    registrationDate: string;
    activeProjects: number;
    completedProjects: number;
    status: string;
}

// Mock data clienti
const mockClients: Client[] = [
    {
        id: '1',
        name: 'Cliente A',
        email: 'clientea@example.com',
        phone: '+39 123 456 7890',
        registrationDate: '15/01/2025',
        activeProjects: 2,
        completedProjects: 5,
        status: 'Attivo',
    },
    {
        id: '2',
        name: 'Cliente B',
        email: 'clienteb@example.com',
        phone: '+39 234 567 8901',
        registrationDate: '20/02/2025',
        activeProjects: 1,
        completedProjects: 3,
        status: 'Attivo',
    },
    {
        id: '3',
        name: 'Cliente C',
        email: 'clientec@example.com',
        phone: '+39 345 678 9012',
        registrationDate: '10/03/2025',
        activeProjects: 0,
        completedProjects: 8,
        status: 'Inattivo',
    },
    {
        id: '4',
        name: 'Cliente D',
        email: 'cliented@example.com',
        phone: '+39 456 789 0123',
        registrationDate: '05/04/2025',
        activeProjects: 3,
        completedProjects: 2,
        status: 'Attivo',
    },
    {
        id: '5',
        name: 'Cliente E',
        email: 'clientee@example.com',
        phone: '+39 567 890 1234',
        registrationDate: '12/05/2025',
        activeProjects: 1,
        completedProjects: 1,
        status: 'Attivo',
    },
];

export default function ClientTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients] = useState<Client[]>(mockClients);
    const router = useRouter();

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    const handleClientClick = (clientId: string) => {
        router.push(`/clients/${clientId}`);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Filtri Card */}
            <Card className="mb-6">
                {/* Filtri */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cerca:</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nome, email o telefono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data registrazione da:</label>
                        <div className="relative">
                            <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stato:</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md">
                            <option>Tutti</option>
                            <option>Attivo</option>
                            <option>Inattivo</option>
                        </select>
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

            {/* Tabella clienti Card */}
            <Card padding="none" className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nome</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Data Registrazione</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Progetti Attivi</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Progetti Completati</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Stato</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client, index) => (
                                <tr
                                    key={client.id}
                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-750'
                                        }`}
                                    onClick={() => handleClientClick(client.id)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200">{client.name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="text-blue-600 dark:text-blue-400">{client.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm dark:text-gray-300">{client.registrationDate}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                            {client.activeProjects}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                            {client.completedProjects}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${client.status === 'Attivo'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClientClick(client.id);
                                            }}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            title="Visualizza cliente"
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
