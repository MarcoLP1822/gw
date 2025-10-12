'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import {
    BookOpen,
    FileText,
    Sparkles,
    Settings,
    Download,
    CheckCircle,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface InstructionSection {
    id: string;
    title: string;
    icon: any;
    content: string[];
    subsections?: {
        title: string;
        steps: string[];
    }[];
}

const instructions: InstructionSection[] = [
    {
        id: 'introduzione',
        title: 'Introduzione alla Piattaforma',
        icon: BookOpen,
        content: [
            'Benvenuto nella piattaforma Ghost Writing AI! Questo strumento ti permette di creare libri professionali utilizzando l\'intelligenza artificiale.',
            'La piattaforma gestisce l\'intero processo: dalla raccolta delle informazioni iniziali, alla generazione dell\'outline, fino alla scrittura dei capitoli e l\'esportazione finale.',
        ],
    },
    {
        id: 'nuovo-progetto',
        title: '1. Creare un Nuovo Progetto',
        icon: FileText,
        content: [
            'Per iniziare, vai alla sezione "Progetti" e clicca su "Nuovo Progetto".',
        ],
        subsections: [
            {
                title: 'Informazioni Base',
                steps: [
                    'Nome dell\'autore e ruolo professionale',
                    'Nome dell\'azienda e settore di appartenenza',
                    'Titolo del libro (e sottotitolo opzionale)',
                    'Pubblico target a cui si rivolge il libro',
                ],
            },
            {
                title: 'Hero\'s Journey',
                steps: [
                    'Situazione attuale: da dove parti?',
                    'Sfida affrontata: quali ostacoli hai superato?',
                    'Trasformazione: come sei cambiato?',
                    'Risultato ottenuto: cosa hai raggiunto?',
                    'Lezione appresa: qual è il messaggio principale?',
                ],
            },
            {
                title: 'Obiettivi di Business',
                steps: [
                    'Obiettivi del libro per il tuo business',
                    'Valore unico che vuoi comunicare',
                    'Numero di pagine stimato (opzionale)',
                    'Note aggiuntive (opzionale)',
                ],
            },
        ],
    },
    {
        id: 'ai-settings',
        title: '2. Configurare le Impostazioni AI',
        icon: Settings,
        content: [
            'Prima di generare l\'outline, configura come l\'AI scriverà il tuo libro nella sezione "AI Settings".',
        ],
        subsections: [
            {
                title: 'Modalità Semplice',
                steps: [
                    '📊 Target Audience: scegli il pubblico (professionisti, imprenditori, pubblico generale, ecc.)',
                    '🎯 Obiettivo del Libro: personal branding, lead generation, insegnamento, ecc.',
                    '✨ Stile di Scrittura: scegli tra 8 preset predefiniti (storytelling, didattico, professionale, ecc.)',
                    '📏 Lunghezza Capitoli: conciso (~1000 parole), standard (~2000), dettagliato (~3000)',
                ],
            },
            {
                title: 'Modalità Avanzata (Opzionale)',
                steps: [
                    'Modello AI: scegli tra GPT-4o-mini (veloce), GPT-4o, o GPT-4-turbo',
                    'Temperature: creatività (0.0 = preciso, 2.0 = creativo)',
                    'Max Tokens: limite massimo per capitolo (default 4000)',
                    'Target Words: parole target per capitolo (default 2000)',
                    'Top P, Frequency Penalty, Presence Penalty: controlli avanzati',
                    'Custom Prompts: sostituisci le istruzioni predefinite (per utenti esperti)',
                ],
            },
        ],
    },
    {
        id: 'outline',
        title: '3. Generare l\'Outline',
        icon: Sparkles,
        content: [
            'Una volta configurate le impostazioni AI, vai al tab "Outline" e clicca su "Genera Outline".',
            'L\'AI analizzerà tutte le informazioni fornite e creerà una struttura completa del libro con:',
        ],
        subsections: [
            {
                title: 'Contenuto dell\'Outline',
                steps: [
                    'Titolo e sottotitolo del libro',
                    'Numero totale di capitoli consigliati',
                    'Titolo e descrizione di ogni capitolo',
                    'Temi principali da trattare',
                    'Flusso narrativo coerente',
                ],
            },
        ],
    },
    {
        id: 'capitoli',
        title: '4. Generare i Capitoli',
        icon: FileText,
        content: [
            'Dopo aver generato l\'outline, puoi iniziare a generare i capitoli uno alla volta.',
            'I capitoli devono essere generati in ordine sequenziale (non puoi generare il Capitolo 3 prima del Capitolo 2).',
        ],
        subsections: [
            {
                title: 'Processo di Generazione',
                steps: [
                    'Ogni capitolo viene scritto considerando il contesto dei capitoli precedenti',
                    'L\'AI mantiene coerenza di stile, terminologia e personaggi',
                    'Puoi vedere il progresso in tempo reale',
                    'Una volta completato, il capitolo appare nella sezione "Capitoli"',
                ],
            },
            {
                title: 'Modifica e Rigenerazione',
                steps: [
                    '✏️ Modifica: clicca su "Modifica" per editare manualmente il contenuto',
                    '♻️ Rigenera: clicca su "Rigenera" per far riscrivere il capitolo dall\'AI',
                    '⚠️ Nota: modificare o rigenerare un capitolo invaliderà il Consistency Check',
                ],
            },
        ],
    },
    {
        id: 'consistency',
        title: '5. Consistency Check',
        icon: CheckCircle,
        content: [
            'Una volta completati tutti i capitoli, puoi eseguire un Consistency Check per verificare la coerenza del libro.',
        ],
        subsections: [
            {
                title: 'Cosa Verifica',
                steps: [
                    '📖 Coerenza Narrativa: flusso logico tra i capitoli',
                    '✍️ Coerenza di Stile: uniformità del tono e della scrittura',
                    '🔗 Coerenza dei Contenuti: personaggi, termini, numeri consistenti',
                    '💯 Punteggio Generale: score da 0 a 100',
                ],
            },
            {
                title: 'Report',
                steps: [
                    'Issues rilevati con severità (alta, media, bassa)',
                    'Suggerimenti per migliorare la coerenza',
                    'Raccomandazioni specifiche per capitolo',
                    'Il report rimane visibile per riferimento futuro',
                ],
            },
            {
                title: 'Stati del Pulsante',
                steps: [
                    '🟣 Viola: primo check, nessun report esistente',
                    '🟢 Verde: report esistente e aggiornato, puoi rigenerarlo',
                    '🟠 Arancione: contenuto modificato, report obsoleto - rigenera consigliato',
                ],
            },
        ],
    },
    {
        id: 'export',
        title: '6. Esportare il Libro',
        icon: Download,
        content: [
            'Una volta soddisfatto del libro, vai al tab "Esporta" per scaricare il manoscritto completo.',
        ],
        subsections: [
            {
                title: 'Formato di Esportazione',
                steps: [
                    'Formato DOCX (Microsoft Word)',
                    'Include titolo, sottotitolo e informazioni autore',
                    'Tutti i capitoli formattati correttamente',
                    'Pronto per la revisione finale o pubblicazione',
                ],
            },
            {
                title: 'Requisiti',
                steps: [
                    'Tutti i capitoli devono essere generati',
                    'Il pulsante "Esporta" si abilita automaticamente quando tutto è pronto',
                ],
            },
        ],
    },
    {
        id: 'tips',
        title: 'Suggerimenti e Best Practices',
        icon: Sparkles,
        content: [
            'Ecco alcuni consigli per ottenere i migliori risultati:',
        ],
        subsections: [
            {
                title: 'Prima della Generazione',
                steps: [
                    '✅ Compila tutte le informazioni del progetto con dettagli specifici',
                    '✅ Prenditi tempo per configurare bene le AI Settings',
                    '✅ Rivedi l\'outline prima di iniziare a generare i capitoli',
                    '✅ Se non sei soddisfatto dell\'outline, rigeneralo con impostazioni diverse',
                ],
            },
            {
                title: 'Durante la Generazione',
                steps: [
                    '✅ Genera i capitoli in ordine sequenziale',
                    '✅ Leggi ogni capitolo dopo la generazione',
                    '✅ Se un capitolo non ti convince, rigeneralo subito',
                    '✅ Puoi fare piccole modifiche manuali se necessario',
                ],
            },
            {
                title: 'Scelta del Modello AI',
                steps: [
                    '🚀 GPT-4o-mini: veloce ed economico, ottimo per la maggior parte dei casi',
                    '⚡ GPT-4o: bilanciamento tra qualità e velocità',
                    '💎 GPT-4-turbo: massima qualità, più lento e costoso',
                ],
            },
            {
                title: 'Target Words vs Max Tokens',
                steps: [
                    'Target Words: obiettivo suggerito all\'AI (soft target)',
                    'Max Tokens: limite tecnico massimo (hard limit)',
                    'Raccomandazione: Max Tokens ≈ Target Words × 1.5',
                    'Esempio: 2000 parole → 4000 max tokens',
                ],
            },
        ],
    },
];

