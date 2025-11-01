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
    ChevronRight,
    Activity,
    Users,
    BarChart3,
    Bell,
    Zap,
    Target,
    TrendingUp,
    ArrowRight,
    Clock,
    DollarSign
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
            'Versione 3.3.2 - Sistema completo di generazione AI con controlli avanzati di qualità, coerenza e UI/UX ottimizzata.',
        ],
    },
    {
        id: 'dashboard',
        title: '1. Dashboard e Attività Recente',
        icon: Activity,
        content: [
            'La Dashboard ti offre una panoramica completa della tua attività sulla piattaforma.',
        ],
        subsections: [
            {
                title: 'Statistiche Dashboard',
                steps: [
                    '📊 Progetti Attivi: numero di progetti in lavorazione',
                    '👥 Totale Utenti: utenti registrati nella piattaforma',
                    '⏰ In Scadenza: progetti con deadline imminente',
                    '✅ Completati Questo Mese: progetti finiti nel mese corrente',
                ],
            },
            {
                title: 'Attività Recente - Tipi di Attività',
                steps: [
                    '🟣 Nuovo progetto creato: quando crei un nuovo progetto (entro 24h)',
                    '🟣 Progetto in bozza: progetto salvato ma non ancora iniziato',
                    '🔵 Generazione outline in corso: AI sta creando l\'outline',
                    '🔵 Generazione capitoli in corso: AI sta scrivendo i capitoli',
                    '🟢 Progetto completato: tutti i capitoli sono stati generati',
                    '⚪ Errore nella generazione: si è verificato un problema',
                    '🟣 Progetto aggiornato: modifiche generiche al progetto',
                ],
            },
            {
                title: 'Log di Generazione AI',
                steps: [
                    '🔵 outline - Completato: outline generato con successo',
                    '🔵 chapter_1 - Completato: capitolo scritto con successo',
                    '🔵 chapter_2 - Completato: e così via per ogni capitolo',
                    '🔵 consistency_check - Completato: verifica coerenza eseguita',
                    '🔵 [step] - Errore: fallimento con messaggio di errore',
                ],
            },
            {
                title: 'Come Funziona',
                steps: [
                    'Combina attività sui progetti e log AI',
                    'Mostra le ultime 10 attività totali',
                    'Ordinate dalla più recente alla più vecchia',
                    'Include titolo libro, autore e timestamp relativo',
                    'Click su un\'attività per vedere i dettagli del progetto',
                ],
            },
            {
                title: 'Codifica Colori Pallini',
                steps: [
                    '🟢 Verde: progetto completato',
                    '🔵 Blu: generazione AI in corso o completata',
                    '🟣 Viola: aggiornamento o modifica progetto',
                    '⚪ Grigio: stato generico o errore',
                ],
            },
        ],
    },
    {
        id: 'nuovo-progetto',
        title: '2. Creare un Nuovo Progetto',
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
        id: 'gestione-progetti',
        title: '3. Gestire i Progetti',
        icon: FileText,
        content: [
            'La vista Progetti offre potenti strumenti di ricerca, filtraggio e organizzazione.',
        ],
        subsections: [
            {
                title: 'Filtri Disponibili',
                steps: [
                    '🔍 Cerca: filtra per titolo libro, autore o azienda',
                    '📅 Data Creazione: mostra progetti da una data specifica',
                    '🏷️ Stato: filtra per Bozza, Generando Outline, Generando Capitoli, Completato, Errore',
                    '🔄 Pulsanti: "Filtra" per applicare, "Annulla filtro" per resettare',
                ],
            },
            {
                title: 'Colonne Ordinabili',
                steps: [
                    '📚 Titolo Libro: ordina alfabeticamente (A-Z o Z-A)',
                    '👤 Autore: ordina per nome autore',
                    '🏢 Azienda: ordina per nome azienda',
                    '🏭 Settore: ordina per industria',
                    '🔖 Status: ordina per stato progetto',
                    '📖 Capitoli: ordina per numero capitoli generati',
                    '📅 Data Creazione: ordina per data (più recente/vecchio)',
                    '⬆️⬇️ Click sulla colonna per ordinare, riclicca per invertire',
                ],
            },
            {
                title: 'Azioni Disponibili',
                steps: [
                    '✏️ Modifica: modifica le informazioni del progetto',
                    '🗑️ Elimina: rimuovi progetto (richiede conferma)',
                    '👁️ Visualizza: click sulla riga per aprire dettaglio',
                    '📊 Counter: vedi il numero totale di progetti filtrati',
                ],
            },
            {
                title: 'Design Tabella',
                steps: [
                    'Righe alternate (bianco/blu) per migliore leggibilità',
                    'Header sticky che rimane visibile durante scroll',
                    'Hover effect sulle righe per feedback visivo',
                    'Badge colorati per stati e conteggi',
                    'Layout responsive per tutti i dispositivi',
                ],
            },
        ],
    },
    {
        id: 'ai-settings',
        title: '4. Configurare le Impostazioni AI',
        icon: Settings,
        content: [
            'Prima di generare l\'outline, configura come l\'AI scriverà il tuo libro nella sezione "AI Settings".',
            'Puoi scegliere tra modalità semplice (preset predefiniti) o avanzata (controllo totale su 27 parametri).',
        ],
        subsections: [
            {
                title: 'Modalità Semplice (Consigliata)',
                steps: [
                    '📊 Target Audience: scegli il pubblico (professionisti, imprenditori, pubblico generale, studenti, bambini, ecc.)',
                    '🎯 Obiettivo del Libro: personal branding, lead generation, insegnamento, ispirazione, educazione',
                    '✨ Stile di Scrittura: scegli tra 8 preset predefiniti (storytelling, didattico, professionale, ispirazionale, ecc.)',
                    '📏 Lunghezza Capitoli: conciso (~1000 parole), standard (~2000), dettagliato (~3000), approfondito (~5000)',
                    '🎨 Tono e Stile: formale/informale, serio/leggero, tecnico/divulgativo',
                    '📖 Narrative Voice: prima persona, terza persona, misto',
                    '🔬 Complessità: semplice, moderato, avanzato, esperto',
                ],
            },
            {
                title: 'Modalità Avanzata (Opzionale)',
                steps: [
                    'Modello AI: GPT-5-mini-2025-08-07 (bilanciato qualità/velocità/costo)',
                    'Reasoning Effort: minimal/low/medium/high - controlla la profondità del ragionamento AI',
                    'Verbosity: low/medium/high - lunghezza e dettaglio delle risposte',
                    'Max Output Tokens: limite massimo per capitolo (default 20000, max 128000)',
                    'Target Words: parole obiettivo per capitolo (default 2000-5000)',
                    'Custom Prompts: sostituisci le istruzioni predefinite (per utenti esperti)',
                    '💡 Tooltip: ogni parametro ha un tooltip esplicativo, basta passarci sopra con il mouse',
                    '⚠️ Nota: GPT-5 non usa temperature, top_p, o penalty - usa Reasoning Effort invece',
                ],
            },
            {
                title: 'Test delle Impostazioni',
                steps: [
                    'Usa il pulsante "Test" per vedere un esempio di generazione',
                    'Prova diverse combinazioni prima di salvare',
                    'Le modifiche si applicano solo ai capitoli generati dopo il salvataggio',
                    'I capitoli già scritti mantengono le impostazioni originali',
                ],
            },
        ],
    },
    {
        id: 'outline',
        title: '5. Generare l\'Outline',
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
        title: '6. Generare i Capitoli',
        icon: FileText,
        content: [
            'Dopo aver generato l\'outline, puoi iniziare a generare i capitoli.',
            'I capitoli vengono scritti considerando tutto il contesto precedente per massima coerenza.',
        ],
        subsections: [
            {
                title: 'Generazione Singola',
                steps: [
                    'Clicca su "Genera" sul primo capitolo disponibile',
                    'L\'AI scrive il capitolo considerando outline + capitoli precedenti',
                    'Style Guide automatico estratto dopo i primi 2 capitoli',
                    'Master Context aggiornato con personaggi, termini e numeri',
                    'Mini Consistency Check incrementale dopo ogni capitolo',
                    'Tempo: ~30-45 secondi per capitolo',
                ],
            },
            {
                title: 'Generazione Batch (Novità 2.2.0)',
                steps: [
                    '🚀 "Genera Prossimi 3": genera automaticamente i prossimi 3 capitoli in sequenza',
                    '⚡ "Genera Tutti": completa l\'intero libro automaticamente',
                    '📊 Progress bar in tempo reale durante la generazione batch',
                    '⏸️ Puoi interrompere in qualsiasi momento',
                    '✅ Notifiche toast per ogni capitolo completato',
                    '⚠️ In caso di errore, la batch si ferma al capitolo problematico',
                ],
            },
            {
                title: 'Modifica e Rigenerazione',
                steps: [
                    '✏️ Modifica: clicca su "Modifica" per editare manualmente il contenuto',
                    '♻️ Rigenera: clicca su "Rigenera" per far riscrivere il capitolo dall\'AI',
                    '⚠️ Nota: modificare o rigenerare un capitolo invalida il Consistency Check',
                    '💡 Tip: usa la modifica per piccole correzioni, rigenera per cambi sostanziali',
                ],
            },
            {
                title: 'Stati dei Capitoli',
                steps: [
                    '⚪ Non Generato: capitolo ancora da scrivere',
                    '🔵 Generando: AI sta scrivendo il capitolo',
                    '✅ Completato: capitolo pronto e salvato',
                    '⚠️ Modificato: contenuto editato manualmente',
                    '🔄 Rigenerando: AI sta riscrivendo il capitolo',
                ],
            },
        ],
    },
    {
        id: 'consistency',
        title: '7. Consistency Check - Tab Dedicato',
        icon: CheckCircle,
        content: [
            'Una volta completati tutti i capitoli, vai al tab "Consistency" per verificare la coerenza del libro.',
            'Il tab dedicato offre una visualizzazione chiara e professionale del report di qualità.',
        ],
        subsections: [
            {
                title: 'Cosa Verifica',
                steps: [
                    '📖 Coerenza Narrativa: flusso logico tra i capitoli (score 0-100)',
                    '✍️ Coerenza di Stile: uniformità del tono e della scrittura (score 0-100)',
                    '🔗 Coerenza Fattuale: personaggi, termini, numeri consistenti (score 0-100)',
                    '💯 Punteggio Generale: media pesata delle 3 dimensioni',
                    '🎯 Reasoning Effort: "medium" per accuracy bilanciata e costi ottimizzati',
                ],
            },
            {
                title: 'UI del Tab Consistency',
                steps: [
                    '🎨 Grande badge circolare con score totale (es: 85/100)',
                    '📊 3 card colorate per ogni dimensione (narrativa: blu, stile: viola, fattuale: verde)',
                    '🔍 Lista dettagliata delle criticità con badge di severità',
                    '⚠️ Warning badge per report obsoleti (capitoli modificati dopo il check)',
                    'ℹ️ Info card che spiega come funziona il consistency check',
                    '🔄 Pulsante "Genera" o "Rigenera" secondo lo stato',
                ],
            },
            {
                title: 'Report Dettagliato',
                steps: [
                    'Criticità organizzate per severità (🔴 Alta, 🟡 Media, 🟢 Bassa)',
                    'Capitoli coinvolti per ogni issue rilevata',
                    'Descrizione dettagliata del problema',
                    'Suggerimenti specifici per risolverlo',
                    'Raccomandazioni generali per migliorare la qualità',
                ],
            },
            {
                title: 'Stati del Report',
                steps: [
                    '🟣 Nessun Report: primo check da eseguire',
                    '🟢 Report Aggiornato: check valido, può essere rigenerato',
                    '� Report Obsoleto: capitoli modificati, check consigliato',
                    '⚪ Generazione Disabilitata: non tutti i capitoli sono completi',
                ],
            },
            {
                title: 'Parametri Ottimizzati',
                steps: [
                    'Reasoning Effort: "medium" (bilanciamento accuracy/costo)',
                    'Max Output Tokens: 4000 (sufficiente per analisi dettagliata)',
                    'Usa getReasoningEffortForTask() per coerenza con outline',
                    'Costo stimato: ~$0.02-0.03 per check completo',
                ],
            },
        ],
    },
    {
        id: 'export',
        title: '8. Esportare il Libro',
        icon: Download,
        content: [
            'Una volta soddisfatto del libro, vai al tab "Esporta" per scaricare il manoscritto completo.',
            'L\'export è completamente gratuito e avviene client-side in 2-3 secondi.',
        ],
        subsections: [
            {
                title: 'Formato di Esportazione',
                steps: [
                    'Formato DOCX (Microsoft Word) professionale',
                    'Cover page con titolo, sottotitolo, autore e azienda',
                    'Copyright page con anno automatico',
                    'Table of Contents (indice) con hyperlink',
                    'Tutti i capitoli formattati con heading styles',
                    'Sezione biografia autore',
                    'Margini: 1 inch su tutti i lati',
                    'Font: Calibri 12pt, testo giustificato',
                    'Numerazione pagine automatica',
                ],
            },
            {
                title: 'Statistiche Export',
                steps: [
                    '📚 Numero capitoli inclusi',
                    '📝 Conteggio parole totali',
                    '📄 Pagine stimate (250 parole/pagina)',
                    '🎯 File scaricato: titolo-libro-YYYYMMDD.docx',
                ],
            },
            {
                title: 'Requisiti',
                steps: [
                    'Tutti i capitoli devono essere generati',
                    'Il pulsante "Esporta" si abilita automaticamente quando tutto è pronto',
                    'Puoi esportare infinite volte (gratuito)',
                    'Ogni export riflette lo stato attuale dei capitoli',
                ],
            },
        ],
    },
    {
        id: 'clienti',
        title: '9. Gestione Clienti',
        icon: Users,
        content: [
            'La sezione Clienti ti permette di gestire i tuoi clienti e tracciare i loro progetti.',
        ],
        subsections: [
            {
                title: 'Vista Clienti',
                steps: [
                    '📋 Tabella completa con tutti i clienti',
                    '🔍 Ricerca per nome, email o telefono',
                    '📅 Filtro per data di registrazione',
                    '🏷️ Filtro per stato (Attivo/Inattivo)',
                    '📊 Contatori progetti attivi e completati',
                ],
            },
            {
                title: 'Informazioni Cliente',
                steps: [
                    'Nome e dati di contatto',
                    'Data di registrazione',
                    'Numero progetti attivi',
                    'Numero progetti completati',
                    'Stato account (Attivo/Inattivo)',
                ],
            },
            {
                title: 'Funzionalità',
                steps: [
                    '👁️ Visualizza: click sulla riga per dettagli cliente',
                    '📧 Email: link rapido per contattare',
                    '🔢 Badge colorati per progetti attivi (blu) e completati (verde)',
                    '📊 Ordinamento per colonne',
                ],
            },
        ],
    },
    {
        id: 'analytics',
        title: '10. Analytics Avanzata',
        icon: BarChart3,
        content: [
            'La sezione Analytics offre metriche dettagliate sull\'utilizzo della piattaforma.',
        ],
        subsections: [
            {
                title: 'Metriche Disponibili',
                steps: [
                    '📊 Progetti per Stato: distribuzione progetti (bozza, in corso, completati)',
                    '📈 Trend Mensili: evoluzione progetti nel tempo',
                    '📚 Top Progetti: classifiche per numero capitoli o parole',
                    '💰 Costi AI: tracking spese generazione',
                    '⏱️ Tempi Medi: statistiche velocità generazione',
                ],
            },
            {
                title: 'Grafici e Visualizzazioni',
                steps: [
                    'Grafici a barre per distribuzione stati',
                    'Grafici a linee per trend temporali',
                    'Tabelle top 10 progetti',
                    'Card statistiche in tempo reale',
                    'Export dati in formato CSV (futuro)',
                ],
            },
        ],
    },
    {
        id: 'notifiche',
        title: '11. Sistema di Notifiche Toast',
        icon: Bell,
        content: [
            'La piattaforma utilizza un sistema di toast notifications moderno per feedback immediato.',
            'Le notifiche sono non-invasive e appaiono in alto a destra dello schermo.',
        ],
        subsections: [
            {
                title: 'Tipi di Notifiche',
                steps: [
                    '✅ Successo: operazioni completate (verde)',
                    '❌ Errore: problemi o fallimenti (rosso)',
                    'ℹ️ Info: informazioni generali (blu)',
                    '⚠️ Warning: avvisi importanti (giallo)',
                    '⏳ Loading: operazioni in corso (grigio animato)',
                ],
            },
            {
                title: 'Comportamento',
                steps: [
                    'Appaiono in alto a destra (non bloccanti)',
                    'Auto-dismiss dopo 5 secondi (configurabile)',
                    'Click per chiudere manualmente',
                    'Stack verticale per notifiche multiple',
                    'Animazioni smooth (fade in/out)',
                    'Accessibili da tastiera (ARIA)',
                ],
            },
            {
                title: 'Quando Appaiono',
                steps: [
                    'Dopo creazione/modifica/eliminazione progetto',
                    'Durante generazione outline/capitoli',
                    'Al completamento operazioni lunghe',
                    'In caso di errori o problemi di rete',
                    'Per conferme di salvataggio',
                    'Durante batch generation (ogni capitolo completato)',
                ],
            },
        ],
    },
    {
        id: 'tips',
        title: '12. Miglioramenti UX - Skeleton Loaders & Tooltips',
        icon: Sparkles,
        content: [
            'La piattaforma include miglioramenti UX moderni per un\'esperienza utente ottimale.',
        ],
        subsections: [
            {
                title: 'Skeleton Loaders (Caricamento Intelligente)',
                steps: [
                    '💀 15 componenti skeleton riutilizzabili',
                    '⚡ Animazione shimmer CSS-only (no bundle cost)',
                    '📱 Utilizzati durante caricamento progetti, capitoli, analytics',
                    '🎯 Migliorano perceived performance',
                    '✨ Transizione smooth da skeleton a contenuto reale',
                ],
            },
            {
                title: 'Tooltip System (Aiuto Contestuale)',
                steps: [
                    'ℹ️ Tooltip su tutti i parametri AI complessi',
                    '♿ Accessibile WCAG 2.1 AA (Radix UI)',
                    '⌨️ Navigabile da tastiera',
                    '🎨 Design coerente con la piattaforma',
                    '📝 12+ tooltip pre-configurati su AI Settings',
                    '💡 Hover o focus per vedere le spiegazioni',
                ],
            },
            {
                title: 'Workflow Stepper (Guida Visuale)',
                steps: [
                    '📊 Barra di progresso a 6 step nella pagina progetto',
                    '✅ Mostra lo step corrente e quelli completati',
                    '🎯 Aiuta a capire a che punto sei nel processo',
                    '📱 Responsive: versione compatta su mobile',
                    '🔄 Aggiornamento automatico basato sullo stato progetto',
                    'ℹ️ Nota: può essere disabilitato se non necessario',
                ],
            },
        ],
    },
    {
        id: 'best-practices',
        title: '13. Suggerimenti e Best Practices',
        icon: Target,
        content: [
            'Ecco alcuni consigli per ottenere i migliori risultati:',
        ],
        subsections: [
            {
                title: 'Prima della Generazione',
                steps: [
                    '✅ Compila tutte le informazioni del progetto con dettagli specifici',
                    '✅ Prenditi tempo per configurare bene le AI Settings',
                    '✅ Usa il pulsante "Test" nelle AI Settings per vedere esempi',
                    '✅ Rivedi l\'outline prima di iniziare a generare i capitoli',
                    '✅ Se non sei soddisfatto dell\'outline, rigeneralo con impostazioni diverse',
                ],
            },
            {
                title: 'Durante la Generazione',
                steps: [
                    '✅ Segui il Workflow Stepper per sapere a che punto sei (se abilitato)',
                    '✅ Genera i capitoli in ordine sequenziale',
                    '🚀 Usa "Genera Prossimi 3" o "Genera Tutti" per velocizzare',
                    '✅ Leggi ogni capitolo dopo la generazione',
                    '✅ Se un capitolo non ti convince, rigeneralo subito',
                    '✅ Puoi fare piccole modifiche manuali se necessario',
                    '✅ Le notifiche toast ti terranno aggiornato sul progresso',
                    '⏸️ Puoi interrompere la batch generation in qualsiasi momento',
                ],
            },
            {
                title: 'Gestione Progetti',
                steps: [
                    '🔍 Usa i filtri per trovare rapidamente i progetti',
                    '📊 Ordina le colonne per organizzare la vista',
                    '✏️ Modifica i progetti per aggiornare informazioni',
                    '👁️ Monitora lo stato nella lista progetti',
                    '📈 Controlla l\'Analytics per vedere i trend',
                    '📱 Layout responsive ottimizzato per mobile',
                    '🎨 Card progetti con design migliorato e info chiare',
                ],
            },
            {
                title: 'Modello AI e Parametri',
                steps: [
                    '🚀 GPT-5-mini (2025-08-07): veloce, economico e di alta qualità',
                    'Ottimizzato per generazione di contenuti lunghi e coerenti',
                    'Utilizzato per outline, capitoli e consistency check',
                    'Costo stimato: ~$0.12-0.18 per libro completo (10-15 capitoli)',
                    'Reasoning Effort "medium" per accuracy bilanciata',
                    '💡 Tip: altri modelli saranno disponibili in futuro per più opzioni',
                ],
            },
            {
                title: 'Target Words vs Max Tokens',
                steps: [
                    'Target Words: obiettivo suggerito all\'AI (soft target)',
                    'Max Tokens: limite tecnico massimo (hard limit)',
                    'Raccomandazione: Max Tokens ≈ Target Words × 1.5-2.0',
                    'Esempio: 2000 parole → 3000-4000 max tokens',
                    'Più tokens = più libertà all\'AI ma costo maggiore',
                ],
            },
            {
                title: 'Workflow Ottimizzato - Le 6 Fasi',
                steps: [
                    '1️⃣ Nuovo Progetto: crea e compila informazioni base (2-3 minuti)',
                    '2️⃣ AI Settings: configura parametri di generazione (1-2 minuti)',
                    '3️⃣ Genera Outline: crea la struttura del libro (~20 secondi)',
                    '4️⃣ Genera Capitoli: usa batch generation per velocità (~5-10 minuti totali)',
                    '5️⃣ Check Coerenza: verifica consistenza nel tab dedicato (~30 secondi)',
                    '6️⃣ Esporta: scarica il manoscritto completo (2-3 secondi, gratuito)',
                    '⏱️ Tempo totale stimato: 10-15 minuti per un libro completo',
                ],
            },
            {
                title: 'Gestione Errori e Recovery',
                steps: [
                    '🔄 Batch generation interrompibile: puoi fermare e riprendere',
                    '📝 Capitoli salvati automaticamente: nessuna perdita di dati',
                    '⚠️ Notifiche chiare in caso di errori',
                    '🔁 Rigenerazione illimitata: puoi sempre rifare outline/capitoli',
                    '💾 Auto-save su tutte le modifiche manuali',
                ],
            },
        ],
    },
];

