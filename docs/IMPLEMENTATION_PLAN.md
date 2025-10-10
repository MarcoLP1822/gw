# 🚀 Piano d'Azione: AI-Powered Book Generation

## 📋 Vision & Obiettivo

Trasformare l'applicazione da **sistema di gestione progetti** a **piattaforma completa di generazione automatica di libri business** tramite AI.

### Workflow Target

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW GENERAZIONE LIBRO                    │
└─────────────────────────────────────────────────────────────────┘

1. INPUT COLLECTION
   ├─ Autore/Ghost Writer compila NewProjectModal
   ├─ 13 campi required + 3 optional
   └─ Output: ProjectFormData (JSON)
        ↓
2. AI OUTLINE GENERATION
   ├─ JSON inviato a AI (GPT-4, Claude, etc.)
   ├─ AI genera struttura completa del libro
   └─ Output: Outline JSON (capitoli, sezioni, topics)
        ↓
3. AI CHAPTER GENERATION
   ├─ Per ogni capitolo dell'outline
   ├─ AI scrive contenuto completo
   ├─ Possibilità di parallelizzazione (più AI)
   └─ Output: Capitoli completi (Markdown/JSON)
        ↓
4. DOCUMENT ASSEMBLY & EXPORT
   ├─ Assembla tutti i capitoli
   ├─ Formattazione e styling
   ├─ Genera DOCX professionale
   └─ Download ready per impaginazione