export default function IstruzioniPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['introduzione']);

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id)
                ? prev.filter(sectionId => sectionId !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <PageContainer
                title="Istruzioni"
                description="Guida completa all'utilizzo della piattaforma Ghost Writing AI"
            >
                <div className="max-w-4xl mx-auto space-y-4">
                    {instructions.map((section) => {
                        const isExpanded = expandedSections.includes(section.id);
                        const Icon = section.icon;

                        return (
                            <Card key={section.id}>
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-start gap-3 text-left"
                                >
                                    <Icon className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {section.title}
                                            </h2>
                                            {isExpanded ? (
                                                <ChevronDown className="text-gray-400" size={20} />
                                            ) : (
                                                <ChevronRight className="text-gray-400" size={20} />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 ml-9 space-y-4">
                                        {section.content.map((paragraph, idx) => (
                                            <p key={idx} className="text-gray-700 leading-relaxed">
                                                {paragraph}
                                            </p>
                                        ))}

                                        {section.subsections && (
                                            <div className="space-y-6 mt-6">
                                                {section.subsections.map((subsection, subIdx) => (
                                                    <div key={subIdx}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            {subsection.title}
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {subsection.steps.map((step, stepIdx) => (
                                                                <li key={stepIdx} className="flex gap-3 text-gray-700">
                                                                    <span className="text-blue-600 text-xl leading-6 flex-shrink-0">•</span>
                                                                    <span className="leading-6 flex-1">{step}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {/* Footer con supporto */}
                    <Card>
                        <div className="text-center py-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Hai bisogno di aiuto?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Se hai domande o problemi, contatta il supporto tecnico.
                            </p>
                            <a
                                href="mailto:support@ghostwriting.ai"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span>Contatta il Supporto</span>
                            </a>
                        </div>
                    </Card>
                </div>
            </PageContainer>
        </div>
    );
}
