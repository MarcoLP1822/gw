'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import ProjectTableV2 from '@/components/ProjectTableV2';

export default function ProgettiPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Project Table */}
            <PageContainer
                title="Progetti"
                description="Gestisci i tuoi progetti di ghost writing"
            >
                <ProjectTableV2 />
            </PageContainer>
        </div>
    );
}