export default function IstruzioniPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (id: string) => {
        const isCurrentlyExpanded = expandedSections.includes(id);

        setExpandedSections(prev =>
            prev.includes(id)
                ? [] // Chiudi la sezione se è già aperta
                : [id] // Apri solo questa sezione (chiudendo tutte le altre)
        );

        // Scroll alla card dopo un breve delay per permettere l'animazione
        if (!isCurrentlyExpanded) {
            setTimeout(() => {
                const element = document.getElementById(`section-${id}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 100);
        }
    };

    // Quick stats per hero section
    const quickStats = [
        { icon: Clock, label: 'Tempo Medio', value: '10-15 min', color: 'text-blue-600 bg-blue-100' },
        { icon: DollarSign, label: 'Costo per Libro', value: '~$0.15', color: 'text-green-600 bg-green-100' },
        { icon: FileText, label: 'Capitoli', value: '10-15', color: 'text-purple-600 bg-purple-100' },
        { icon: Zap, label: 'AI Powered', value: 'GPT-5', color: 'text-orange-600 bg-orange-100' },
    ];

    // Quick start steps
    const quickStartSteps = [
        { number: 1, icon: FileText, title: 'Crea Progetto', desc: 'Compila il form con le tue informazioni' },
        { number: 2, icon: Settings, title: 'Configura AI', desc: 'Scegli stile e parametri' },
        { number: 3, icon: Sparkles, title: 'Genera Outline', desc: 'L\'AI crea la struttura' },
        { number: 4, icon: BookOpen, title: 'Scrivi Capitoli', desc: 'Generazione sequenziale' },
        { number: 5, icon: CheckCircle, title: 'Check Coerenza', desc: 'Verifica qualità' },
        { number: 6, icon: Download, title: 'Esporta', desc: 'Scarica il libro completo' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <PageContainer
                title="Istruzioni"
                description="Guida completa all'utilizzo della piattaforma Ghost Writing AI"
                onMenuClick={() => setMobileMenuOpen(true)}
            >
                <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                    {/* Hero Section */}
                    <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                        <div className="text-center py-8 sm:py-12 px-4">
                            <BookOpen className="mx-auto mb-4" size={48} />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Benvenuto su Ghost Writing AI</h1>
                            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Crea libri professionali in pochi minuti con l&apos;intelligenza artificiale.<br />
                                Dall&apos;idea al manoscritto completo, tutto in un&apos;unica piattaforma.
                            </p>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                                {quickStats.map((stat, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                                        <stat.icon className="mx-auto mb-2" size={32} />
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-sm text-blue-100">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Quick Start Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="text-yellow-500" size={28} />
                            Quick Start - 6 Passi per il Tuo Libro
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickStartSteps.map((step) => (
                                <Card key={step.number} className="hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                                {step.number}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <step.icon className="text-blue-600" size={20} />
                                                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">{step.desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Target className="text-green-500" size={28} />
                            Funzionalità Principali
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-600 rounded-lg">
                                        <Sparkles className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Generazione AI Avanzata</h3>
                                        <p className="text-sm text-gray-700">
                                            GPT-5-mini con reasoning &quot;medium&quot; per velocità, qualità e costi ottimizzati.
                                            Context window espanso, style guide automatico e batch generation.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-600 rounded-lg">
                                        <Settings className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Controllo Totale</h3>
                                        <p className="text-sm text-gray-700">
                                            Parametri AI configurabili, 8 preset stile, test in tempo reale.
                                            Tooltips su ogni parametro. Modifica manuale sempre disponibile.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-600 rounded-lg">
                                        <CheckCircle className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Qualità Garantita</h3>
                                        <p className="text-sm text-gray-700">
                                            Consistency check con tab dedicato, score 0-100, 3 dimensioni di analisi.
                                            Report dettagliato con severità issues e raccomandazioni specifiche.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-600 rounded-lg">
                                        <TrendingUp className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">UX Moderna</h3>
                                        <p className="text-sm text-gray-700">
                                            Toast notifications, skeleton loaders, tooltips accessibili.
                                            Batch generation, sidebar con evidenziazione sezione attiva, card collassabili.
                                            Design responsive ottimizzato per mobile. Tutto fluido e intuitivo.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Detailed Instructions Accordion */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen className="text-gray-700" size={28} />
                            Guida Dettagliata
                        </h2>
                        <div className="space-y-3">
                            {instructions.map((section) => {
                                const isExpanded = expandedSections.includes(section.id);
                                const Icon = section.icon;

                                return (
                                    <div key={section.id} id={`section-${section.id}`}>
                                        <Card>
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
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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