```

---

## 🎯 Fase 1: Database & Backend (Fondamenta)

### Obiettivo
Creare l'infrastruttura per salvare e gestire i dati dei progetti.

### Tasks

#### 1.1 Database Setup
- **Tech Stack Decision**:
  - ✅ **Prisma ORM** (type-safe, migrations, developer-friendly)
  - ✅ **PostgreSQL** (robusto, production-ready) O **MongoDB** (flessibile per JSON)
  - Alternative: Supabase (Postgres + Auth + Storage integrato)

- **Schema Design**:
  ```prisma
  model User {
    id        String   @id @default(cuid())
    email     String   @unique
    name      String
    role      String   // "ghost_writer" | "admin" | "author"
    projects  Project[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }

  model Project {
    id              String   @id @default(cuid())
    userId          String
    user            User     @relation(fields: [userId], references: [id])
    
    // Form Data (dal NewProjectModal)
    authorName      String
    authorRole      String
    company         String
    industry        String
    bookTitle       String
    bookSubtitle    String?
    targetReaders   String   @db.Text
    
    // Hero's Journey Data
    currentSituation String  @db.Text
    challengeFaced   String  @db.Text
    transformation   String  @db.Text
    achievement      String  @db.Text
    lessonLearned    String  @db.Text
    
    // Business Goals
    businessGoals   String   @db.Text
    uniqueValue     String   @db.Text
    
    // Technical
    estimatedPages  Int?
    additionalNotes String?  @db.Text
    
    // Status & Generation
    status          String   @default("draft") // draft, generating_outline, generating_chapters, completed
    outline         Outline?
    chapters        Chapter[]
    
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
  }

  model Outline {
    id          String   @id @default(cuid())
    projectId   String   @unique
    project     Project  @relation(fields: [projectId], references: [id])
    
    structure   Json     // Struttura JSON dell'outline
    totalChapters Int
    estimatedWords Int
    
    aiModel     String   // "gpt-4", "claude-3", etc.
    generatedAt DateTime @default(now())
    
    chapters    Chapter[]
  }

  model Chapter {
    id          String   @id @default(cuid())
    projectId   String
    project     Project  @relation(fields: [projectId], references: [id])
    outlineId   String?
    outline     Outline? @relation(fields: [outlineId], references: [id])
    
    chapterNumber Int
    title       String
    content     String   @db.Text
    wordCount   Int      @default(0)
    
    status      String   @default("pending") // pending, generating, completed, error
    
    aiModel     String?
    generatedAt DateTime?
    
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@unique([projectId, chapterNumber])
  }

  model GenerationLog {
    id          String   @id @default(cuid())
    projectId   String
    step        String   // "outline", "chapter_1", "chapter_2", etc.
    aiModel     String
    promptTokens Int
    completionTokens Int
    totalTokens Int
    cost        Float?
    duration    Int      // milliseconds
    success     Boolean
    errorMessage String? @db.Text
    createdAt   DateTime @default(now())
  }
  ```

#### 1.2 API Routes (Next.js App Router)
Creare le seguenti API routes:

- **POST /api/projects** - Crea nuovo progetto (salva form data)
- **GET /api/projects** - Lista progetti utente
- **GET /api/projects/[id]** - Dettaglio progetto
- **PUT /api/projects/[id]** - Aggiorna progetto
- **DELETE /api/projects/[id]** - Elimina progetto
- **POST /api/projects/[id]/generate-outline** - Trigger generazione outline
- **POST /api/projects/[id]/generate-chapters** - Trigger generazione capitoli
- **GET /api/projects/[id]/status** - Status real-time della generazione
- **GET /api/projects/[id]/export** - Download DOCX

#### 1.3 Authentication
- **NextAuth.js** setup:
  - Email/Password provider
  - Google OAuth (opzionale)
  - Session management
  - Protected routes middleware
  - Role-based access (admin, ghost_writer, author)

---

## 🤖 Fase 2: AI Integration (Cuore del Sistema)

### Obiettivo
Integrare AI per generazione automatica outline e capitoli.

### Tasks

#### 2.1 AI Provider Selection & Setup

**Opzioni AI Providers**:

| Provider | Pro | Contro | Use Case |
|----------|-----|--------|----------|
| **OpenAI GPT-4** | Migliore qualità, lungo contesto (128k) | Costoso ($0.03/1k input) | Outline + Capitoli complessi |
| **OpenAI GPT-5o-mini** | Economico, veloce | Qualità inferiore | Capitoli semplici, bozze |
| **Anthropic Claude 3.5** | Eccellente per long-form, etico | Meno API features | Generazione capitoli lunghi |
| **Anthropic Claude 3 Haiku** | Velocissimo, economico | Meno creativo | Outline, strutture |
| **Gemini 1.5 Pro** | Context 2M tokens!, economico | Qualità variabile | Progetti con molto contesto |
| **Open Source (Llama 3)** | Gratis (self-hosted) | Infrastruttura complessa | Budget limitato |

**Raccomandazione**:
- ✅ **Outline Generation**: Claude 3.5 Sonnet (migliore per struttura e pianificazione)
- ✅ **Chapter Generation**: GPT-4o (bilanciamento qualità/costo) + Claude 3.5 per capitoli chiave
- ✅ **Fallback**: GPT-mini per iterazioni rapide

#### 2.2 Prompt Engineering & Templates

Creare **prompt templates** ottimizzati per ogni fase:

**A. Outline Generation Prompt**:
```typescript
// lib/prompts/outline-generator.ts

interface OutlinePromptData {
  projectData: ProjectFormData;
  targetLength: number; // in pagine
  chapterCount?: number; // opzionale, default calcolato
}

function generateOutlinePrompt(data: OutlinePromptData): string {
  return `
# RUOLO
Sei un esperto ghost writer specializzato in libri business e autobiografici per imprenditori di successo.

# CONTESTO AUTORE
- Nome: ${data.projectData.authorName}
- Ruolo: ${data.projectData.authorRole}
- Azienda: ${data.projectData.company}
- Settore: ${data.projectData.industry}

# LIBRO
Titolo: "${data.projectData.bookTitle}"
${data.projectData.bookSubtitle ? `Sottotitolo: "${data.projectData.bookSubtitle}"` : ''}

Target Readers: ${data.projectData.targetReaders}

# HERO'S JOURNEY (Narrativa Business)
1. Situazione di Partenza: ${data.projectData.currentSituation}
2. Sfida Affrontata: ${data.projectData.challengeFaced}
3. Trasformazione: ${data.projectData.transformation}
4. Risultati: ${data.projectData.achievement}
5. Lezione Appresa: ${data.projectData.lessonLearned}

# OBIETTIVI BUSINESS
${data.projectData.businessGoals}

# VALORE UNICO
${data.projectData.uniqueValue}

# TASK
Crea un'outline dettagliata per un libro di ${data.targetLength} pagine circa.

L'outline DEVE:
1. Seguire il framework "Hero's Journey" adattato al business
2. Essere strutturata in capitoli chiari e logici
3. Ogni capitolo deve avere:
   - Titolo accattivante
   - Obiettivo del capitolo
   - Punti chiave da trattare (3-5 bullet points)
   - Storie/esempi specifici da includere
   - Call-to-action o takeaway per il lettore
4. Bilanciare parti narrative (storia personale) e parti strategiche (framework/metodi)
5. Includere:
   - Introduzione coinvolgente
   - 8-12 capitoli core
   - Conclusione con next steps

# OUTPUT FORMAT
Rispondi in JSON valido con questa struttura:

{
  "bookTitle": "Titolo",
  "estimatedPages": number,
  "estimatedWords": number,
  "targetAudience": "...",
  "mainThemes": ["tema1", "tema2", ...],
  "chapters": [
    {
      "number": 1,
      "title": "Titolo Capitolo",
      "objective": "Cosa vuole ottenere questo capitolo",
      "keyPoints": ["punto 1", "punto 2", ...],
      "stories": ["storia 1", "esempio 2", ...],
      "estimatedWords": number,
      "tone": "ispirazionale" | "pratico" | "riflessivo" | "strategico"
    }
  ]
}
`;
}
```

**B. Chapter Generation Prompt**:
```typescript
// lib/prompts/chapter-generator.ts

interface ChapterPromptData {
  projectData: ProjectFormData;
  outline: OutlineJSON;
  chapterNumber: number;
  previousChapterSummary?: string; // per continuità
}

function generateChapterPrompt(data: ChapterPromptData): string {
  const chapter = data.outline.chapters[data.chapterNumber - 1];
  
  return `
# RUOLO
Sei un ghost writer professionista che scrive per conto di ${data.projectData.authorName}.

# CONTESTO LIBRO
Titolo: "${data.projectData.bookTitle}"
Target: ${data.projectData.targetReaders}
Tone generale: Professionale ma accessibile, ispirazionale ma concreto

# INFORMAZIONI AUTORE (da incorporare nella scrittura)
- Background: ${data.projectData.currentSituation}
- Sfide superate: ${data.projectData.challengeFaced}
- Trasformazione: ${data.projectData.transformation}
- Risultati: ${data.projectData.achievement}
- Messaggio chiave: ${data.projectData.lessonLearned}
- Valore unico: ${data.projectData.uniqueValue}

${data.previousChapterSummary ? `
# CAPITOLO PRECEDENTE
${data.previousChapterSummary}
(Assicurati di creare continuità narrativa)
` : ''}

# QUESTO CAPITOLO
Numero: ${chapter.number}
Titolo: "${chapter.title}"
Obiettivo: ${chapter.objective}

Punti chiave da trattare:
${chapter.keyPoints.map((p, i) => `${i+1}. ${p}`).join('\n')}

Storie/esempi da includere:
${chapter.stories.map((s, i) => `- ${s}`).join('\n')}

Tone desiderato: ${chapter.tone}
Lunghezza target: ~${chapter.estimatedWords} parole

# ISTRUZIONI DI SCRITTURA
1. Scrivi in PRIMA PERSONA (come se fossi ${data.projectData.authorName})
2. Usa storie concrete e dettagli specifici (nomi, numeri, situazioni reali)
3. Bilancia narrazione personale e insegnamenti pratici
4. Includi esempi tangibili e actionable insights
5. Termina con un takeaway chiaro o call-to-action
6. Mantieni un tono: ${chapter.tone}
7. Usa sottosezioni con H2/H3 per strutturare il capitolo
8. Aggiungi box/callout quando appropriato per:
   - Esercizi pratici
   - Checklist
   - Citazioni memorabili
   - Punti chiave da ricordare

# STRUTTURA SUGGERITA
1. Hook iniziale (1-2 paragrafi coinvolgenti)
2. Sviluppo punti chiave con esempi
3. Lezioni apprese / Framework
4. Storia personale rilevante
5. Applicazione pratica
6. Conclusione e next steps

# OUTPUT FORMAT
Scrivi il capitolo completo in Markdown.
Usa:
- # per il titolo capitolo
- ## per sottosezioni principali
- ### per sotto-sottosezioni
- > per citazioni/callout
- **grassetto** per concetti chiave
- Liste puntate/numerate quando appropriato

NON includere: "Capitolo X" nel titolo, solo il titolo stesso.
`;
}
```

#### 2.3 AI Service Layer
Creare servizi modulari per AI:

```
lib/ai/
├── providers/
│   ├── openai.ts      # OpenAI client
│   ├── anthropic.ts   # Claude client
│   └── gemini.ts      # Google client (opzionale)
├── services/
│   ├── outline-generator.ts
│   ├── chapter-generator.ts
│   └── batch-processor.ts
├── prompts/
│   ├── outline-generator.ts
│   └── chapter-generator.ts
└── utils/
    ├── token-counter.ts
    ├── cost-calculator.ts
    └── rate-limiter.ts
```

#### 2.4 Queue System per Generazioni
Per gestire generazioni lunghe senza timeout:

**Opzioni**:
- ✅ **BullMQ** + Redis (production-grade, retry logic, priorità)
- **Inngest** (serverless, semplice)
- **Trigger.dev** (long-running tasks, built-in retry)

**Flow**:
```
User click "Genera Libro"
  ↓
API crea job in queue
  ↓
Ritorna subito project ID
  ↓
Background worker processa:
  1. Genera outline (5-10 min)
  2. Salva outline in DB
  3. Per ogni capitolo:
     - Genera content (10-20 min/capitolo)
     - Salva in DB
     - Update progress
  ↓
Frontend fa polling o usa WebSocket per progress
```

---

## 📊 Fase 3: Real-Time Progress & UI Updates

### Obiettivo
L'utente deve vedere lo stato della generazione in tempo reale.

### Tasks

#### 3.1 Progress Tracking System
- Database: Aggiungere campo `generationProgress` a Project
  ```typescript
  generationProgress: {
    status: "idle" | "generating_outline" | "outline_complete" | "generating_chapters" | "complete" | "error",
    currentStep: string,
    progress: number, // 0-100
    outlineComplete: boolean,
    chaptersComplete: number,
    chaptersTotal: number,
    estimatedTimeRemaining: number, // minuti
    startedAt: DateTime,
    completedAt: DateTime?
  }
  ```

#### 3.2 Real-Time Updates
**Opzioni**:

| Soluzione | Pro | Contro |
|-----------|-----|--------|
| **Polling** | Semplice, no infra | Inefficiente, delay |
| **Server-Sent Events (SSE)** | Unidirezionale, built-in HTTP | No bidirezionale |
| **WebSockets** | Real-time, bidirezionale | Infra complessa |
| **Pusher/Ably** | Managed, semplice | Costo extra |

**Raccomandazione**: 
- ✅ **SSE** per progress updates (semplice, efficace)
- ✅ **Polling** come fallback (ogni 5 secondi)

#### 3.3 UI Components per Progress

Creare nuovi componenti:

**GenerationProgressModal**:
```
┌─────────────────────────────────────────────┐
│  Generazione Libro in Corso...          [X]│
├─────────────────────────────────────────────┤
│                                              │
│  ✅ Analisi dati completata                 │
│  ⏳ Generazione outline... 60%              │
│  ⏸️  Capitolo 1 (in attesa)                 │
│  ⏸️  Capitolo 2 (in attesa)                 │
│  ...                                         │
│                                              │
│  Progress: ████████░░░░░░░░ 45%            │
│  Tempo stimato: ~23 minuti                  │
│                                              │
│  [Dettagli] [Annulla Generazione]          │
└─────────────────────────────────────────────┘
```

**ChapterGenerationCard** (in project detail):
```
┌─────────────────────────────────────────────┐
│  Capitolo 3: "Il Momento della Svolta"      │
├─────────────────────────────────────────────┤
│  Status: ✅ Completato                      │
│  Parole: 3,247                              │
│  AI Model: GPT-4o                           │
│  Generato: 23 min fa                        │
│                                              │
│  [Visualizza] [Rigenera] [Modifica]        │
└─────────────────────────────────────────────┘
```

---

## 📄 Fase 4: Document Assembly & Export

### Obiettivo
Assemblare tutti i capitoli e generare un file DOCX professionale.

### Tasks

#### 4.1 Document Assembly Logic
```typescript
// lib/document/assembler.ts

interface BookDocument {
  metadata: {
    title: string;
    author: string;
    subtitle?: string;
    generatedDate: Date;
  };
  outline: OutlineJSON;
  chapters: ChapterContent[];
  frontMatter?: {
    dedication?: string;
    acknowledgments?: string;
    foreword?: string;
  };
  backMatter?: {
    aboutAuthor: string;
    resources?: string;
  };
}

function assembleBook(project: Project): BookDocument {
  // 1. Raccogli tutti i capitoli dal DB (ordinati)
  // 2. Crea struttura documento
  // 3. Aggiungi metadata
  // 4. Componi document finale
}
```

#### 4.2 DOCX Generation
**Library**: `docx` (npm package - più completo) o `docx-templates`

Features necessarie:
- ✅ Titolo, autore, metadata
- ✅ Table of Contents auto-generata
- ✅ Stili personalizzati:
  - Heading 1, 2, 3
  - Body text
  - Quotes/Callouts
  - Lists
- ✅ Page numbers
- ✅ Headers/Footers
- ✅ Formatting:
  - Font: professionale (Garamond, Georgia, Palatino)
  - Spacing: line height 1.5
  - Margins: standard publishing (2.5cm)
  - Page size: A4 o US Letter

```typescript
// lib/document/docx-generator.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

async function generateDOCX(book: BookDocument): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // Title page
        new Paragraph({
          text: book.metadata.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        
        // TOC
        // ... generate from outline
        
        // Chapters
        ...book.chapters.map(chapter => 
          convertMarkdownToDocx(chapter.content)
        )
      ]
    }]
  });
  
  return await Packer.toBuffer(doc);
}
```

#### 4.3 Export API & Download
```typescript
// app/api/projects/[id]/export/route.ts

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // 1. Verifica auth e permessi
  // 2. Recupera progetto + capitoli da DB
  // 3. Assembla documento
  // 4. Genera DOCX
  // 5. Return file con headers corretti
  
  return new Response(docxBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${sanitizedTitle}.docx"`
    }
  });
}
```

#### 4.4 Preview & Edit
Prima dell'export finale, permettere:
- ✅ **Preview HTML** dei capitoli
- ✅ **Edit inline** con ContentEditor
- ✅ **Rigenera singolo capitolo** se non soddisfacente
- ✅ **Riordina capitoli** (drag & drop)

---

## 🎨 Fase 5: UI/UX Enhancements

### Obiettivo
Rendere l'esperienza utente fluida e production-ready.

### Tasks

#### 5.1 Dashboard Evolution
Aggiungere alla Dashboard:
- **Active Generations Card**: mostra progetti in generazione
- **Recent Completions**: ultimi libri completati
- **Usage Statistics**: 
  - Libri generati questo mese
  - Parole totali generate
  - Costi AI sostenuti
  - Tempo medio di generazione

#### 5.2 Project Detail Page Redesign
```
┌─────────────────────────────────────────────────────────┐
│  ← Progetti    "Da Zero a Leader" by Marco Rossi        │
├─────────────────────────────────────────────────────────┤
│  Tabs: [Overview] [Outline] [Capitoli] [Export]        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  OVERVIEW TAB:                                          │
│  - Status badge (Draft, Generating, Complete)          │
│  - Progress bar se in generazione                       │
│  - Form data display (readonly)                         │
│  - [Genera Outline] → [Genera Capitoli] → [Export]     │
│                                                          │
│  OUTLINE TAB:                                           │
│  - Tree view della struttura                            │
│  - Edit inline (se necessario aggiustare)               │
│  - [Rigenera Outline]                                   │
│                                                          │
│  CAPITOLI TAB:                                          │
│  - Lista capitoli con status                            │
│  - Click per preview/edit                               │
│  - [Rigenera questo capitolo]                           │
│                                                          │
│  EXPORT TAB:                                            │
│  - Preview completo libro                               │
│  - Opzioni export (DOCX, PDF future)                    │
│  - [Download DOCX]                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 5.3 Settings & Configuration
Aggiungere nuova settings page:
- **AI Settings**:
  - AI provider preferences (GPT-4 vs Claude)
  - Temperature/creativity slider
  - Max tokens per chapter
  - Cost limits per progetto
