'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import { ArrowLeft, Mail, Phone, Calendar, FileText } from 'lucide-react';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const router = useRouter();

    // Mock client data
    const client = {
        id: params.id,
        name: 'Cliente A',
        email: 'clientea@example.com',
        phone: '+39 123 456 7890',
        registrationDate: '15/01/2025',
        address: 'Via Roma 123, Milano, Italia',
        activeProjects: 2,
        completedProjects: 5,
        status: 'Attivo',
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <div className={clsx(
                "flex-1 overflow-auto transition-all duration-300",
                sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            )}>
                <PageContainer>
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/clients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span>Torna all&apos;elenco clienti</span>
                    </button>

                    {/* Client Header */}
                    <Card padding="lg" className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${client.status === 'Attivo'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {client.status}
                                </span>
                            </div>
                        </div>

                        {/* Client Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center gap-3">
                                <Mail className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-gray-900">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Telefono</p>
                                    <p className="text-gray-900">{client.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Data Registrazione</p>
                                    <p className="text-gray-900">{client.registrationDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Progetti</p>
                                    <p className="text-gray-900">
                                        {client.activeProjects} attivi, {client.completedProjects} completati
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Projects Section */}
                    <Card padding="lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Progetti del Cliente</h2>
                        <p className="text-gray-600">Lista progetti verrà visualizzata qui...</p>
                    </Card>
                </PageContainer>
            </div>
        </div>
    );
}
