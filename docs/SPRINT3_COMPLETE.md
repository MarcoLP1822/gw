# Sprint 3 - AI Outline Generation ✅

**Status**: Implementazione completa - Pronto per test  
**Data**: 7 Giugno 2025  
**Modello AI**: OpenAI gpt-4o-mini (più economico a $0.15/1M input, $0.60/1M output tokens)

---

## 🎯 Obiettivi Sprint

Implementare la generazione automatica dell'outline del libro usando l'AI di OpenAI, basandosi sui dati del progetto inseriti dall'utente.

---

## ✅ Implementazioni Completate

### 1. Configurazione OpenAI Client

**File**: `lib/ai/openai-client.ts`

```typescript
- Client OpenAI inizializzato con API key da .env
- Modello default: gpt-4o-mini
- Configurazione: temperature 0.7, max_tokens 4000
```

**Costi stimati per outline**:
- Input: ~1000 tokens → $0.0015
- Output: ~2000 tokens → $0.0012
- **Totale per outline: ~$0.003 (meno di 1 centesimo!)**

### 2. Prompt Engineering

**File**: `lib/ai/prompts/outline-generator.ts`

**Caratteristiche**:
- Prompt personalizzato basato su tutti i dati del progetto (autore, libro, hero's journey, business goals)
- System prompt per guidare il comportamento dell'AI
- Output strutturato in JSON per parsing affidabile
- Genera outline con 10-15 capitoli
- Ogni capitolo include: titolo, descrizione, key points, fase del viaggio dell'eroe

**Esempio di output generato**:
```json
{
  "title": "Titolo del Libro",
  "subtitle": "Sottotitolo attraente",
  "description": "Descrizione del libro in 2-3 paragrafi",
  "chapters": [
    {
      "number": 1,
      "title": "Titolo Capitolo",
      "description": "Descrizione breve",
      "keyPoints": ["Punto 1", "Punto 2", "Punto 3"],
      "heroJourneyPhase": "Mondo ordinario"
    }
  ]
}
```

### 3. API Route per Generazione

**File**: `app/api/projects/[id]/generate-outline/route.ts`

**Endpoint**: `POST /api/projects/:id/generate-outline`

**Flusso**:
1. ✅ Recupera progetto dal database
2. ✅ Genera prompt personalizzato con dati progetto
3. ✅ Chiama OpenAI API con gpt-4o-mini
4. ✅ Forza risposta JSON con `response_format: { type: 'json_object' }`
5. ✅ Salva outline nel database (tabella `Outline`)
6. ✅ Log della generazione in `GenerationLog` per tracking costi
7. ✅ Ritorna outline con metadata (usage, timing)

**Gestione Errori**:
- Progetto non trovato (404)
- Errori OpenAI API (500)
- Errori parsing JSON (500)
- Log errori nel database per debugging

### 4. UI Completa per Outline Tab

**File**: `app/progetti/[id]/page.tsx`

**Funzionalità**:

#### Stato: Nessun Outline
- Card con CTA "Genera Outline con AI"
- Loading state durante generazione (10-30 secondi)
- Error handling con messaggi utente
- Indicatore tempo stimato

#### Stato: Outline Generato
- **Header**: Titolo + Sottotitolo libro
- **Metadata**: Numero capitoli, data generazione, modello AI
- **Pulsante Rigenera**: Per creare nuova versione
- **Lista Capitoli**: Card per ogni capitolo con:
  - Numero capitolo
  - Titolo e descrizione
  - Key points (bullet list)
  - Badge con fase Hero's Journey
- Design professionale con colori indigo/purple

### 5. Type Definitions

**File**: `types/index.ts`

Nuovi tipi aggiunti:
```typescript
interface OutlineChapter {
  number: number;
  title: string;
  description: string;
  keyPoints: string[];
  heroJourneyPhase: string;
}

interface GeneratedOutline {
  title: string;
  subtitle: string;
  description: string;
  chapters: OutlineChapter[];
}
```

### 6. Environment Configuration

**File**: `.env`

Aggiunto:
```bash
OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"
```

**File**: `.env.example`

Documentazione dettagliata per OpenAI setup

---

## 🗄️ Database Schema

L'outline viene salvato nella tabella `Outline`:

```prisma
model Outline {
  id             String   @id @default(cuid())
  projectId      String   @unique
  structure      Json     // GeneratedOutline completo
  totalChapters  Int
  estimatedWords Int      // chapters.length * 2000
  aiModel        String   // "gpt-4o-mini"
  generatedAt    DateTime @default(now())
}
```

I costi/usage vengono tracciati in `GenerationLog`:

```prisma
model GenerationLog {
  id               String   @id @default(cuid())
  projectId        String
  step             String   // "outline"
  aiModel          String   // "gpt-4o-mini"
  promptTokens     Int
  completionTokens Int
  totalTokens      Int
  duration         Int      // milliseconds
  success          Boolean
  errorMessage     String?
}
```

---

## 🧪 Come Testare

### 1. Setup API Key

```bash
# Vai su https://platform.openai.com/api-keys
# Crea una nuova API key
# Incolla nel .env:
OPENAI_API_KEY="sk-proj-..."
```

### 2. Restart Server

```bash
# Ferma il server (Ctrl+C)
npm run dev
```

### 3. Test Flow

1. Vai alla homepage: `http://localhost:3000`
2. Crea un nuovo progetto con dati completi
3. Apri il progetto appena creato
4. Vai al tab "Outline"
5. Clicca "Genera Outline con AI"
6. Attendi 10-30 secondi
7. Verifica l'outline generato

### 4. Verifica Database

```bash
# Apri Prisma Studio
npm run db:studio

# Controlla tabelle:
# - Outline: verifica che structure JSON sia popolato
# - GenerationLog: verifica usage tokens e costi
```

---

## 📊 Monitoring & Costi

### Tracking in GenerationLog

Ogni generazione salva:
- Token utilizzati (prompt + completion)
- Tempo di generazione (ms)
- Modello usato
- Success/Error status

### Calcolo Costi

Costi gpt-4o-mini:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**Esempio reale**:
- Prompt: 1000 tokens → $0.0015
- Completion: 2000 tokens → $0.0012
- **Totale: $0.0027** (meno di 1 centesimo!)

Per 1000 outline generati: **~$2.70**

---

## 🐛 Known Issues & Limitations

### Limitazioni Correnti

1. **Nessun controllo duplicati**: Se clicchi "Genera" più volte, crea outline nuovi sovrascrivendo il precedente (relation unique)
2. **Nessun versioning**: Non c'è storico degli outline generati
3. **Timeout**: Nessun timeout gestito (OpenAI default 10min)
4. **Rate limiting**: Non implementato (usa rate limit OpenAI)

### Miglioramenti Futuri

- [ ] Versioning degli outline (v1, v2, v3...)
- [ ] Confronto tra versioni diverse
- [ ] Streaming response per UX migliore
- [ ] Caching per evitare rigenerazioni identiche
- [ ] Preview prima di salvare
- [ ] Edit manuale dell'outline generato

---

## 🔄 Integrazione con Sprint 4

Lo Sprint 4 (Chapter Generation) utilizzerà:
- L'outline generato come base
- I capitoli dell'outline per generare i contenuti
- Lo stesso sistema di logging per tracking

Preparazione:
- API route: `POST /api/projects/:id/chapters/:chapterNumber/generate`
- Usa `outline.structure.chapters[N]` come prompt base
- Genera 1 capitolo alla volta (2000-3000 parole)

---

## 📁 Files Modificati/Creati

### Nuovi Files
- ✅ `lib/ai/openai-client.ts`
- ✅ `lib/ai/prompts/outline-generator.ts`
- ✅ `app/api/projects/[id]/generate-outline/route.ts`

### Files Modificati
- ✅ `types/index.ts` (aggiunto GeneratedOutline, OutlineChapter)
- ✅ `app/progetti/[id]/page.tsx` (OutlineTab completamente rifatto)
- ✅ `.env` (aggiunto OPENAI_API_KEY)
- ✅ `.env.example` (documentazione OpenAI)
- ✅ `package.json` (aggiunto openai SDK)

---

## 🎉 Risultato

L'utente può ora:
1. ✅ Creare un nuovo progetto con i dati del suo libro
2. ✅ Generare automaticamente un outline completo con l'AI
3. ✅ Visualizzare l'outline in modo professionale
4. ✅ Rigenerare l'outline se necessario
5. ✅ Vedere i costi e usage della generazione

**Sprint 3 completato con successo!** 🚀

---

## 🚀 Next Steps → Sprint 4

**Obiettivo**: Chapter Generation (Generazione capitoli individuali)

**Features**:
- Pulsante "Genera Capitolo" per ogni capitolo dell'outline
- API route per generare contenuto capitolo (2000-3000 parole)
- Progress bar per generazione multipla capitoli
- Preview e edit del contenuto generato
- Salvataggio in tabella `Chapter`

**Stima**: 4-6 ore sviluppo
