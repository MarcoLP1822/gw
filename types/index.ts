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
  styleGuide: StyleGuide | null;
  masterContext: MasterContext;
  chapters: {
    previous: string | null;         // Full text ultimo capitolo
    beforePrevious: string | null;   // Summary penultimo
    first: string | null;            // Key points primo capitolo
  };
  currentChapterInfo: OutlineChapter;
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
// AI CONFIGURATION - Technical Parameters Only
// ============================================================

export type AIModel = 'gpt-5-mini-2025-08-07' | 'gpt-4o' | 'gpt-4-turbo';

export interface ProjectAIConfig {
  id: string;
  projectId: string;

  // Technical AI Parameters
  model: AIModel;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;

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