- **Export Settings**:
  - Font preferences
  - Margin settings
  - Page size (A4/Letter)
- **API Keys Management** (se user fornisce proprie keys)

#### 5.4 Notifications System
- Email quando generazione completa
- In-app notifications per milestones
- Error notifications con suggerimenti di fix

---

## 🔐 Fase 6: Security, Performance & Production Readiness

### Obiettivo
Rendere l'app sicura, veloce e pronta per uso quotidiano.

### Tasks

#### 6.1 Security

**Authentication & Authorization**:
- ✅ Session management con NextAuth
- ✅ CSRF protection
- ✅ Rate limiting sulle API (prevent abuse)
- ✅ Input validation (Zod schemas)
- ✅ Sanitize user input prima di inviare ad AI
- ✅ Secure API keys (env variables, encryption)

**Data Protection**:
- ✅ Encrypt sensitive data nel DB (se necessario)
- ✅ HTTPS only
- ✅ Secure file uploads/downloads
- ✅ Audit logs per azioni critiche

#### 6.2 Performance Optimization

**Database**:
- Indexes su campi frequentemente queried
- Connection pooling
- Query optimization
- Caching con Redis per dati frequenti

**AI Calls**:
- Streaming responses (se possibile)
- Caching outline se rigenerata con stessi input
- Parallel chapter generation (max 3-5 concurrent)
- Token optimization (ridurre prompt size quando possibile)

