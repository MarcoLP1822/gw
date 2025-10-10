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

