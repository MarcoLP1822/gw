# Piano di Implementazione: AI Settings & Configuration System

**Obiettivo**: Risolvere il problema del target audience ignorato dall'AI e fornire controllo completo sulla generazione dei contenuti.

**Problema Attuale**: L'AI non rispetta il `targetReaders` specificato dall'utente (es: "bambini di 5 anni" → genera testo professionale per adulti).

**Soluzione**: Sistema a 3 livelli di configurazione AI con UI dedicata e prompt engineering avanzato.

---

## 📋 Overview degli Step

```
Step 1: Database & Types Foundation
  ↓
Step 2: Prompt Builder & AI Integration
  ↓
Step 3: UI - AI Settings Tab
  ↓
Step 4: Testing & Validation
```

---

## STEP 1: Database Schema & TypeScript Types

**Durata stimata**: 30-45 minuti  
**File coinvolti**: 3  
**Breaking changes**: No (additive only)

### 1.1 Database Migration

**File**: `prisma/schema.prisma`

**Modifiche**:
1. Aggiungere model `ProjectAIConfig`
2. Aggiungere relation a `Project` model
3. Definire tutti i campi per Simple Mode e Advanced Mode

**Campi chiave**:
- `audienceType`: dropdown preset (professionals, aspiringEntrepreneurs, generalPublic, etc.)
- `audienceExpertise`: beginner/intermediate/advanced
- `bookGoal`: personalBranding, leadGeneration, teaching, etc.
- `toneSlider`: 0-1 (formal → conversational)
- `narrativeStyle`: narrative, didactic, analytical, mixed
- `chapterLength`: concise(1000), standard(2000), detailed(3000)
- `sentenceComplexity`: simple, medium, complex
- Parametri AI avanzati: temperature, maxTokens, topP, etc.
- Custom prompts (optional overrides)

**Azioni**:
```bash
# Modificare schema.prisma
# Creare migration
npx prisma migrate dev --name add_ai_config

# Generare Prisma client
npx prisma generate
```

### 1.2 TypeScript Types

**File**: `types/index.ts`

**Modifiche**:
1. Aggiungere interfacce per AI Config
2. Aggiungere types per audience presets
3. Aggiungere types per goal presets
4. Aggiungere types per prompt builder options

**Nuovi types**:
```typescript
export interface ProjectAIConfig {
  // ... tutti i campi del database
}

export interface AudiencePreset {
  name: string;
  description: string;
  instructions: string;
  sentenceMaxWords: number;
  vocabLevel: string;
}

export interface AIConfigFormData {
  // ... per il form UI
}
```

### 1.3 Creazione Default Config

**File**: `lib/ai/config/defaults.ts` (NEW)

**Contenuto**:
- Valori di default per nuovi progetti
- Funzione `createDefaultAIConfig(projectId: string)`
- Costanti per limiti e validazioni

**Output dello Step 1**:
- ✅ Database schema esteso
- ✅ Migration eseguita
- ✅ Types TypeScript definiti
- ✅ Default config ready
- ✅ Nessun breaking change

---

## STEP 2: Prompt Builder & AI Integration

**Durata stimata**: 1-2 ore  
**File coinvolti**: 6-8  
**Breaking changes**: No (backward compatible)

### 2.1 Audience Presets

**File**: `lib/ai/config/audience-presets.ts` (NEW)

**Contenuto**:
Definire tutti i preset di audience con istruzioni dettagliate:

1. **Professionals** - Colleghi esperti del settore
2. **Aspiring Entrepreneurs** - Chi vuole iniziare
3. **General Public** - Lettori curiosi non esperti
4. **Executives/C-Level** - Decisori senior
5. **Students** - Giovani 18-25 anni
6. **Children (5-10)** - Bambini età scolare ⚠️ CASO CRITICO
7. **Custom** - Definito dall'utente

**Ogni preset include**:
```typescript
{
  name: string,
  description: string,
  instructions: string, // Istruzioni dettagliate per l'AI
  sentenceMaxWords: number,
  vocabLevel: string,
  examples: {
    correct: string,
    incorrect: string
  }
}
```

### 2.2 Goal Presets

**File**: `lib/ai/config/goal-presets.ts` (NEW)

**Contenuto**:
Definire preset per obiettivi del libro:

1. **Personal Branding** - Posizionamento come esperto
2. **Lead Generation** - Acquisizione clienti
3. **Teaching/Education** - Trasferimento conoscenza
4. **Inspirational** - Motivazione e journey
5. **Manifesto** - Visione/metodologia innovativa

### 2.3 Style Configuration

**File**: `lib/ai/config/style-config.ts` (NEW)

**Contenuto**:
- Mapping `toneSlider` → istruzioni concrete
- Mapping `narrativeStyle` → pattern narrativi
- Mapping `sentenceComplexity` → regole sintattiche
- Mapping `paragraphLength` → struttura paragrafi