**Frontend**:
- Code splitting
- Image optimization
- Lazy loading componenti pesanti
- Memoization (React.memo, useMemo)

#### 6.3 Error Handling & Resilience

**AI Generation Failures**:
```typescript
// Retry logic con exponential backoff
async function generateWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delayMs * Math.pow(2, i));
    }
  }
}
```

**Fallback Strategies**:
- Se GPT-4 fallisce → prova GPT-4o-mini
- Se outline generation fallisce → usa template predefinito modificabile
- Partial success: salva capitoli completati anche se alcuni falliscono

**User-Friendly Errors**:
- Messaggi chiari e actionable
- Suggerimenti di cosa fare
- Contact support se persistent

#### 6.4 Monitoring & Logging

**Metrics da tracciare**:
- Generation success rate
- Average generation time
- AI costs per libro
- API errors e downtime
- User engagement metrics

**Tools**:
- ✅ **Sentry** per error tracking
- ✅ **Vercel Analytics** (se deploy su Vercel)
- ✅ **Posthog** o **Mixpanel** per product analytics
- ✅ Custom logging con Winston o Pino

#### 6.5 Testing

**Unit Tests**:
- Prompt generation functions
- Document assembly logic
- Utility functions (token counter, cost calculator)

**Integration Tests**:
- API routes
- Database operations
- AI service layer (with mocks)

