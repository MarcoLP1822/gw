export interface Project {
  id: string;
  title: string;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  dueDate?: string;
  wordCount: number;
  client?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PROJECT FORM DATA (dal NewProjectModal)
// ============================================================

export interface ProjectFormData {
  // Informazioni Cliente/Autore
  authorName: string;
  authorRole: string; // es. "Imprenditore", "CEO", "YouTuber"
  company: string;
  industry: string;

  // Informazioni Progetto
  bookTitle: string;
  bookSubtitle?: string;
  targetAudience?: string; // Alias per targetReaders (per compatibilità)
  targetReaders: string;

  // Struttura Narrativa (Hero's Journey Business)
  currentSituation: string; // Mondo ordinario
  challengeFaced: string; // La chiamata/problema
  transformation: string; // Il viaggio/trasformazione
  achievement: string; // Il risultato/vittoria
  lessonLearned: string; // La lezione/messaggio

  // Dettagli Business
  businessGoals: string;
  uniqueValue: string; // Proposta di valore unica dell'autore

  // Informazioni Tecniche
  estimatedPages?: number;

  // Note
  additionalNotes?: string;
}

// ============================================================
// AI GENERATED OUTLINE
// ============================================================

export interface OutlineChapter {
  number: number;
  title: string;
  description: string;
  keyPoints: string[];
  heroJourneyPhase: string;
}

export interface GeneratedOutline {
  title: string;
  subtitle: string;
  description: string;
  chapters: OutlineChapter[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  assignee?: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'outline' | 'notes';
  content: string;
  order: number;
}

// ============================================================
// CHAPTER GENERATION
// ============================================================

export interface ChapterMetadata {
  newCharacters: string[];     // ["Mario Rossi (CEO)", "Laura (co-founder)"]
  newTerms: Record<string, string>;  // { "MVP": "Minimum Viable Product" }
  keyNumbers: Record<string, string>; // { "employees": "50", "revenue": "5M€" }
}

export interface GeneratedChapter {
  content: string;              // Markdown content del capitolo
  metadata: ChapterMetadata;    // Metadata estratti
  summary?: string;             // Summary del capitolo (500 parole)
  keyPoints?: string[];         // 3-5 punti chiave
}

// Chapter Versioning (from Prisma)
// Note: Chapter model uses these fields for single-level undo:
// - previousContent: string | null       // Backup of content before last edit
// - lastModifiedBy: 'user' | 'ai' | 'system'  // Who made the last modification
// - previousContentSavedAt: Date | null  // When previousContent was saved

export type ChapterModifiedBy = 'user' | 'ai' | 'system';

export interface MasterContext {
  characters: string[];         // Tutti i personaggi introdotti finora
  terms: Record<string, string>;       // Glossario termini
  numbers: Record<string, string>;     // Numeri/metriche stabiliti
  themes: Record<string, number>;      // Tema: progresso % (0-100)
}

export interface StyleGuide {
  tone: string;                 // "ispirazionale", "pragmatico", etc.
  pov: string;                  // "Prima persona singolare"
  tense: string;                // "Presente e passato prossimo"
  sentenceLength: string;       // "Brevi-medie (15-25 parole)"
  paragraphStructure: string;   // "3-5 frasi per paragrafo"
  vocabularyLevel: string;      // "Business accessible"
  storytelling: string[];       // Pattern narrativi
  recurringPhrases: string[];   // Frasi ricorrenti
  metaphors: string[];          // Metafore usate
}

export interface ChapterContext {
  project: ProjectFormData;
  outline: GeneratedOutline;
  styleGuide: StyleGuide | string | null;  // Support both structured and text-based style guides
  masterContext: MasterContext;
  chapters: {
    previous: string | null;         // Full text ultimo capitolo
    beforePrevious: string | null;   // Summary penultimo
    first: string | null;            // Key points primo capitolo
  };
  currentChapterInfo: OutlineChapter;
  aiConfig: {
    targetWordsPerChapter: number;
  };
}

// ============================================================
// CONSISTENCY CHECK
// ============================================================

export interface ConsistencyIssue {
  type: 'contradiction' | 'repetition' | 'style_shift' | 'tone_change' | 'factual_error';
  severity: 'high' | 'medium' | 'low';
  chapter?: number;                   // Capitolo dove si verifica
  description: string;
  suggestion: string;
}

export interface QuickCheckResult {
  hasCriticalIssues: boolean;
  issues: ConsistencyIssue[];
}

export interface ConsistencyReport {
  overallScore: number;               // 0-100
  narrative: {
    score: number;
    issues: ConsistencyIssue[];
  };
  style: {
    score: number;
    issues: ConsistencyIssue[];
  };
  consistency: {
    score: number;
    issues: ConsistencyIssue[];
  };
  recommendations: string[];
  createdAt?: Date;
}

// ============================================================
// SUGGESTION APPLY
// ============================================================

export interface DiffChange {
  type: 'deletion' | 'replacement' | 'addition';
  targetText: string;          // Testo originale da modificare
  newText?: string;            // Nuovo testo (se replacement/addition)
  lineStart: number;           // Riga di inizio (per UI scroll)
  lineEnd: number;             // Riga di fine
  reasoning: string;           // Breve spiegazione della modifica
}

export interface ApplySuggestionResult {
  success: boolean;
  diff?: {
    chapterNumber: number;
    oldContent: string;
    newContent: string;
    changes: DiffChange[];
    estimatedCost: number;     // USD per la chiamata AI
    wordsChanged: number;
    percentageChanged: number;
  };
  chapter?: any;               // Se applied (preview=false)
  error?: string;
}

export interface SuggestionApplyRequest {
  issue: ConsistencyIssue;     // Issue dal consistency report
  chapterNumber: number;       // Capitolo da modificare
  preview: boolean;            // true = solo diff, false = apply
}

// ============================================================
// AI CONFIGURATION - Technical Parameters Only
// ============================================================

export type AIModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';

export interface ProjectAIConfig {
  id: string;
  projectId: string;

  // Technical AI Parameters
  model: AIModel;

  // GPT-5 Parameters (Reasoning & Verbosity)
  reasoningEffort: ReasoningEffort;
  verbosity: Verbosity;
  maxTokens: number;

  // Legacy parameters (non usati da GPT-5, mantenuti per compatibilità)
  temperature?: number | null;
  topP?: number | null;
  frequencyPenalty?: number | null;
  presencePenalty?: number | null;

  // Chapter Generation Settings
  targetWordsPerChapter: number;

  // Custom Prompts
  useCustomPrompts: boolean;
  customSystemPrompt?: string;
  customOutlineInstructions?: string;
  customChapterInstructions?: string;

  // Testing
  lastTestAt?: Date;
  testOutput?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface AIConfigFormData {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  targetWordsPerChapter?: number;

  useCustomPrompts?: boolean;
  customSystemPrompt?: string;
  customOutlineInstructions?: string;
  customChapterInstructions?: string;
}