### 2.4 Prompt Builder Core

**File**: `lib/ai/prompt-builder.ts` (NEW)

**Contenuto**:
Classe `PromptBuilder` con metodi:

```typescript
class PromptBuilder {
  // Costruisce istruzioni audience-specific
  static buildAudienceInstructions(config: ProjectAIConfig): string
  
  // Costruisce istruzioni per il tono
  static buildToneInstructions(config: ProjectAIConfig): string
  
  // Costruisce regole per frasi
  static buildSentenceInstructions(config: ProjectAIConfig): string
  
  // Costruisce istruzioni per paragrafi
  static buildParagraphInstructions(config: ProjectAIConfig): string
  
  // Costruisce istruzioni per goal del libro
  static buildGoalInstructions(config: ProjectAIConfig): string
  
  // MAIN: Costruisce system prompt completo
  static buildSystemPrompt(
    project: Project, 
    config: ProjectAIConfig
  ): string
  
  // MAIN: Costruisce chapter prompt con config
  static buildChapterPrompt(
    context: ChapterContext,
    config: ProjectAIConfig
  ): string
}
```

**Logica chiave**:
- Se `useCustomPrompts = true` → usa custom prompt
- Altrimenti → costruisci dinamicamente dai preset
- Applica tutte le regole specifiche per audience

### 2.5 Integration con Chapter Generation Service

**File**: `lib/ai/services/chapter-generation.ts` (MODIFY)

**Modifiche**:
1. Caricare `ProjectAIConfig` nel `buildContext()`
2. Passare config al `PromptBuilder`
3. Usare parametri AI da config (temperature, maxTokens, etc.)
4. Aggiornare chiamata OpenAI con nuovi parametri

```typescript
// Prima
const context = await this.buildContext(projectId, chapterNumber);

// Dopo
const context = await this.buildContext(projectId, chapterNumber);
const aiConfig = await this.loadAIConfig(projectId); // NEW

// Genera prompt con config
const systemPrompt = PromptBuilder.buildSystemPrompt(
  context.project, 
  aiConfig
);
const userPrompt = PromptBuilder.buildChapterPrompt(
  context,
  aiConfig
);

// Chiamata OpenAI con parametri da config
const response = await openai.chat.completions.create({
  model: aiConfig.model,
  temperature: aiConfig.temperature,
  max_tokens: aiConfig.maxTokens,
  top_p: aiConfig.topP,
  frequency_penalty: aiConfig.frequencyPenalty,
  presence_penalty: aiConfig.presencePenalty,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]
});
```

### 2.6 Integration con Outline Generation

**File**: `lib/ai/prompts/outline-generator.ts` (MODIFY)

**Modifiche**:
1. Modificare `generateOutlinePrompt()` per accettare `AIConfig`
2. Integrare istruzioni audience nel prompt outline
3. Applicare stile e tono anche all'outline

### 2.7 API Endpoint per AI Config

**File**: `app/api/projects/[id]/ai-config/route.ts` (NEW)

**Endpoints**:
```typescript
GET    /api/projects/[id]/ai-config        // Recupera config
POST   /api/projects/[id]/ai-config        // Crea config (se non esiste)
PUT    /api/projects/[id]/ai-config        // Aggiorna config
PATCH  /api/projects/[id]/ai-config/test   // Testa config con sample output
DELETE /api/projects/[id]/ai-config        // Reset a default
```

**Output dello Step 2**:
- ✅ Preset audience completi con istruzioni dettagliate
- ✅ Prompt Builder funzionante
- ✅ Integration con chapter generation
- ✅ Integration con outline generation
- ✅ API endpoints per gestire config
- ✅ Backward compatible (default config se non esiste)

---

## STEP 3: UI - AI Settings Tab & Components

**Durata stimata**: 2-3 ore  
**File coinvolti**: 5-7  
**Breaking changes**: No

### 3.1 AI Settings Panel Component

**File**: `components/AISettingsPanel.tsx` (NEW)

**Struttura**:
```typescript
export default function AISettingsPanel({ projectId }: Props) {
  const [config, setConfig] = useState<ProjectAIConfig | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Sezioni:
  // 1. Target Audience
  // 2. Book Goal
  // 3. Writing Style (tone slider + narrative style)
  // 4. Chapter Settings
  // 5. Preview/Test Output
  // 6. Advanced Settings (collapsible)
  
  return (
    <div className="space-y-6">
      {/* Simple Mode */}
      <SimpleSettings config={config} onChange={handleChange} />
      
      {/* Toggle Advanced */}
      <AdvancedToggle 
        isAdvanced={isAdvancedMode}
        onToggle={() => setIsAdvancedMode(!isAdvancedMode)}
      />
      
      {/* Advanced Mode (conditional) */}
      {isAdvancedMode && (
        <AdvancedSettings config={config} onChange={handleChange} />
      )}
      
      {/* Test Output */}
      <TestOutputSection 
        projectId={projectId}
        config={config}
        onTest={handleTest}
      />
      
      {/* Save/Reset Buttons */}
      <ActionButtons onSave={handleSave} onReset={handleReset} />
    </div>
  );
}
```

