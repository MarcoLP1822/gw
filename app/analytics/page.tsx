'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Mock data
    const stats = [
        {
            label: 'Revenue Totale',
            value: '€45,231',
            change: '+20.1%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-green-600'
        },
        {
            label: 'Progetti Completati',
            value: '28',
            change: '+15%',
            trend: 'up',
            icon: FileText,
            color: 'text-blue-600'
        },
        {
            label: 'Nuovi Clienti',
            value: '12',
            change: '+8%',
            trend: 'up',
            icon: Users,
            color: 'text-purple-600'
        },
        {
            label: 'Tempo Medio',
            value: '18.5 ore',
            change: '-5%',
            trend: 'down',
            icon: Clock,
            color: 'text-orange-600'
        },
    ];

    const monthlyData = [
        { month: 'Gen', projects: 5, revenue: 3200 },
        { month: 'Feb', projects: 7, revenue: 4800 },
        { month: 'Mar', projects: 6, revenue: 4100 },
        { month: 'Apr', projects: 9, revenue: 6200 },
        { month: 'Mag', projects: 8, revenue: 5800 },
        { month: 'Giu', projects: 10, revenue: 7200 },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Analytics Content */}
            <PageContainer
                title="Analytics"
                description="Analisi e statistiche delle tue attività"
            >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <Card key={index} padding="lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{stat.value}</p>
                                    <div className="flex items-center gap-1">
                                        {stat.trend === 'up' ? (
                                            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                                        ) : (
                                            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-500">vs mese scorso</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Projects Chart */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Progetti per Mese</h3>
                        <div className="space-y-3">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">{data.month}</span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${(data.projects / 10) * 100}%` }}
                                        >
                                            <span className="text-xs font-semibold text-white">
                                                {data.projects}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Revenue Chart */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue per Mese</h3>
                        <div className="space-y-3">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">{data.month}</span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="bg-green-600 dark:bg-green-500 h-full rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${(data.revenue / 7200) * 100}%` }}
                                        >
                                            <span className="text-xs font-semibold text-white">
                                                €{data.revenue}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Clients */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Clienti</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Cliente A</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">5 progetti</p>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">€8,500</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Cliente B</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">4 progetti</p>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">€6,200</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Cliente C</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">3 progetti</p>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">€4,800</span>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Attività Recenti</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Progetto completato</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Progetto Alpha - 2 ore fa</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nuovo cliente</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Cliente E registrato - 5 ore fa</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pagamento ricevuto</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">€1,200 da Cliente B - 1 giorno fa</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </PageContainer>
        </div>
    );
}
