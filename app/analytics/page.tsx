'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from 'lucide-react';

interface MonthlyData {
    month: string;
    year: number;
    projects: number;
    completed: number;
    words: number;
}

interface TopProject {
    id: string;
    title: string;
    author: string;
    chapters: number;
    totalWords: number;
    status: string;
}

interface AnalyticsData {
    monthlyData: MonthlyData[];
    topProjects: TopProject[];
    totalWords: number;
    averageChapterLength: number;
}

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true);
                const response = await fetch('/api/stats/analytics');
                const data = await response.json();

                if (data.success) {
                    setAnalytics(data.analytics);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    // Calcola le statistiche per le card principali
    const totalProjects = analytics?.monthlyData.reduce((sum, m) => sum + m.projects, 0) || 0;
    const totalCompleted = analytics?.monthlyData.reduce((sum, m) => sum + m.completed, 0) || 0;
    const averageWords = analytics?.averageChapterLength || 0;

    // Calcola le variazioni percentuali in modo sicuro
    const getPercentChange = (current: number, previous: number): string => {
        if (!previous || previous === 0) return '+0%';
        return ((current / previous - 1) * 100).toFixed(1) + '%';
    };

    const lastMonthWords = analytics?.monthlyData[analytics.monthlyData.length - 1]?.words || 0;
    const prevMonthWords = analytics?.monthlyData[analytics.monthlyData.length - 2]?.words || 0;

    const lastMonthCompleted = analytics?.monthlyData[analytics.monthlyData.length - 1]?.completed || 0;
    const prevMonthCompleted = analytics?.monthlyData[analytics.monthlyData.length - 2]?.completed || 0;

    const lastMonthProjects = analytics?.monthlyData[analytics.monthlyData.length - 1]?.projects || 0;
    const prevMonthProjects = analytics?.monthlyData[analytics.monthlyData.length - 2]?.projects || 0;

    const stats = [
        {
            label: 'Totale Parole',
            value: analytics ? (analytics.totalWords / 1000).toFixed(1) + 'k' : '0',
            change: '+' + getPercentChange(lastMonthWords, prevMonthWords),
            trend: 'up' as const,
            icon: FileText,
            color: 'text-blue-600'
        },
        {
            label: 'Progetti Completati',
            value: totalCompleted.toString(),
            change: '+' + getPercentChange(lastMonthCompleted, prevMonthCompleted),
            trend: 'up' as const,
            icon: FileText,
            color: 'text-green-600'
        },
        {
            label: 'Totale Progetti',
            value: totalProjects.toString(),
            change: '+' + getPercentChange(lastMonthProjects, prevMonthProjects),
            trend: 'up' as const,
            icon: Users,
            color: 'text-purple-600'
        },
        {
            label: 'Media Parole/Cap',
            value: averageWords > 0 ? averageWords.toString() : '0',
            change: '~' + Math.round(averageWords / 250) + ' pagine',
            trend: 'up' as const,
            icon: Clock,
            color: 'text-orange-600'
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
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
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : analytics && analytics.monthlyData.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.monthlyData.map((data, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">{data.month}</span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                            <div
                                                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full flex items-center justify-end pr-3"
                                                style={{
                                                    width: `${Math.max(10, Math.min(100, (data.projects / Math.max(...analytics.monthlyData.map(m => m.projects))) * 100))}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {data.projects}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nessun dato disponibile</p>
                        )}
                    </Card>

                    {/* Words Chart */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Parole Scritte per Mese</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : analytics && analytics.monthlyData.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.monthlyData.map((data, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">{data.month}</span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                            <div
                                                className="bg-green-600 dark:bg-green-500 h-full rounded-full flex items-center justify-end pr-3"
                                                style={{
                                                    width: `${Math.max(10, Math.min(100, (data.words / Math.max(...analytics.monthlyData.map(m => m.words))) * 100))}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {(data.words / 1000).toFixed(1)}k
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nessun dato disponibile</p>
                        )}
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Projects */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Progetti</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ))}
                            </div>
                        ) : analytics && analytics.topProjects.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topProjects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {project.author} • {project.chapters} capitoli
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {(project.totalWords / 1000).toFixed(1)}k
                                            </span>
                                            <p className="text-xs text-gray-500">parole</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nessun progetto disponibile</p>
                        )}
                    </Card>

                    {/* Project Status */}
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Stato Progetti</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : analytics && analytics.topProjects.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topProjects.slice(0, 5).map((project) => (
                                    <div key={project.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${project.status === 'completed' ? 'bg-green-600' :
                                                project.status === 'generating_chapters' ? 'bg-blue-600' :
                                                    project.status === 'error' ? 'bg-red-600' :
                                                        'bg-gray-600'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {project.status === 'completed' ? 'Completato' :
                                                    project.status === 'generating_chapters' ? 'In generazione' :
                                                        project.status === 'generating_outline' ? 'Creando outline' :
                                                            project.status === 'error' ? 'Errore' :
                                                                'In bozza'} • {project.chapters} cap
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Nessun progetto disponibile</p>
                        )}
                    </Card>
                </div>
            </PageContainer>
        </div>
    );
}
