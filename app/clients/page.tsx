'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import ClientTable from '@/components/ClientTable';

export default function ClientiPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Client Table */}
            <PageContainer
                title="Clienti"
                description="Gestisci i tuoi clienti"
            >
                <ClientTable />
            </PageContainer>
        </div>
    );
}