**E2E Tests**:
- Complete user flow (Playwright):
  1. Create project
  2. Generate outline
  3. Generate chapters
  4. Export DOCX

---

## 💰 Fase 7: Cost Management & Business Logic

### Obiettivo
Gestire i costi AI e monetizzazione (se applicabile).

### Tasks

#### 7.1 Cost Tracking
```typescript
// lib/cost/calculator.ts

interface GenerationCost {
  inputTokens: number;
  outputTokens: number;
  model: string;
  cost: number; // USD
}

function calculateCost(usage: GenerationCost): number {
  const pricing = {
    'gpt-4o': { input: 0.0025, output: 0.010 }, // per 1k tokens
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  };
  
  const rates = pricing[usage.model];
  return (usage.inputTokens / 1000 * rates.input) + 
         (usage.outputTokens / 1000 * rates.output);
}
```

#### 7.2 Budget Limits
- Per progetto: max cost limit
- Per utente: monthly budget
- Alerts quando si avvicina al limite
- Opzione di upgrade plan (se SaaS)

#### 7.3 Cost Optimization
- Use cheaper models per bozze
- Caching aggressive di outline
- Batch generation quando possibile
- Compression di prompts

---

## 📅 Timeline & Priorità

### Sprint 1 (2 settimane): Fondamenta
- ✅ Database setup con Prisma
- ✅ Authentication con NextAuth
- ✅ API routes base (CRUD projects)
- ✅ Salvataggio form data nel DB