### 3.2 Simple Settings Components

**File**: `components/ai-settings/SimpleSettings.tsx` (NEW)

**Sezioni**:
1. **Audience Selector**
   - Dropdown con preset
   - Descrizione del preset selezionato
   - Campo età (opzionale)
   - Expertise level (beginner/intermediate/advanced)

2. **Book Goal Selector**
   - Radio buttons o dropdown
   - Descrizione obiettivo

3. **Writing Style Controls**
   - Slider visuale per tono (Formal ←→ Conversational)
   - Radio buttons per narrative style
   - Visual feedback in tempo reale

4. **Chapter Settings**
   - Radio buttons per lunghezza (concise/standard/detailed)
   - Dropdown sentence complexity
   - Dropdown paragraph length

### 3.3 Advanced Settings Component

**File**: `components/ai-settings/AdvancedSettings.tsx` (NEW)

**Sezioni**:
1. **AI Model Parameters**
   - Temperature slider (0-2) con tooltip
   - Max Tokens input
   - Top P slider
   - Frequency Penalty slider
   - Presence Penalty slider
   - Model selector (gpt-4o-mini, gpt-4o, gpt-4-turbo)

2. **Custom Prompts Editor**
   - Toggle "Use Custom Prompts"
   - Tabs: System Prompt | Outline Instructions | Chapter Instructions
   - Monaco Editor o textarea con syntax highlighting
   - Template variables helper
   - Reset to default button per ogni prompt

3. **Warning Banner**
   ```
   ⚠️ Modalità Avanzata
   Modifica questi parametri solo se conosci il loro funzionamento.
   Configurazioni errate possono produrre risultati scadenti.
   ```

### 3.4 Test Output Component

**File**: `components/ai-settings/TestOutputSection.tsx` (NEW)

**Funzionalità**:
- Bottone "Genera Esempio"
- Loading state durante generazione
- Display del testo generato
- Analisi automatica:
  - Lunghezza media frasi
  - Vocabolario usato
  - Tono rilevato
  - Conformità alle istruzioni
- Bottone "Rigenera" e "Salva Configurazione"

### 3.5 Preset Cards/Helpers

**File**: `components/ai-settings/AudiencePresetCard.tsx` (NEW)

**Contenuto**:
Card espandibile per ogni preset con:
- Nome e descrizione
- Icona rappresentativa
- Esempi di output (corretto vs scorretto)
- Target words per frase
- Livello vocabolario
- Badge "Raccomandato per..." 

### 3.6 Integration nella Project Page

**File**: `app/progetti/[id]/page.tsx` (MODIFY)

**Modifiche**:
1. Aggiungere tab "AI Settings" tra "Panoramica" e "Outline"
2. Importare `AISettingsPanel`
3. Gestire stato tab attivo
4. Passare projectId al panel

```typescript
const tabs = [
  { id: 'panoramica', label: 'Panoramica', icon: BookOpen },
  { id: 'ai-settings', label: '⚙️ AI Settings', icon: Settings }, // NEW
  { id: 'outline', label: 'Outline', icon: List },
  { id: 'capitoli', label: 'Capitoli', icon: FileText },
  { id: 'esporta', label: 'Esporta', icon: Download },
];

// Render
{activeTab === 'ai-settings' && (
  <AISettingsPanel projectId={params.id} />
)}
```

### 3.7 Visual Design Guidelines

**Principi**:
- **Progressive Disclosure**: Simple mode → Advanced mode
- **Visual Feedback**: Sliders con preview in tempo reale
- **Contextual Help**: Tooltip su ogni parametro
- **Safety**: Warning per advanced mode
- **Testing**: Easy test before committing
- **Responsive**: Mobile-friendly (se necessario)

**Color Coding**:
- 🟢 Simple Mode: Verde/Blu (safe, recommended)
- 🟡 Advanced Mode: Arancione (caution)
- 🔴 Custom Prompts: Rosso (expert only)

**Output dello Step 3**:
- ✅ AI Settings tab integrata nella project page
- ✅ Simple mode UI completa e user-friendly
- ✅ Advanced mode UI con tutti i parametri
- ✅ Test output functionality
- ✅ Preset cards con esempi
- ✅ Save/Reset/Test actions
- ✅ Responsive e accessibile

---

## STEP 4: Testing & Validation

