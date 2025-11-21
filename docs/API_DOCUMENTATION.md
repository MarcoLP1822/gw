# 🚀 API Routes - Documentazione

## ✅ API Routes Create

### 📁 Struttura

```
app/api/
└── projects/
    ├── route.ts           # POST, GET (lista)
    └── [id]/
        └── route.ts       # GET, PUT, DELETE (singolo)
```

---

## 📋 Endpoints Disponibili

### 1. POST /api/projects
**Crea un nuovo progetto**

#### Request
```typescript
POST /api/projects
Content-Type: application/json

Body: ProjectFormData {
  // Informazioni Cliente/Autore
  authorName: string;
  authorRole: string;
  company: string;
  industry: string;

  // Informazioni Progetto
  bookTitle: string;
  bookSubtitle?: string;
  targetAudience: string;

  // Struttura Narrativa (Hero's Journey)
  currentSituation: string;
  challengeFaced: string;
  transformation: string;
  achievement: string;
  lessonLearned: string;

  // Dettagli Business
  businessGoals: string;
  targetReaders: string;
  uniqueValue: string;

  // Informazioni Tecniche
  estimatedPages?: number;
  additionalNotes?: string;
}
```

#### Response (Success)
```typescript
Status: 201 Created

{
  "success": true,
  "project": {
    "id": "clxxx...",
    "bookTitle": "Da Zero a Leader",
    "authorName": "Marco Rossi",
    "status": "draft",
    "createdAt": "2025-10-09T..."
  }
}
```

#### Response (Error)
```typescript
Status: 400 | 500

{
  "error": "Messaggio di errore"
}
```

---

### 2. GET /api/projects
**Ottieni lista di tutti i progetti**

#### Request
```typescript
GET /api/projects
```

#### Response (Success)
```typescript
Status: 200 OK

{
  "success": true,
  "projects": [
    {
      "id": "clxxx...",
      "bookTitle": "Da Zero a Leader",
      "bookSubtitle": "Come ho costruito...",
      "authorName": "Marco Rossi",
      "company": "Tech Innovators Srl",
      "industry": "Technology",
      "status": "draft",
      "estimatedPages": 200,
      "createdAt": "2025-10-09T...",
      "updatedAt": "2025-10-09T...",
      "_count": {
        "chapters": 0
      }
    },
    ...
  ],
  "total": 5
}
```

---

### 3. GET /api/projects/[id]
**Ottieni dettagli di un progetto specifico**

#### Request
```typescript
GET /api/projects/clxxx...
```

#### Response (Success)
```typescript
Status: 200 OK

{
  "success": true,
  "project": {
    "id": "clxxx...",
    "userId": "user123",
    "authorName": "Marco Rossi",
    "authorRole": "CEO & Founder",
    "company": "Tech Innovators Srl",
    "industry": "Technology",
    "bookTitle": "Da Zero a Leader",
    "bookSubtitle": "Come ho costruito...",
    "targetReaders": "Imprenditori tech...",
    "currentSituation": "Partito da zero...",
    "challengeFaced": "Difficoltà nel...",
    "transformation": "Ho sviluppato...",
    "achievement": "Oggi l'azienda...",
    "lessonLearned": "L'importanza del...",
    "businessGoals": "Attrarre investitori...",
    "uniqueValue": "Approccio human-first...",
    "estimatedPages": 200,
    "additionalNotes": "Note aggiuntive...",
    "status": "draft",
    "generationProgress": {...},
    "createdAt": "2025-10-09T...",
    "updatedAt": "2025-10-09T...",
    
    // Relazioni incluse
    "outline": null,  // o { ...outline data }
    "chapters": [],   // array di capitoli
    "_count": {
      "chapters": 0,
      "generationLogs": 0
    }
  }
}
```

#### Response (Not Found)
```typescript
Status: 404 Not Found

{
  "error": "Progetto non trovato"
}
```

---

### 4. PUT /api/projects/[id]
**Aggiorna un progetto esistente**

#### Request
```typescript
PUT /api/projects/clxxx...
Content-Type: application/json

Body: Partial<ProjectFormData> & { status?: string }
// Puoi inviare solo i campi che vuoi aggiornare
{
  "bookTitle": "Nuovo Titolo",
  "status": "generating_outline"
}
```

#### Response (Success)
```typescript
Status: 200 OK

{
  "success": true,
  "project": {
    // Progetto aggiornato completo
    ...
  }
}
```

#### Response (Not Found)
```typescript
Status: 404 Not Found

{
  "error": "Progetto non trovato"
}
```