### Sprint 2 (2 settimane): AI Outline Generation
- ✅ AI provider integration (OpenAI/Anthropic)
- ✅ Outline generation prompt engineering
- ✅ API route per outline generation
- ✅ UI per visualizzare outline generata
- ✅ Edit inline outline

### Sprint 3 (3 settimane): Chapter Generation
- ✅ Chapter generation prompts
- ✅ Queue system setup (BullMQ)
- ✅ Parallel chapter generation logic
- ✅ Progress tracking real-time
- ✅ UI updates (progress modal, chapter cards)

### Sprint 4 (2 settimane): Document Export
- ✅ Document assembly logic
- ✅ DOCX generation con formatting
- ✅ Export API
- ✅ Download functionality
- ✅ Preview system

### Sprint 5 (1 settimana): Polish & Testing
- ✅ Error handling completo
- ✅ UI/UX refinements
- ✅ Testing (unit + E2E)
- ✅ Performance optimization
- ✅ Security audit

### Sprint 6 (1 settimana): Production Deploy
- ✅ Deploy su Vercel/Railway
- ✅ Database prod setup
- ✅ Monitoring setup
- ✅ Documentation finale
- ✅ Handoff al collega

**Total Time**: ~11 settimane (2.5 mesi)

---

## 🎯 MVP vs Full Feature Set

