'use client';

import { useState } from 'react';
import { History, Clock, Tag, CheckCircle2, AlertCircle, Info, Zap, ChevronDown, ChevronRight } from 'lucide-react';
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
        version: '3.11.5',
        date: '17 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'UI/UX',
                items: [
                    'Exclude test files from Vercel production build',
                ],
            },
            {
                category: 'AI Configuration',
                items: [
                    'Next.js 15+ compatibility - async params and Prisma model IDs',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Aggiornato anche metodo PATCH per params asincroni',
                ],
            }
        ],
    },
    {
        version: '3.11.4',
        date: '17 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'AI Configuration',
                items: [
                    'Next.js 15+ compatibility - async params and Prisma model IDs',
                    'Aggiornato ai-config route per Next.js 15/16 params asincroni',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Aggiornato anche metodo PATCH per params asincroni',
                ],
            }
        ],
    },
    {
        version: '3.11.3',
        date: '17 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Generale',
                items: [
                    'Aggiornato anche metodo PATCH per params asincroni',
                    'Rimosse statistiche dal flipbook per accorciare la pagina',
                ],
            },
            {
                category: 'AI Configuration',
                items: [
                    'Aggiornato ai-config route per Next.js 15/16 params asincroni',
                ],
            }
        ],
    },
    {
        version: '3.11.2',
        date: '17 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'AI Configuration',
                items: [
                    'Aggiornato ai-config route per Next.js 15/16 params asincroni',
                    'Reduce GPT-5 reasoning effort from medium to low',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Rimosse statistiche dal flipbook per accorciare la pagina',
                ],
            }
        ],
    },
    {
        version: '3.11.1',
        date: '17 Novembre 2025',
        type: 'improvement',
        changes: [
            {
                category: 'Generale',
                items: [
                    'Rimosse statistiche dal flipbook per accorciare la pagina',
                ],
            },
            {
                category: 'AI Configuration',
                items: [
                    'Reduce GPT-5 reasoning effort from medium to low',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Pulizia documentazione - rimossi file obsoleti',
                ],
            }
        ],
    },
    {
        version: '3.11.0',
        date: '14 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'AI Configuration',
                items: [
                    'Reduce GPT-5 reasoning effort from medium to low',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Pulizia documentazione - rimossi file obsoleti',
                ],
            },
            {
                category: 'Deployment',
                items: [
                    'Implementato Vercel Blob per bypass limite 4.5MB upload',
                ],
            }
        ],
    },
    {
        version: '3.10.0',
        date: '13 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Pulizia documentazione - rimossi file obsoleti',
                ],
            },
            {
                category: 'Deployment',
                items: [
                    'Implementato Vercel Blob per bypass limite 4.5MB upload',
                    'Impostato blob vercel',
                ],
            }
        ],
    },
    {
        version: '3.9.0',
        date: '13 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Deployment',
                items: [
                    'Implementato Vercel Blob per bypass limite 4.5MB upload',
                    'Impostato blob vercel',
                    'Impostato blob vercel',
                ],
            }
        ],
    },
    {
        version: '3.8.5',
        date: '13 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Deployment',
                items: [
                    'Impostato blob vercel',
                    'Impostato blob vercel',
                    'Rimosso maxBodySize non valido da vercel.json',
                ],
            }
        ],
    },
    {
        version: '3.8.4',
        date: '13 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Deployment',
                items: [
                    'Impostato blob vercel',
                    'Rimosso maxBodySize non valido da vercel.json',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Aumentato limite dimensione file upload a 50MB',
                ],
            }
        ],
    },
    {
        version: '3.8.3',
        date: '13 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Deployment',
                items: [
                    'Rimosso maxBodySize non valido da vercel.json',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Aumentato limite dimensione file upload a 50MB',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Gestione errori JSON nel caricamento documenti',
                ],
            }
        ],
    },
    {
        version: '3.8.2',
        date: '13 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Generale',
                items: [
                    'Aumentato limite dimensione file upload a 50MB',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Gestione errori JSON nel caricamento documenti',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Correct TypeScript type for getProjectDocuments return value',
                ],
            }
        ],
    },
    {
        version: '3.8.1',
        date: '13 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Gestione errori JSON nel caricamento documenti',
                    'Resolve 413 error by excluding extractedText from documents list API',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Correct TypeScript type for getProjectDocuments return value',
                ],
            }
        ],
    },
    {
        version: '3.8.0',
        date: '13 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Gestione Progetti',
                items: [
                    'Correct TypeScript type for getProjectDocuments return value',
                    'Add multi-level web crawling feature for website-based project creation',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Resolve 413 error by excluding extractedText from documents list API',
                ],
            }
        ],
    },
    {
        version: '3.7.0',
        date: '13 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Resolve 413 error by excluding extractedText from documents list API',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Add multi-level web crawling feature for website-based project creation',
                ],
            },
            {
                category: 'UI/UX',
                items: [
                    'Aggiorna istruzioni v3.3.2 con info corrette GPT-5 e nuove funzionalità UI',
                ],
            }
        ],
    },
    {
        version: '3.6.0',
        date: '10 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Gestione Progetti',
                items: [
                    'Add multi-level web crawling feature for website-based project creation',
                ],
            },
            {
                category: 'UI/UX',
                items: [
                    'Aggiorna istruzioni v3.3.2 con info corrette GPT-5 e nuove funzionalità UI',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Card collassabili changelog, rimozione header sezioni, evidenziazione sidebar attiva',
                ],
            }
        ],
    },
    {
        version: '3.5.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'UI/UX',
                items: [
                    'Aggiorna istruzioni v3.3.2 con info corrette GPT-5 e nuove funzionalità UI',
                    'Responsive design per sezione progetti - filtri e card mobile',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Card collassabili changelog, rimozione header sezioni, evidenziazione sidebar attiva',
                ],
            }
        ],
    },
    {
        version: '3.4.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Card collassabili changelog, rimozione header sezioni, evidenziazione sidebar attiva',
                ],
            },
            {
                category: 'UI/UX',
                items: [
                    'Responsive design per sezione progetti - filtri e card mobile',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Scroll automatico per evitare card espanse fuori vista',
                ],
            }
        ],
    },
    {
        version: '3.3.2',
        date: '1 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'UI/UX',
                items: [
                    'Responsive design per sezione progetti - filtri e card mobile',
                ],
            },
            {
                category: 'Generale',
                items: [
                    'Scroll automatico per evitare card espanse fuori vista',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Aggiorna sezione ISTRUZIONI alla v3.2.0',
                ],
            }
        ],
    },
    {
        version: '3.3.1',
        date: '1 Novembre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Generale',
                items: [
                    'Scroll automatico per evitare card espanse fuori vista',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Aggiorna sezione ISTRUZIONI alla v3.2.0',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Aggiornato changelog completo con tutta la storia del progetto',
                ],
            }
        ],
    },
    {
        version: '3.3.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Aggiorna sezione ISTRUZIONI alla v3.2.0',
                    'Aggiunti permessi scrittura a GitHub Actions per auto-update changelog',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Aggiornato changelog completo con tutta la storia del progetto',
                ],
            }
        ],
    },
    {
        version: '3.2.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Gestione Progetti',
                items: [
                    'Aggiornato changelog completo con tutta la storia del progetto',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Aggiunti permessi scrittura a GitHub Actions per auto-update changelog',
                    'Implementato sistema automatico aggiornamento changelog via GitHub Actions',
                    'Aggiornamento changelog',
                ],
            }
        ],
    },
    {
        version: '3.1.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Aggiunti permessi scrittura a GitHub Actions per auto-update changelog',
                    'Implementato sistema automatico aggiornamento changelog via GitHub Actions',
                    'Aggiornamento changelog',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Implementata creazione progetto a partire da file',
                ],
            },
            {
                category: 'Export',
                items: [
                    'Migliorato feedback export DOCX per file grandi',
                ],
            }
        ],
    },
    {
        version: '3.0.0',
        date: '1 Novembre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Creazione Progetti',
                items: [
                    'Nuova modalità di creazione progetto a partire da file esistenti',
                    'Upload di documenti Word (.docx) per inizializzare progetti',
                    'Estrazione automatica di titolo, descrizione e contenuto dal documento',
                    'Integrazione con pipeline di elaborazione documenti',
                    'Suddivisione intelligente del contenuto in capitoli',
                ],
            },
            {
                category: 'Export e Elaborazione',
                items: [
                    'Migliorato feedback durante export DOCX per file di grandi dimensioni',
                    'Aumentato limite dimensione file a 50MB per upload documenti',
                ],
            },
            {
                category: 'Interfaccia Utente',
                items: [
                    'Modal migliorato per creazione progetto con opzione upload documento',
                    'Indicatori di caricamento durante l\'elaborazione del file',
                    'Feedback visivo per processo di upload e parsing',
                ],
            },
        ],
    },
    {
        version: '2.3.0',
        date: '31 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Versioning Capitoli',
                items: [
                    'Implementato sistema completo di versioning per i capitoli',
                    'Funzione Undo per ripristinare versioni precedenti dei capitoli',
                    'Storico modifiche con timestamp e possibilità di navigazione',
                    'Preservazione automatica delle versioni ad ogni modifica',
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
                    'Disattivato temporaneamente WorkflowStepper per ridurre ingombro visivo',
                ],
            },
        ],
    },
    {
        version: '2.1.2',
        date: '29 Ottobre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'Parametri AI',
                items: [
                    'Rimossi valori hardcoded nel prompt capitoli, ora usa targetWordsPerChapter dinamico',
                    'Fix visualizzazione temperatura: mostra valore default (0.7) invece di null',
                    'Aggiunto logging per debug configurazione AI',
                    'Aumentato targetWordsPerChapter: default 5000, max 10000',
                    'Aumentato limite maxTokens a 128k (limite reale di GPT-5)',
                    'Aumentato maxTokens a 20000 per prevenire troncamento capitoli',
                ],
            },
        ],
    },
    {
        version: '2.1.1',
        date: '28 Ottobre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'GPT-5 Integration',
                items: [
                    'Fix gestione diversi formati di risposta GPT-5 Responses API',
                    'Gestito correttamente output_text come oggetto nelle risposte',
                    'Estrazione testo dall\'array output[] con aumento maxOutputTokens',
                    'Aggiunto logging completo struttura risposta per debug',
                    'Gestito caso output_text undefined nelle risposte',
                ],
            },
            {
                category: 'Contenuti',
                items: [
                    'Aggiornato prompt capitoli per migliorare qualità della narrazione',
                ],
            },
        ],
    },
    {
        version: '2.1.0',
        date: '27 Ottobre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'PDF Processing',
                items: [
                    'Aggiunti polyfill per PDF.js in ambiente Node.js serverless',
                    'Sostituito pdf-parse con unpdf per compatibilità serverless',
                    'Fix conversione Buffer a Uint8Array per unpdf',
                ],
            },
        ],
    },
    {
        version: '2.0.1',
        date: '23 Ottobre 2025',
        type: 'bugfix',
        changes: [
            {
                category: 'UI Fixes',
                items: [
                    'Spostati pulsanti Reset e Salva in AI Settings per migliore UX',
                    'Risolto bug selezione modello AI',
                    'Fix errore di spelling in varie sezioni',
                ],
            },
        ],
    },
    {
        version: '2.0.0',
        date: '16 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Modelli AI',
                items: [
                    'Aggiunto supporto per GPT-5, GPT-5 mini e GPT-5 nano',
                    'Implementato selettore modello GPT-5 in AI Settings',
                    'Interfaccia migliorata per la selezione del modello AI',
                    'Descrizioni dettagliate per ogni modello con consigli d\'uso',
                    'Card AI settings rese collassabili per migliore organizzazione',
                ],
            },
            {
                category: 'Gestione Progetti',
                items: [
                    'Aggiunta colonna "Ultima Modifica" nella tabella progetti',
                ],
            },
        ],
    },
    {
        version: '1.9.0',
        date: '17 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Documentazione',
                items: [
                    'Aggiunta sezione Changelog nella sidebar per tracciare tutte le modifiche',
                    'Sistema di versioning per migliorare la trasparenza degli aggiornamenti',
                ],
            },
            {
                category: 'UI/UX',
                items: [
                    'Fix visualizzazione valori default in AI Settings',
                ],
            },
        ],
    },
    {
        version: '1.8.0',
        date: '16 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Responsive Design',
                items: [
                    'Implementazione completa responsive design per tutti i dispositivi',
                    'Ottimizzazione layout per mobile, tablet e desktop',
                    'Navigazione adattiva e touch-friendly',
                ],
            },
            {
                category: 'Deployment',
                items: [
                    'Preparazione deployment su Vercel',
                    'Fix rimozione variabili env mapping da vercel.json',
                    'Rimozione file .old.ts che causavano errori di build',
                    'Aggiornamento README con istruzioni deployment',
                ],
            },
        ],
    },
    {
        version: '1.7.0',
        date: '13 Ottobre 2025',
        type: 'improvement',
        changes: [
            {
                category: 'AI Configuration',
                items: [
                    'Aggiornamento modello AI a gpt-5-mini-2025-08-07',
                    'Implementato logging dettagliato per chiamate AI',
                    'Cambiato modello AI per ottimizzare performance',
                ],
            },
            {
                category: 'Gestione Errori',
                items: [
                    'Implementata gestione errori frontend completa',
                    'Error boundaries e fallback UI',
                    'Messaggi di errore user-friendly',
                ],
            },
            {
                category: 'UI/UX',
                items: [
                    'Migliorata sezione impostazioni con nuova struttura',
                    'Interfaccia più intuitiva e organizzata',
                ],
            },
            {
                category: 'Documentazione',
                items: [
                    'Rimosso README.md obsoleto dalla cartella docs',
                    'Pulizia documentazione e file non necessari',
                ],
            },
        ],
    },
    {
        version: '1.6.0',
        date: '12 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'UI Components',
                items: [
                    'Implementati Toast notifications per feedback utente',
                    'Aggiunto Skeleton loader per stati di caricamento',
                    'Animazioni e transizioni migliorate',
                ],
            },
            {
                category: 'AI Settings',
                items: [
                    'Ripensata architettura AI settings per maggiore flessibilità',
                    'Nuova UI con sezioni collapsibili per parametri tecnici',
                    'Sezione documenti di riferimento migliorata',
                    'Editor Style Guide potenziato',
                ],
            },
            {
                category: 'Generazione in Batch',
                items: [
                    'Aggiornato funzionamento generazione batch per migliore efficienza',
                    'Bug fixes vari relativi alla generazione multipla capitoli',
                ],
            },
        ],
    },
    {
        version: '1.5.0',
        date: '11 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Export DOCX',
                items: [
                    'Sistema completo di export in formato DOCX',
                    'Implementata costruzione file libro completo in formato Word',
                    'Formattazione professionale con stili e layout',
                    'Export singoli capitoli o libro completo',
                ],
            },
        ],
    },
    {
        version: '1.0.0',
        date: '10 Ottobre 2025',
        type: 'feature',
        changes: [
            {
                category: 'Release Iniziale',
                items: [
                    'Sistema completo di generazione libri con AI',
                    'Gestione progetti e clienti',
                    'Sistema creazione capitoli con AI',
                    'Consistency check per verifica coerenza narrativa',
                    'Dashboard analytics',
                    'Sistema di workflow per generazione contenuti',
                    'Editor di contenuti integrato',
                    'Database PostgreSQL con Prisma ORM',
                    'Autenticazione e autorizzazione',
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
    const [expandedVersions, setExpandedVersions] = useState<string[]>([]);

    const toggleVersion = (version: string) => {
        const isCurrentlyExpanded = expandedVersions.includes(version);

        setExpandedVersions(prev =>
            prev.includes(version)
                ? [] // Chiudi la versione se è già aperta
                : [version] // Apri solo questa versione (chiudendo tutte le altre)
        );

        // Scroll alla card dopo un breve delay per permettere l'animazione
        if (!isCurrentlyExpanded) {
            setTimeout(() => {
                const element = document.getElementById(`version-${version}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 100);
        }
    };

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
                        {changelog.map((entry, index) => {
                            const isExpanded = expandedVersions.includes(entry.version);

                            return (
                                <div
                                    key={entry.version}
                                    id={`version-${entry.version}`}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    {/* Entry Header - Now Clickable */}
                                    <button
                                        onClick={() => toggleVersion(entry.version)}
                                        className="w-full p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
                                    >
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
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{entry.date}</span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Entry Content - Collapsible */}
                                    {isExpanded && (
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
                                    )}
                                </div>
                            );
                        })}
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