---

### 5. DELETE /api/projects/[id]
**Elimina un progetto**

⚠️ **ATTENZIONE**: Elimina anche outline, chapters e logs associati (cascade delete)

#### Request
```typescript
DELETE /api/projects/clxxx...
```

#### Response (Success)
```typescript
Status: 200 OK

{
  "success": true,
  "message": "Progetto eliminato con successo"
}
```

#### Response (Not Found)
```typescript
Status: 404 Not Found

{
  "error": "Progetto non trovato"
}
```

---

## 🛠️ Utilizzo nel Frontend

### Client API Helper

Ho creato un helper per semplificare le chiamate API: `lib/api/projects.ts`

#### Esempi di utilizzo:

```typescript
import { projectsApi } from '@/lib/api/projects';

// 1. Creare un progetto
const newProject = await projectsApi.create(formData);
console.log(newProject.project.id);

// 2. Ottenere tutti i progetti
const { projects, total } = await projectsApi.getAll();

// 3. Ottenere un progetto specifico
const { project } = await projectsApi.getById('clxxx...');

// 4. Aggiornare un progetto
const updated = await projectsApi.update('clxxx...', {
  bookTitle: 'Nuovo Titolo',
  status: 'generating_outline'
});

// 5. Eliminare un progetto
await projectsApi.delete('clxxx...');
```

### Error Handling

Tutte le funzioni API lanciano errori che devono essere gestiti:

```typescript
try {
  const result = await projectsApi.create(formData);
  // Success
} catch (error) {
  console.error('Error:', error);
  alert(error.message); // Mostra errore all'utente
}
```

---

## 🔄 Integrazione UI

### Componenti Aggiornati

#### 1. **NewProjectModal** (`components/NewProjectModal.tsx`)
- ✅ Importa `ProjectFormData` da `@/types` invece di definirlo localmente
- ✅ Riceve `onSubmitAction` che ora può essere async

#### 2. **Home Page** (`app/page.tsx`)
- ✅ Usa `projectsApi.create()` per salvare nel database
- ✅ Mostra loading state durante submit
- ✅ Redirect automatico al progetto creato

#### 3. **ProjectTableV2** (`components/ProjectTableV2.tsx`) - NUOVO
- ✅ Fetch automatico progetti dal database
- ✅ Loading state
- ✅ Error state con retry
- ✅ Empty state
- ✅ Search/filter
- ✅ Status badges
- ✅ Navigazione a dettaglio progetto

#### 4. **Pagina Progetti** (`app/progetti/page.tsx`)
- ✅ Usa `ProjectTableV2` invece di mock data

---

## 📊 Status dei Progetti

I progetti hanno questi status possibili:

| Status | Descrizione | Badge Color |
|--------|-------------|-------------|
| `draft` | Progetto appena creato | Grigio |
| `generating_outline` | AI sta generando outline | Blu |
| `generating_chapters` | AI sta generando capitoli | Viola |
| `completed` | Libro completato | Verde |
| `error` | Errore durante generazione | Rosso |

---

## 🔒 Security Notes

### Attualmente (MVP)
- ✅ Validazione base dei dati
- ✅ Error handling
- ⚠️ **NO authentication** (usa utente demo)
- ⚠️ **NO authorization** (tutti possono vedere tutto)

### Da Implementare (Sprint Auth)
- 🔜 NextAuth.js per authentication
- 🔜 Session-based user ID
- 🔜 Row-level filtering per userId
- 🔜 API rate limiting
- 🔜 Input validation con Zod
- 🔜 CSRF protection

---

## 🧪 Testing

### Test Manuale

#### 1. Test CREATE
```bash
# Terminal 1: Avvia dev server
npm run dev

# Terminal 2: Test con curl
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test Author",
    "authorRole": "CEO",
    "company": "Test Company",
    "industry": "Tech",
    "bookTitle": "Test Book",
    "targetReaders": "Entrepreneurs",
    "currentSituation": "Started from nothing",
    "challengeFaced": "Many obstacles",
    "transformation": "Learned and grew",
    "achievement": "Built successful company",
    "lessonLearned": "Persistence is key",
    "businessGoals": "Inspire others",
    "uniqueValue": "Human-first approach"
  }'
```

#### 2. Test GET (lista)
```bash
curl http://localhost:3000/api/projects
```

#### 3. Test GET (singolo)
```bash
curl http://localhost:3000/api/projects/[ID_PROGETTO]
```