### MVP (Minimum Viable Product) - 6 settimane

**Must Have**:
- ✅ Form data input
- ✅ Database persistence
- ✅ AI outline generation (singolo provider)
- ✅ AI chapter generation (sequenziale, non parallelo)
- ✅ Basic progress tracking (polling)
- ✅ DOCX export (basic formatting)
- ✅ Authentication semplice
- ✅ UI essenziale (no fancy animations)

**Nice to Have** (per dopo MVP):
- ⏳ Multiple AI providers
- ⏳ Parallel chapter generation
- ⏳ Real-time progress (SSE/WebSocket)
- ⏳ Advanced DOCX formatting
- ⏳ Chapter editing inline
- ⏳ Cost tracking dettagliato
- ⏳ Email notifications
- ⏳ Admin dashboard

---

## 🛠️ Tech Stack Raccomandato

### Backend
- **Framework**: Next.js 14 App Router (già in uso)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Queue**: BullMQ + Redis
- **AI**: OpenAI SDK + Anthropic SDK

### Frontend (già ok)
- React 18 + TypeScript
- Tailwind CSS
- Lucide icons

### Infrastructure
- **Hosting**: Vercel (frontend + API routes)
- **Database**: Vercel Postgres / Supabase / Railway
- **Redis**: Upstash (serverless Redis)
- **File Storage**: Vercel Blob / AWS S3 (per DOCX temporanei)
- **Monitoring**: Sentry + Vercel Analytics