**Durata stimata**: 1-2 ore  
**File coinvolti**: 3-4  
**Breaking changes**: No

### 4.1 Unit Tests per Prompt Builder

**File**: `lib/ai/__tests__/prompt-builder.test.ts` (NEW)

**Test cases**:
1. ✅ Audience presets generano istruzioni corrette
2. ✅ Tone slider mappa correttamente a istruzioni
3. ✅ Sentence complexity applica regole giuste
4. ✅ Custom prompts override defaults
5. ✅ Children audience ha regole ultra-strict
6. ✅ Professional audience ha terminologia avanzata

### 4.2 Integration Tests

**File**: `lib/ai/__tests__/chapter-generation-with-config.test.ts` (NEW)

**Test cases**:
1. ✅ Config viene caricata correttamente
2. ✅ Prompt include istruzioni audience
3. ✅ Parametri AI vengono applicati
4. ✅ Default config funziona per progetti legacy
5. ✅ Custom prompts funzionano

### 4.3 Real-World Validation

**Test Case Principale**: "Bambini di 5 anni"

**Procedura**:
1. Creare nuovo progetto
2. Impostare audience = "children_5_10"
3. Impostare audienceAge = "5-7"
4. Generare sample output
5. Validare che:
   - Frasi ≤ 8 parole
   - Vocabolario semplice
   - Concetti concreti
   - Nessun termine tecnico

**Altri Test Cases**:
1. **Professional → General Public**
   - Verificare che termini tecnici vengano spiegati
   
2. **Formal → Conversational**
   - Verificare cambio di tono nel testo
   
3. **Narrative → Didactic**
   - Verificare cambio di stile narrativo

4. **Custom Prompt Override**
   - Verificare che custom prompt venga usato

### 4.4 Performance Testing

**Metriche**:
- Tempo caricamento AI Config: < 100ms
- Tempo generazione sample: < 10s
- Nessun impatto su generazione capitoli esistenti

### 4.5 Documentation

**File**: `docs/AI_CONFIGURATION.md` (NEW)

**Contenuto**:
1. Overview del sistema
2. Guida ai preset audience
3. Come scegliere il preset giusto
4. Spiegazione parametri avanzati
5. Template variables reference
6. Best practices
7. Troubleshooting
8. Examples per ogni preset

**Output dello Step 4**:
- ✅ Unit tests passano
- ✅ Integration tests passano
- ✅ Caso "bambini 5 anni" risolto
- ✅ Performance OK
- ✅ Documentazione completa
- ✅ System production-ready

---

## 📊 Riepilogo Finale

### File Nuovi Creati
```
prisma/migrations/XXXXXX_add_ai_config/migration.sql
lib/ai/config/defaults.ts
lib/ai/config/audience-presets.ts
lib/ai/config/goal-presets.ts
lib/ai/config/style-config.ts
lib/ai/prompt-builder.ts
app/api/projects/[id]/ai-config/route.ts
components/AISettingsPanel.tsx
components/ai-settings/SimpleSettings.tsx
components/ai-settings/AdvancedSettings.tsx
components/ai-settings/TestOutputSection.tsx
components/ai-settings/AudiencePresetCard.tsx
lib/ai/__tests__/prompt-builder.test.ts
lib/ai/__tests__/chapter-generation-with-config.test.ts
docs/AI_CONFIGURATION.md
```

### File Modificati
```
prisma/schema.prisma
types/index.ts
lib/ai/services/chapter-generation.ts
lib/ai/prompts/outline-generator.ts
app/progetti/[id]/page.tsx
```

### Breaking Changes
**Nessuno** - Tutto è backward compatible:
- Progetti esistenti: usano default config automaticamente
- API esistenti: continuano a funzionare
- UI esistente: nuovo tab non interferisce

### Impatto Database
- 1 nuova tabella: `ProjectAIConfig`
- 1 nuova relation in `Project`
- Migration reversibile (se necessario)

### Tempo Totale Stimato
- Step 1: 30-45 min
- Step 2: 1-2 ore
- Step 3: 2-3 ore
- Step 4: 1-2 ore
- **TOTALE**: 5-8 ore di sviluppo

### Deliverables
1. ✅ Sistema configurazione AI completo
2. ✅ Problema "target audience ignorato" risolto
3. ✅ UI intuitiva per utenti business
4. ✅ Advanced mode per power users
5. ✅ Documentazione completa
6. ✅ Tests e validazione
7. ✅ Production-ready

---

## 🚀 Prossimi Passi

Dopo conferma dell'approccio:

1. **Iniziamo con Step 1**: Database & Types
2. Procediamo incrementalmente
3. Test dopo ogni step
4. Deploy graduale

**Domande?** Modifichiamo il piano ora prima di iniziare l'implementazione.
