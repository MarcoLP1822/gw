'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import ProjectTableV2 from '@/components/ProjectTableV2';

export default function ProgettiPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Project Table */}
            <div className={clsx(
                "flex-1 overflow-auto transition-all duration-300",
                sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            )}>
                <PageContainer
                    title="Progetti"
                    description="Gestisci i tuoi progetti di ghost writing"
                    onMenuClick={() => setMobileMenuOpen(true)}
                >
                    <ProjectTableV2 />
                </PageContainer>
            </div>
        </div>
    );
}
