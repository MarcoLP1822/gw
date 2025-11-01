'use client';

import { useState } from 'react';
import { History, Clock, Tag, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';

interface ChangelogEntry {
    version: string;
    date: string;
    type: 'feature' | 'improvement' | 'bugfix' | 'breaking';
    changes: {
        category: string;
        items: string[];
    }[];
}

const changelog: ChangelogEntry[] = [
    {
        version: '2.2.1',
        date: '1 Novembre 2025',
        type: 'improvement',
        changes: [
            {
                category: 'Ottimizzazione UI',
                items: [
                    'Disattivato temporaneamente il componente WorkflowStepper nella pagina progetto',
                    'Ridotto ingombro visivo per migliore focus sui contenuti principali',
                    'Codice preservato per futura riattivazione',
                ],
            },
        ],
    },
    {
        version: '2.2.0',
        date: '1 Novembre 2025',
        type: 'improvement',
        changes: [
            {
                category: 'Consistency Check',
                items: [
                    'Nuova tab dedicata "Consistency" per i report di coerenza del libro',
                    'UI migliorata con score visuale grande e 3 card con gradient per dimensioni (narrativa, stile, fattuale)',
                    'Badge di warning per report obsoleti quando i capitoli vengono modificati',
                    'Ottimizzazione reasoning GPT-5: da "minimal" a "medium" per maggiore accuratezza',
                    'Aumentato maxOutputTokens da 2000 a 4000 per evitare troncamenti',
                    'Risolto problema architetturale: ora usa funzione helper centralizzata per reasoning effort',
                ],
            },
            {
                category: 'Esperienza Utente',
                items: [
                    'Tab Capitoli più pulita e focalizzata (rimosso report consistency)',
                    'Maggiore spazio visivo per report dettagliati nella nuova tab',
                    'Info card che spiega come funziona il consistency check',
                ],
            },
        ],
    },
    {
        version: '2.1.0',
        date: '17 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Nuove Funzionalità',
                items: [
                    'Aggiunta sezione Changelog nella sidebar per tracciare tutte le modifiche',
                    'Sistema di versioning per migliorare la trasparenza degli aggiornamenti',
                ],
            },
        ],
    },
    {
        version: '2.0.0',
        date: '15 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Modelli AI',
                items: [
                    'Aggiunto supporto per GPT-5, GPT-5 mini e GPT-5 nano',
                    'Interfaccia migliorata per la selezione del modello AI',
                    'Descrizioni dettagliate per ogni modello con consigli d\'uso',
                ],
            },
            {
                category: 'Configurazione AI',
                items: [
                    'Nuova UI con sezioni collapsibili per parametri tecnici',
                    'Sezione documenti di riferimento migliorata',
                    'Editor Style Guide potenziato',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Funzione "Reset Progetto Completo" per ricominciare da zero',
                    'Migliore gestione dello stato dei progetti',
                    'Alert e conferme di sicurezza per azioni distruttive',
                ],
            },
        ],
    },
    {
        version: '1.5.0',
        date: '10 Ottobre 2025',
        type: 'improvement',
        changes: [
            {
                category: 'UI/UX',
                items: [
                    'Design responsive migliorato per mobile e tablet',
                    'Sidebar completamente responsiva con menu mobile',
                    'Animazioni e transizioni più fluide',
                ],
            },
            {
                category: 'Performance',
                items: [
                    'Ottimizzazione caricamento componenti',
                    'Riduzione tempo di risposta API',
                ],
            },
        ],
    },
    {
        version: '1.0.0',
        date: '1 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Release Iniziale',
                items: [
                    'Sistema completo di generazione libri con AI',
                    'Gestione progetti e clienti',
                    'Dashboard analytics',
                    'Sistema di workflow per generazione contenuti',
                    'Editor di contenuti integrato',
                ],
            },
        ],
    },
];

const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
        case 'feature':
            return <Zap className="w-5 h-5 text-green-600" />;
        case 'improvement':
            return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
        case 'bugfix':
            return <AlertCircle className="w-5 h-5 text-orange-600" />;
        case 'breaking':
            return <Info className="w-5 h-5 text-red-600" />;
        default:
            return <History className="w-5 h-5 text-gray-600" />;
    }
};

const getTypeBadge = (type: ChangelogEntry['type']) => {
    const styles = {
        feature: 'bg-green-100 text-green-800 border-green-200',
        improvement: 'bg-blue-100 text-blue-800 border-blue-200',
        bugfix: 'bg-orange-100 text-orange-800 border-orange-200',
        breaking: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
        feature: 'Nuove Funzionalità',
        improvement: 'Miglioramenti',
        bugfix: 'Bug Fix',
        breaking: 'Breaking Changes',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
            {getTypeIcon(type)}
            {labels[type]}
        </span>
    );
};

export default function ChangelogPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />
            <PageContainer
                title="Changelog"
                onMenuClick={() => setMobileMenuOpen(true)}
            >
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <History className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Storico delle Modifiche
                                </h2>
                                <p className="text-gray-600">
                                    Tutte le modifiche, miglioramenti e nuove funzionalità del sistema Ghost Writing.
                                    Manteniamo traccia di ogni aggiornamento per garantire trasparenza e facilitare il debugging.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changelog Entries */}
                    <div className="space-y-6">
                        {changelog.map((entry, index) => (
                            <div
                                key={entry.version}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Entry Header */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-5 h-5 text-gray-500" />
                                                <span className="text-2xl font-bold text-gray-900">
                                                    v{entry.version}
                                                </span>
                                            </div>
                                            {getTypeBadge(entry.type)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>{entry.date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Entry Content */}
                                <div className="p-6">
                                    {entry.changes.map((change, changeIndex) => (
                                        <div key={changeIndex} className={changeIndex > 0 ? 'mt-6' : ''}>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                {change.category}
                                            </h3>
                                            <ul className="space-y-2">
                                                {change.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-start gap-3">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Note sulla Versione</p>
                                <p>
                                    Seguiamo il Semantic Versioning (MAJOR.MINOR.PATCH). Gli aggiornamenti MAJOR possono contenere
                                    breaking changes, i MINOR introducono nuove funzionalità, i PATCH correggono bug.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </div>
    );
}