#### 4. Test UPDATE
```bash
curl -X PUT http://localhost:3000/api/projects/[ID_PROGETTO] \
  -H "Content-Type: application/json" \
  -d '{"bookTitle": "Updated Title"}'
```

#### 5. Test DELETE
```bash
curl -X DELETE http://localhost:3000/api/projects/[ID_PROGETTO]
```

### Test tramite UI

1. ✅ Vai su http://localhost:3000
2. ✅ Clicca "Nuovo Progetto"
3. ✅ Compila il form
4. ✅ Submit
5. ✅ Verifica redirect a `/progetti/[id]`
6. ✅ Vai su `/progetti`
7. ✅ Verifica che il progetto appaia nella tabella
8. ✅ Apri Prisma Studio: `npm run db:studio`
9. ✅ Verifica il record nella tabella `Project`

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
→ Verifica che il server dev sia in esecuzione
→ Controlla `.env` con credenziali corrette

### Error: "Prisma Client not generated"
→ Esegui: `npx prisma generate`

### Error: "Module not found: @/lib/db"
→ Riavvia il server dev: `npm run dev`

### Progetto non appare nella lista
→ Apri Prisma Studio e verifica che esista nel DB
→ Controlla console browser per errori API
→ Controlla console server per errori

### Form non si submit
→ Apri DevTools > Network
→ Verifica che la richiesta POST parta
→ Controlla response per errori
→ Verifica campi required compilati

---

## 📝 POST /api/projects/[id]/suggestions/apply

**Applica o genera preview di un suggerimento del consistency check**

### Request

```typescript
POST /api/projects/[id]/suggestions/apply
Content-Type: application/json

{
  "issue": {
    "type": "repetition" | "contradiction" | "style_shift" | "tone_change" | "factual_error",
    "severity": "high" | "medium" | "low",
    "chapter": number,
    "description": string,
    "suggestion": string
  },
  "chapterNumber": number,
  "preview": boolean  // true = solo diff, false = apply
}
```

### Response (preview=true)

```typescript
{
  "success": true,
  "diff": {
    "chapterNumber": number,
    "oldContent": string,
    "newContent": string,
    "changes": [{
      "type": "deletion" | "replacement" | "addition",
      "targetText": string,
      "newText": string | undefined,
      "lineStart": number,
      "lineEnd": number,
      "reasoning": string
    }],
    "estimatedCost": number,     // USD
    "wordsChanged": number,
    "percentageChanged": number
  }
}
```

### Response (preview=false)

```typescript
{
  "success": true,
  "chapter": {
    // Chapter object con content aggiornato
    // previousContent salvato per undo
  }
}
```

### Errors

```typescript
400 Bad Request
{
  "error": "Parametri mancanti: issue e chapterNumber richiesti"
}

400 Bad Request
{
  "error": "Issue malformato: chapter, description e suggestion richiesti"
}

500 Internal Server Error
{
  "error": "Suggestion troppo ambigua per applicazione automatica. Richiede revisione manuale."
}
```

### Features

- ✅ **Preview obbligatorio**: Preview diff prima di applicare
- ✅ **AI Confidence Threshold**: Rifiuta se confidence < 0.7
- ✅ **Versioning automatico**: Salva `previousContent` per undo
- ✅ **Impact metrics**: Calcola parole/percentuale cambiate
- ✅ **Cost estimation**: Stima costo chiamata AI

---

## 🎯 Next Steps

### Sprint Corrente ✅
- ✅ Database setup
- ✅ API routes CRUD
- ✅ Integrazione UI base
- ✅ Test manuale
- ✅ Apply Consistency Suggestions (Sprint 1 & 2)

### Prossimi Sprint 🔜

#### Sprint 2: Authentication
- 🔜 NextAuth.js setup
- 🔜 Google OAuth
- 🔜 Protected routes
- 🔜 User-specific data filtering

#### Sprint 3: AI Integration
- 🔜 POST `/api/projects/[id]/generate-outline`
- 🔜 POST `/api/projects/[id]/generate-chapters`
- 🔜 GET `/api/projects/[id]/status` (real-time)
- 🔜 OpenAI/Anthropic integration

#### Sprint 4: Document Export
- 🔜 GET `/api/projects/[id]/export`
- 🔜 DOCX generation
- 🔜 PDF generation (opzionale)

---

**Creato**: 9 Ottobre 2025  
**Versione**: 1.0  
**Status**: ✅ API Routes Complete & Integrated  
**Next**: Test completo + Authentication setup