### Development Tools
- **API Testing**: Postman / Insomnia
- **Database GUI**: Prisma Studio
- **Testing**: Jest + Playwright
- **CI/CD**: GitHub Actions

---

## 📋 Checklist Pre-Handoff al Collega

### Documentation
- [ ] README aggiornato con setup completo
- [ ] Environment variables documentate (.env.example)
- [ ] API documentation (endpoints, payloads)
- [ ] Database schema docs
- [ ] AI prompts documentati e editabili
- [ ] Troubleshooting guide
- [ ] Cost estimation guide

### Training Materials
- [ ] Video walkthrough dell'app (5-10 min)
- [ ] Step-by-step user guide PDF
- [ ] FAQ common issues
- [ ] Contact info per supporto

### Production Readiness
- [ ] Health check endpoint (`/api/health`)
- [ ] Error tracking attivo
- [ ] Backup strategy per DB
- [ ] Monitoring dashboard setup
- [ ] API keys sicure e rotate-able
- [ ] Rate limiting attivo
- [ ] Logs strutturati e searchable

### Testing
- [ ] User acceptance testing completato
- [ ] Performance testing (load test)
- [ ] Security testing (OWASP top 10)
- [ ] Cross-browser testing
- [ ] Mobile responsive verificato

---

## 🚨 Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI costs troppo alti | Alto | Media | Budget limits, caching, cheaper models fallback |
| AI generation quality bassa | Alto | Media | Multiple providers, human-in-the-loop editing |
| AI API downtime | Medio | Bassa | Retry logic, multiple providers, clear error messages |
| Long generation time (user impatience) | Medio | Alta | Progress indicator, email notification, async processing |
| Database performance | Medio | Bassa | Indexes, connection pooling, caching |
| Security breach | Alto | Bassa | Auth, input validation, rate limiting, security audit |
| Export formatting issues | Basso | Media | Multiple test cases, manual QA pass |
| User learning curve | Medio | Media | Good docs, tooltips, onboarding flow |

---

## 📞 Decision Points & Open Questions

### Da Decidere:

1. **AI Provider Primario**:
   - Option A: OpenAI (più maturo, GPT-4o best balance)
   - Option B: Anthropic (Claude 3.5 migliore per long-form)
   - Option C: Hybrid (Claude outline, GPT chapters)
   - **Raccomandazione**: Hybrid approach

2. **Database**:
   - Option A: Vercel Postgres (semplice, integrato)
   - Option B: Supabase (più features, auth built-in, storage)
   - Option C: Railway Postgres (flessibile, economico)
   - **Raccomandazione**: Supabase (all-in-one)

3. **Queue System**:
   - Option A: BullMQ + Upstash Redis (robusto)
   - Option B: Trigger.dev (più semplice, built for this)
   - Option C: Inngest (serverless-first)
   - **Raccomandazione**: BullMQ per flessibilità, Trigger.dev per rapidità

4. **Real-time Progress**:
   - Option A: Polling (semplice)
   - Option B: SSE (unidirezionale, efficace)
   - Option C: WebSocket (bidirezionale, complesso)
   - **Raccomandazione**: SSE con polling fallback

5. **Monetization**:
   - È un tool interno o verrà venduto?
   - Chi paga i costi AI? (azienda o per-user?)
   - Servono tier/plans diversi?

---

## 🎓 Learning Resources

### AI Integration
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

### Document Generation
- [docx npm package](https://github.com/dolanmiu/docx)
- [Markdown to DOCX converters](https://pandoc.org/)

### Queue Systems
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Trigger.dev Guide](https://trigger.dev/docs)

### Production Best Practices
- [Next.js Production Checklist](https://nextjs.org/docs/deployment)
- [Vercel Best Practices](https://vercel.com/docs/concepts/next.js/production-checklist)

---

**Documento creato**: 9 Ottobre 2025  
**Versione**: 1.0  
**Status**: Draft for Review  
**Next Step**: Review e approvazione piano → Start Sprint 1
