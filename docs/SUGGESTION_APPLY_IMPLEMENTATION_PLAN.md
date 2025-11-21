# 🎯 Piano di Implementazione: Apply Consistency Suggestions

**Data creazione**: 21 Novembre 2025  
**Versione**: 1.0  
**Autore**: AI Development Team  
**Status**: Ready for Review

---

## 📋 EXECUTIVE SUMMARY

**Obiettivo**: Implementare sistema di applicazione automatica dei suggerimenti del consistency check con preview diff, mantenendo backward compatibility e zero breaking changes.

**Approccio**: Incrementale, feature-flaggable, basato su infrastruttura esistente (versioning, API, consistency report).

**Timeline stimata**: 2-3 settimane (3 sprint)

**Risk Level**: BASSO ✅ (leveraging existing robust infrastructure)

---

## 🔍 ANALISI CRITICA PRELIMINARE

### ✅ Asset Riutilizzabili (ZERO refactoring necessario)

| Componente | Status | Path | Riuso |
|------------|--------|------|-------|
| **Versioning System** | ✅ Production | `prisma/schema.prisma` | `previousContent`, `previousContentSavedAt` |
| **Undo API** | ✅ Production | `app/api/projects/[id]/chapters/[chapterNumber]/undo/route.ts` | Undo mechanism completo |
| **Modal Component** | ✅ Production | `components/Modal.tsx` | Size `xl/full` support |
| **Toast System** | ✅ Production | `lib/ui/toast.ts` | Presets + error handling |
| **Error Display** | ✅ Production | `components/ErrorDisplay.tsx` | + `useErrorHandler` hook |
| **ConsistencyReport Types** | ✅ Production | `types/index.ts` | `ConsistencyIssue` con `suggestion` field |
| **Chapter API** | ✅ Production | `app/api/projects/[id]/chapters/[chapterNumber]/route.ts` | PUT con auto-backup |
| **AI Service** | ✅ Production | `lib/ai/services/chapter-generation.ts` | Classe estendibile |
| **Logger** | ✅ Production | `lib/logger.ts` | Structured logging |
| **GPT-5 Integration** | ✅ Production | `lib/ai/responses-api.ts` | `callGPT5JSON` + reasoning effort |

### ⚠️ Gap Analysis (Cosa Manca)

#### Backend:
- ❌ Endpoint `/api/projects/[id]/suggestions/apply`
- ❌ AI Service method `applySuggestion()`
- ❌ Prompt per generazione diff preciso

#### Frontend:
- ❌ Component `DiffViewerModal.tsx`
- ❌ Integration in `ConsistencyTab` con bottone "Preview"
- ❌ State management per apply workflow

#### Types:
- ❌ `ApplySuggestionResult` interface
- ❌ `DiffChange` interface
- ❌ `SuggestionApplyRequest` interface

---

## 🏗️ ARCHITETTURA - Clean & DRY

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERACTION                     │
│  ConsistencyTab → SuggestionCard → [Preview] button     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND ORCHESTRATOR                   │
│  handlePreviewSuggestion() → API call → Loading state   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                     │
│  POST /api/projects/[id]/suggestions/apply              │
│    ├─ Validate suggestion                               │
│    ├─ Call AI Service                                   │
│    └─ Return diff or apply                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   AI SERVICE LAYER                       │
│  applySuggestion(projectId, chapterNum, issue, preview) │
│    ├─ Get chapter content                               │
│    ├─ Call GPT-5 with precise prompt                    │
│    ├─ Parse AI response (targetText + newText)          │
│    └─ Return diff OR apply to chapter                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  REUSE: Chapter.update() with previousContent backup    │
│  (Already exists - NO NEW CODE)                         │
└─────────────────────────────────────────────────────────┘
```

### Design Principles

1. **DRY (Don't Repeat Yourself)**: Riusa 80%+ della codebase esistente
2. **Single Responsibility**: Ogni layer ha un unico scopo
3. **Open/Closed**: Estende senza modificare componenti esistenti
4. **Dependency Injection**: Service layer disaccoppiato da API
5. **Fail-Safe**: Ogni operazione è reversibile (undo)

---

## 📦 SPRINT 1: Backend Foundation (3-4 giorni)

### Task 1.1: Extend Types

**File**: `types/index.ts`

**Action**: Aggiungi al file esistente (dopo `ConsistencyReport` interface)

```typescript
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
```

**✅ Acceptance Criteria**:
- [ ] Types compilano senza errori TypeScript
- [ ] Export corretti
- [ ] JSDocs completi

---

### Task 1.2: AI Service - Apply Suggestion Method

**File**: `lib/ai/services/chapter-generation.ts`

**Action**: Aggiungi metodi alla classe `ChapterGenerationService` esistente (dopo `finalConsistencyCheck`)

```typescript
    /**
     * Applica o genera preview di un suggerimento del consistency check
     */
    async applySuggestion(
        projectId: string,
        chapterNumber: number,
        issue: ConsistencyIssue,
        previewOnly: boolean = true
    ): Promise<ApplySuggestionResult> {
        logger.info('🔧 Applying consistency suggestion', { 
            projectId, 
            chapterNumber, 
            issueType: issue.type,
            preview: previewOnly 
        });

        try {
            // 1. Carica il capitolo corrente
            const chapter = await prisma.chapter.findUnique({
                where: { projectId_chapterNumber: { projectId, chapterNumber } },
                select: { content: true, wordCount: true }
            });

            if (!chapter) {
                throw new Error(`Capitolo ${chapterNumber} non trovato`);
            }

            // 2. Genera prompt per AI
            const prompt = this.generateApplySuggestionPrompt(
                chapter.content,
                chapterNumber,
                issue
            );

            // 3. Chiama GPT-5 per generare modifiche precise
            const reasoningEffort = getReasoningEffortForTask('suggestion-apply');
            logger.info('🤖 Chiamata GPT-5 per applicazione suggestion', { 
                reasoningEffort, 
                chapterNumber 
            });

            const aiResponse = await callGPT5JSON<{
                modificationType: 'deletion' | 'replacement' | 'addition';
                targetText: string;
                newText?: string;
                reasoning: string;
                confidence: number;
            }>(prompt, {
                model: 'gpt-5-mini',
                reasoningEffort: reasoningEffort,
                verbosity: 'medium',
                maxOutputTokens: 2000,
            });

            // 4. Valida confidence AI
            if (aiResponse.confidence < 0.7) {
                throw new Error(
                    'Suggestion troppo ambigua per applicazione automatica. ' +
                    'Richiede revisione manuale.'
                );
            }

            // 5. Genera nuovo contenuto
            const newContent = this.applyChange(
                chapter.content,
                aiResponse.targetText,
                aiResponse.newText || '',
                aiResponse.modificationType
            );

            // 6. Calcola metriche
            const oldWords = chapter.content.split(/\s+/).length;
            const newWords = newContent.split(/\s+/).length;
            const wordsChanged = Math.abs(newWords - oldWords);
            const percentageChanged = (wordsChanged / oldWords) * 100;

            // 7. Se preview, ritorna diff
            if (previewOnly) {
                return {
                    success: true,
                    diff: {
                        chapterNumber,
                        oldContent: chapter.content,
                        newContent,
                        changes: [{
                            type: aiResponse.modificationType,
                            targetText: aiResponse.targetText,
                            newText: aiResponse.newText,
                            lineStart: this.findLineNumber(chapter.content, aiResponse.targetText),
                            lineEnd: this.findLineNumber(chapter.content, aiResponse.targetText) + 
                                    this.countLines(aiResponse.targetText),
                            reasoning: aiResponse.reasoning
                        }],
                        estimatedCost: 0.03, // Stima basata su token usage
                        wordsChanged,
                        percentageChanged: Math.round(percentageChanged * 10) / 10
                    }
                };
            }

            // 8. Se apply, salva con versioning esistente
            const updatedChapter = await prisma.chapter.update({
                where: { projectId_chapterNumber: { projectId, chapterNumber } },
                data: {
                    content: newContent,
                    wordCount: newWords,
                    previousContent: chapter.content,  // ✅ Riuso versioning esistente
                    previousContentSavedAt: new Date(),
                    lastModifiedBy: 'ai_suggestion',
                    updatedAt: new Date()
                }
            });

            logger.info('✅ Suggestion applied successfully', { 
                projectId, 
                chapterNumber, 
                wordsChanged 
            });

            return {
                success: true,
                chapter: updatedChapter
            };

        } catch (error: any) {
            logger.error('❌ Error applying suggestion', error, { 
                projectId, 
                chapterNumber 
            });
            
            return {
                success: false,
                error: error.message || 'Errore durante l\'applicazione del suggerimento'
            };
        }
    }

    /**
     * Genera prompt per applicazione suggestion
     */
    private generateApplySuggestionPrompt(
        chapterContent: string,
        chapterNumber: number,
        issue: ConsistencyIssue
    ): string {
        return `Sei un editor esperto. Il tuo compito è applicare con PRECISIONE CHIRURGICA una modifica a un capitolo.

---

# CONTENUTO CAPITOLO ${chapterNumber}

${chapterContent}

---

# PROBLEMA RILEVATO

**Tipo**: ${issue.type}
**Severità**: ${issue.severity}
**Descrizione**: ${issue.description}

# SUGGERIMENTO DA APPLICARE

${issue.suggestion}

---

# IL TUO COMPITO

Identifica il **testo ESATTO** da modificare e genera la modifica precisa.

**REGOLE CRITICHE**:
1. \`targetText\` deve essere LETTERALE (copia-incolla esatto dal capitolo)
2. Include almeno 10-20 parole di contesto per identificazione univoca
3. Se la modifica è vaga o ambigua, setta \`confidence\` < 0.7
4. Mantieni SEMPRE lo stile dell'autore
5. NON modificare oltre lo stretto necessario

---

# OUTPUT FORMAT

Rispondi con JSON valido:

\`\`\`json
{
  "modificationType": "deletion" | "replacement" | "addition",
  "targetText": "Testo ESATTO da modificare (include contesto circostante)",
  "newText": "Nuovo testo (solo per replacement/addition)",
  "reasoning": "Breve spiegazione della modifica (1 frase)",
  "confidence": 0.0-1.0 (quanto sei sicuro che questa modifica sia corretta)
}
\`\`\`

**Esempi**:

\`\`\`json
{
  "modificationType": "replacement",
  "targetText": "La Triade TDL è un framework che comprende Teoria, Design e Leadership - tre pilastri fondamentali per il successo imprenditoriale.",
  "newText": "La Triade TDL [già introdotta nel Cap. 1] è essenziale per il successo.",
  "reasoning": "Snellita ripetizione già presente in capitolo precedente",
  "confidence": 0.95
}
\`\`\`

Sii PRECISO e CONSERVATIVO. In dubbio, setta confidence bassa.`;
    }

    /**
     * Applica la modifica al contenuto
     */
    private applyChange(
        content: string,
        targetText: string,
        newText: string,
        type: 'deletion' | 'replacement' | 'addition'
    ): string {
        switch (type) {
            case 'deletion':
                return content.replace(targetText, '');
            case 'replacement':
                return content.replace(targetText, newText);
            case 'addition':
                // Per addition, targetText identifica il punto di inserimento
                return content.replace(targetText, targetText + '\n\n' + newText);
            default:
                return content;
        }
    }

    /**
     * Helper: trova numero di riga di un testo
     */
    private findLineNumber(content: string, searchText: string): number {
        const index = content.indexOf(searchText);
        if (index === -1) return 0;
        return content.substring(0, index).split('\n').length;
    }

    /**
     * Helper: conta righe in un testo
     */
    private countLines(text: string): number {
        return text.split('\n').length;
    }
```

**✅ Acceptance Criteria**:
- [ ] Method compila senza errori
- [ ] Riusa `callGPT5JSON` esistente
- [ ] Riusa sistema versioning con `previousContent`
- [ ] Error handling robusto
- [ ] Logging strutturato
- [ ] Unit tests passano

---

### Task 1.3: AI Config - Add Task Type

**File**: `lib/ai/config/reasoning-effort-config.ts`

**Action**: Aggiungi nuovo task type alla mappa esistente

```typescript
// Trova la mappa REASONING_EFFORT_MAP e aggiungi:

'suggestion-apply': 'medium',  // Balanced: accuracy importante ma non critical
```

**Rationale**: Medium reasoning per bilanciare accuracy e costi.

---

### Task 1.4: API Endpoint - Apply Suggestion

**Nuovo File**: `app/api/projects/[id]/suggestions/apply/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { chapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { ConsistencyIssue } from '@/types';

/**
 * POST /api/projects/[id]/suggestions/apply
 * Applica o genera preview di un suggerimento del consistency check
 * 
 * Body:
 * {
 *   issue: ConsistencyIssue,
 *   chapterNumber: number,
 *   preview: boolean  // true = solo diff, false = apply
 * }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const body = await request.json();

        const { issue, chapterNumber, preview = true } = body as {
            issue: ConsistencyIssue;
            chapterNumber: number;
            preview: boolean;
        };

        // Validation
        if (!issue || !chapterNumber) {
            return NextResponse.json(
                { error: 'Parametri mancanti: issue e chapterNumber richiesti' },
                { status: 400 }
            );
        }

        if (!issue.chapter || !issue.description || !issue.suggestion) {
            return NextResponse.json(
                { error: 'Issue malformato: chapter, description e suggestion richiesti' },
                { status: 400 }
            );
        }

        logger.info('📝 Suggestion apply request', { 
            projectId, 
            chapterNumber, 
            preview, 
            issueType: issue.type,
            issueSeverity: issue.severity
        });

        // Chiama service
        const result = await chapterGenerationService.applySuggestion(
            projectId,
            chapterNumber,
            issue,
            preview
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        logger.info('✅ Suggestion request completed', { 
            projectId, 
            chapterNumber, 
            preview,
            success: result.success 
        });

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        logger.error('Error in suggestion apply endpoint', error);

        return NextResponse.json(
            { 
                error: error.message || 'Errore durante l\'applicazione del suggerimento',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
```

**✅ Acceptance Criteria**:
- [ ] Endpoint accessibile via POST
- [ ] Validation completa
- [ ] Error handling robusto
- [ ] Logging strutturato
- [ ] Rispetta pattern API esistenti
- [ ] Integration tests passano

---

## 📦 SPRINT 2: Frontend Components (4-5 giorni)

### Task 2.1: Diff Viewer Modal Component

**Nuovo File**: `components/DiffViewerModal.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { DiffChange, ApplySuggestionResult, ConsistencyIssue } from '@/types';
import { AlertCircle, Check, X, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import { logger } from '@/lib/logger';

interface DiffViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    issue: ConsistencyIssue;
    chapterNumber: number;
    projectId: string;
    onApplied: () => void;  // Callback quando modifica applicata
}

export default function DiffViewerModal({
    isOpen,
    onClose,
    issue,
    chapterNumber,
    projectId,
    onApplied
}: DiffViewerModalProps) {
    const [loading, setLoading] = useState(false);
    const [diffData, setDiffData] = useState<ApplySuggestionResult['diff'] | null>(null);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch preview on open
    useEffect(() => {
        if (isOpen && !diffData && !loading) {
            handleLoadPreview();
        }
    }, [isOpen]);

    const handleLoadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/suggestions/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue,
                    chapterNumber,
                    preview: true
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore durante la generazione del preview');
            }

            const data = await response.json();
            setDiffData(data.diff);
            logger.info('✅ Preview loaded', { chapterNumber, wordsChanged: data.diff?.wordsChanged });

        } catch (err: any) {
            logger.error('❌ Error loading preview', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!diffData) return;

        if (!confirm(`Applicare questa modifica al Capitolo ${chapterNumber}? La versione precedente sarà salvata e potrai fare undo.`)) {
            return;
        }

        setApplying(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/suggestions/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue,
                    chapterNumber,
                    preview: false  // Apply for real
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore durante l\'applicazione');
            }

            toast.success(`✅ Modifica applicata al Cap. ${chapterNumber}!`);
            onApplied();  // Trigger refresh
            onClose();

        } catch (err: any) {
            logger.error('❌ Error applying suggestion', err);
            toast.error(err.message);
        } finally {
            setApplying(false);
        }
    };

    const handleRegenerate = () => {
        setDiffData(null);
        setError(null);
        handleLoadPreview();
    };

    const getChangeColor = (type: string) => {
        switch (type) {
            case 'deletion': return 'bg-red-50 border-red-200';
            case 'replacement': return 'bg-yellow-50 border-yellow-200';
            case 'addition': return 'bg-green-50 border-green-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const highlightText = (text: string, changes: DiffChange[], view: 'old' | 'new') => {
        let highlighted = text;
        
        changes.forEach((change) => {
            if (view === 'old' && (change.type === 'deletion' || change.type === 'replacement')) {
                // Highlight removed text in red
                highlighted = highlighted.replace(
                    change.targetText,
                    `<mark class="bg-red-200 text-red-900 px-1 rounded">${change.targetText}</mark>`
                );
            } else if (view === 'new' && (change.type === 'replacement' || change.type === 'addition') && change.newText) {
                // Highlight new text in green
                highlighted = highlighted.replace(
                    change.newText,
                    `<mark class="bg-green-200 text-green-900 px-1 rounded">${change.newText}</mark>`
                );
            }
        });

        return highlighted;
    };

    return (
        <Modal
            isOpen={isOpen}
            onCloseAction={onClose}
            title={`Preview Modifica - Capitolo ${chapterNumber}`}
            size="full"
        >
            <div className="space-y-4">
                {/* Issue Context */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Problema Rilevato</h3>
                            <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                            <div className="bg-white rounded p-3 border border-orange-100">
                                <p className="text-sm text-gray-600">
                                    <strong className="text-purple-600">💡 Suggerimento AI:</strong> {issue.suggestion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                        <p className="text-gray-600 font-medium">Generazione proposta di modifica...</p>
                        <p className="text-sm text-gray-500 mt-2">
                            L&apos;AI sta analizzando il capitolo (10-20 secondi)
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-red-800 font-medium mb-2">{error}</p>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Riprova
                            </button>
                        </div>
                    </div>
                )}

                {/* Diff View */}
                {diffData && !loading && (
                    <>
                        {/* Split View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
                            {/* Original */}
                            <div className="bg-red-50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <X size={16} className="text-red-600" />
                                    <h4 className="font-semibold text-red-900">📄 Originale</h4>
                                </div>
                                <div className="bg-white rounded p-4 max-h-96 overflow-y-auto border border-red-200">
                                    <div 
                                        className="text-sm text-gray-700 whitespace-pre-wrap font-mono"
                                        dangerouslySetInnerHTML={{ 
                                            __html: highlightText(diffData.oldContent, diffData.changes, 'old') 
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Modified */}
                            <div className="bg-green-50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check size={16} className="text-green-600" />
                                    <h4 className="font-semibold text-green-900">✨ Con Modifica</h4>
                                </div>
                                <div className="bg-white rounded p-4 max-h-96 overflow-y-auto border border-green-200">
                                    <div 
                                        className="text-sm text-gray-700 whitespace-pre-wrap font-mono"
                                        dangerouslySetInnerHTML={{ 
                                            __html: highlightText(diffData.newContent, diffData.changes, 'new') 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Impact Metrics */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-3">📊 Impatto Modifica</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-600 font-medium mb-1">Parole modificate</p>
                                    <p className="text-2xl font-bold text-blue-900">{diffData.wordsChanged}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium mb-1">Percentuale</p>
                                    <p className="text-2xl font-bold text-blue-900">{diffData.percentageChanged}%</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium mb-1">Tipo modifica</p>
                                    <p className="text-lg font-semibold text-blue-900 capitalize">
                                        {diffData.changes[0]?.type || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium mb-1">Costo stima</p>
                                    <p className="text-2xl font-bold text-blue-900">${diffData.estimatedCost.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Change Reasoning */}
                            {diffData.changes[0]?.reasoning && (
                                <div className="mt-4 p-3 bg-white rounded border border-blue-100">
                                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Rationale AI</p>
                                    <p className="text-sm text-gray-700">{diffData.changes[0].reasoning}</p>
                                </div>
                            )}
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-sm">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-yellow-800">
                                ⚠️ L&apos;applicazione di questa modifica potrebbe invalidare altri suggerimenti. 
                                Considera di rigenerare il consistency report dopo l&apos;applicazione.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                ❌ Rifiuta
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <RotateCcw size={16} />
                                🔄 Rigenera
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Applicando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        ✅ Applica
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
```

**✅ Acceptance Criteria**:
- [ ] Modal si apre correttamente
- [ ] Loading state visible
- [ ] Error handling funziona
- [ ] Diff highlighting leggibile
- [ ] Actions (Apply/Reject/Regenerate) funzionano
- [ ] Responsive design
- [ ] Accessibilità (WCAG AA)

---

### Task 2.2: Update ConsistencyTab

**File**: `app/progetti/[id]/page.tsx`

**Action**: Modifica la function `ConsistencyTab` 

**Step 1**: Aggiungi import in alto al file

```typescript
import DiffViewerModal from '@/components/DiffViewerModal';
```

**Step 2**: Aggiungi stato all'inizio della function `ConsistencyTab` (dopo `const [runningCheck, setRunningCheck]`)

```typescript
const [selectedIssue, setSelectedIssue] = useState<{
    issue: ConsistencyIssue;
    chapterNumber: number;
} | null>(null);
```

**Step 3**: Trova il rendering delle issues e modifica per aggiungere bottone "Preview"

Cerca questa sezione:
```typescript
{/* Issues Section */}
{(consistencyReport.narrative?.issues?.length > 0 ||
    consistencyReport.style?.issues?.length > 0 ||
    consistencyReport.consistency?.issues?.length > 0) && (
```

E aggiorna il mapping degli issues per includere il bottone:

```typescript
<div className="bg-white rounded-lg border border-orange-200 p-4">
    <div className="flex items-start gap-3">
        <div className={`px-2 py-1 rounded text-xs font-semibold ${
            iss.severity === 'high' ? 'bg-red-100 text-red-700' :
            iss.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
        }`}>
            {iss.severity.toUpperCase()}
        </div>
        <div className="flex-1">
            {iss.chapter && (
                <p className="text-xs text-gray-500 mb-1">Capitolo {iss.chapter}</p>
            )}
            <p className="text-sm text-gray-700 mb-2">{iss.description}</p>
            <div className="bg-purple-50 rounded p-3 border border-purple-100 mb-3">
                <p className="text-sm text-purple-700">
                    <strong>💡 Suggerimento:</strong> {iss.suggestion}
                </p>
            </div>
            
            {/* NUOVO: Bottone Preview (solo se ha chapter number) */}
            {iss.chapter && (
                <button
                    onClick={() => setSelectedIssue({ 
                        issue: iss, 
                        chapterNumber: iss.chapter 
                    })}
                    disabled={generatingChapter !== null || regeneratingChapter !== null}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    🔍 Preview Modifica
                </button>
            )}
        </div>
    </div>
</div>
```

**Step 4**: Aggiungi DiffViewerModal alla fine del return, prima della chiusura del div principale:

```typescript
{/* Diff Viewer Modal */}
{selectedIssue && (
    <DiffViewerModal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue.issue}
        chapterNumber={selectedIssue.chapterNumber}
        projectId={project.id}
        onApplied={async () => {
            await onRefresh();  // Ricarica progetto
            toast.info('💡 Considera di rigenerare il consistency report per verificare l\'impatto');
        }}
    />
)}
```

**✅ Acceptance Criteria**:
- [ ] Bottone "Preview Modifica" appare per ogni issue con chapter number
- [ ] Click su bottone apre DiffViewerModal
- [ ] Modal passa correttamente issue e chapterNumber
- [ ] onApplied trigger refresh
- [ ] UI resta responsive
- [ ] Nessun errore console

---

### Task 2.3: Feature Flag Configuration

**Nuovo File**: `lib/config/feature-flags.ts`

```typescript
/**
 * Feature Flags Configuration
 * 
 * Centralized control for experimental/beta features.
 * Set via environment variables for easy toggle without deployment.
 */

export const FEATURE_FLAGS = {
    /**
     * Enable Apply Consistency Suggestions
     * When disabled, "Preview Modifica" button won't appear
     */
    SUGGESTION_AUTO_APPLY: process.env.NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY === 'true',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURE_FLAGS[flag];
}
```

**File**: `.env.local` (aggiungi)

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY=true
```

**Update ConsistencyTab**: Wrap bottone in feature flag check

```typescript
import { FEATURE_FLAGS } from '@/lib/config/feature-flags';

// Nel rendering del bottone:
{FEATURE_FLAGS.SUGGESTION_AUTO_APPLY && iss.chapter && (
    <button onClick={...}>🔍 Preview Modifica</button>
)}
```

**✅ Acceptance Criteria**:
- [ ] Feature flag funziona
- [ ] Quando false, bottone non appare
- [ ] Quando true, bottone appare
- [ ] No console errors

---

## 📦 SPRINT 3: Testing & Documentation (2-3 giorni)

### Task 3.1: Unit Tests

**Nuovo File**: `tests/unit/ai-services/apply-suggestion.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChapterGenerationService } from '@/lib/ai/services/chapter-generation';
import { ConsistencyIssue } from '@/types';

describe('ChapterGenerationService - applySuggestion', () => {
    let service: ChapterGenerationService;

    beforeEach(() => {
        service = new ChapterGenerationService();
    });

    it('should generate preview diff for deletion', async () => {
        // TODO: Mock prisma and AI calls
        const issue: ConsistencyIssue = {
            type: 'repetition',
            severity: 'medium',
            chapter: 1,
            description: 'Test repetition',
            suggestion: 'Remove duplicate text'
        };

        const result = await service.applySuggestion(
            'test-project-id',
            1,
            issue,
            true
        );

        expect(result.success).toBe(true);
        expect(result.diff).toBeDefined();
    });

    it('should apply suggestion with versioning', async () => {
        // TODO: Test actual application
    });

    it('should reject low confidence suggestions', async () => {
        // TODO: Test confidence threshold
    });
});
```

---

### Task 3.2: Integration Tests

**Nuovo File**: `tests/integration/suggestion-apply-api.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('POST /api/projects/[id]/suggestions/apply', () => {
    it('should return diff for preview request', async () => {
        // TODO: Test API endpoint
    });

    it('should apply suggestion and update chapter', async () => {
        // TODO: Test full apply flow
    });

    it('should handle validation errors', async () => {
        // TODO: Test error cases
    });
});
```

---

### Task 3.3: E2E Tests

**Nuovo File**: `tests/e2e/suggestion-apply.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Apply Consistency Suggestions', () => {
    test('user can preview and apply suggestion', async ({ page }) => {
        // TODO: Full E2E workflow
        // 1. Navigate to project consistency tab
        // 2. Click "Preview Modifica"
        // 3. Wait for diff modal
        // 4. Verify diff content
        // 5. Click "Applica"
        // 6. Verify success toast
        // 7. Verify chapter updated
    });
});
```

---

### Task 3.4: Documentation Updates

#### File 1: `docs/API_DOCUMENTATION.md`

Aggiungi sezione:

```markdown
## POST /api/projects/[id]/suggestions/apply

Applica o genera preview di un suggerimento del consistency check.

### Request Body

```json
{
  "issue": {
    "type": "repetition",
    "severity": "medium",
    "chapter": 3,
    "description": "...",
    "suggestion": "..."
  },
  "chapterNumber": 3,
  "preview": true
}
```

### Response (preview=true)

```json
{
  "success": true,
  "diff": {
    "chapterNumber": 3,
    "oldContent": "...",
    "newContent": "...",
    "changes": [...],
    "estimatedCost": 0.03,
    "wordsChanged": 120,
    "percentageChanged": 2.5
  }
}
```

### Response (preview=false)

```json
{
  "success": true,
  "chapter": { ... }
}
```
```

#### File 2: `docs/COMPONENTS.md`

Aggiungi sezione:

```markdown
## DiffViewerModal

Modal per preview e applicazione di suggerimenti dal consistency check.

### Props

- `isOpen: boolean` - Controlla visibilità modal
- `onClose: () => void` - Callback chiusura
- `issue: ConsistencyIssue` - Issue da applicare
- `chapterNumber: number` - Numero capitolo target
- `projectId: string` - ID progetto
- `onApplied: () => void` - Callback post-applicazione

### Features

- Split view (before/after)
- Impact metrics visualization
- AI reasoning explanation
- Regenerate suggestion option
- One-click apply with undo support
```

#### File 3: `app/changelog/page.tsx`

Aggiungi entry:

```typescript
{
    version: '3.21.0',
    date: '21 Novembre 2025',
    type: 'feature',
    changes: [
        {
            category: 'Consistency Check',
            items: [
                'Nuova funzionalità: Apply Consistency Suggestions',
                'Preview diff interattivo prima di applicare modifiche',
                'Applicazione automatica suggerimenti con AI',
                'Split view per confronto before/after',
                'Metriche di impatto (parole cambiate, percentuale)',
                'Supporto undo automatico con versioning',
                'Feature flag configurabile per rollout graduale',
            ],
        },
        {
            category: 'Developer Experience',
            items: [
                'Nuovo endpoint API: /api/projects/[id]/suggestions/apply',
                'Extended AI service con metodo applySuggestion',
                'Nuovi types: DiffChange, ApplySuggestionResult',
            ],
        },
    ],
},
```

---

## 🔒 SAFETY GUARDRAILS

### 1. AI Confidence Threshold

Nel method `applySuggestion`:

```typescript
if (aiResponse.confidence < 0.7) {
    throw new Error('Suggestion troppo ambigua - richiede revisione manuale');
}
```

**Rationale**: Blocca applicazioni automatiche se l'AI non è sicura.

---

### 2. Versioning Automatico

Già implementato! Ogni apply salva `previousContent`:

```typescript
data: {
    content: newContent,
    previousContent: chapter.content,  // ✅ Backup automatico
    previousContentSavedAt: new Date(),
    lastModifiedBy: 'ai_suggestion',
}
```

**Undo sempre disponibile** tramite API esistente `/undo`.

---

### 3. Cascading Invalidation Warning

Nel `DiffViewerModal` e post-apply toast:

```typescript
// In modal
<div className="bg-yellow-50 ...">
    ⚠️ L'applicazione potrebbe invalidare altri suggerimenti.
    Considera di rigenerare il consistency report.
</div>

// Post-apply
toast.info('💡 Considera di rigenerare il consistency report per verificare l\'impatto');
```

**Rationale**: Educa l'utente sul rischio di invalidazione.

---

### 4. Feature Flag Control

```typescript
export const FEATURE_FLAGS = {
    SUGGESTION_AUTO_APPLY: process.env.NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY === 'true',
};
```

**Control**: Disabilita rapidamente se emergono problemi in production.

---

### 5. Rate Limiting

Riusa sistema esistente in `lib/rate-limit.ts`:

```typescript
// In API route
import { rateLimiter } from '@/lib/rate-limit';

// Apply rate limit (10 requests per minute)
const rateLimitResult = await rateLimiter.check(
    request,
    'suggestion-apply',
    10,
    60000
);

if (!rateLimitResult.success) {
    return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
    );
}
```

---

## 📊 ROLLOUT STRATEGY

### Phase 1: Internal Beta (Settimana 1)

**Target**: Team interno + 2-3 progetti test

**Config**:
```bash
NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY=false  # Default OFF
```

**Success Criteria**:
- [ ] Zero errori critici
- [ ] Accuracy > 85%
- [ ] Performance < 20s per preview
- [ ] 100% dei test passano

---

### Phase 2: Limited Release (Settimana 2)

**Target**: Nuovi progetti (opt-in)

**Config**:
```bash
NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY=true  # ON per progetti nuovi
```

**Monitoring**:
- Error rate < 5%
- Apply rate (preview → apply) > 60%
- Undo rate < 20%

**Success Criteria**:
- [ ] User satisfaction > 80%
- [ ] No performance degradation
- [ ] Zero data loss incidents

---

### Phase 3: General Availability (Settimana 3)

**Target**: All projects

**Config**:
```bash
NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY=true  # Default ON
```

**Actions**:
- [ ] Update docs
- [ ] Announce in changelog
- [ ] Send notification to users
- [ ] Monitor for 1 week

---

## 🎯 ACCEPTANCE CRITERIA

### Definition of Done

#### Code Quality:
- [ ] ✅ Tutti i tests passano (unit + integration + e2e)
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ Zero ESLint warnings
- [ ] ✅ Code coverage > 80%
- [ ] ✅ Nessun console.log dimenticato

#### Functionality:
- [ ] ✅ Preview generation < 20s (95th percentile)
- [ ] ✅ Apply success rate > 95%
- [ ] ✅ Undo funziona sempre
- [ ] ✅ Error handling copre tutti i casi edge

#### Compatibility:
- [ ] ✅ Zero breaking changes su feature esistenti
- [ ] ✅ Backward compatible (progetti vecchi non affetti)
- [ ] ✅ Mobile responsive
- [ ] ✅ Accessibilità WCAG AA

#### Documentation:
- [ ] ✅ API documentation completa
- [ ] ✅ Component documentation
- [ ] ✅ Changelog aggiornato
- [ ] ✅ README updated (se necessario)

#### Deployment:
- [ ] ✅ Feature flag configurabile
- [ ] ✅ Environment variables documented
- [ ] ✅ Deployed to staging
- [ ] ✅ Smoke tested
- [ ] ✅ Code review approved (2+ reviewers)

---

## 📈 SUCCESS METRICS

### KPIs da Tracciare

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| **Adoption Rate** | > 60% | % utenti che clickano "Preview" |
| **Application Rate** | > 70% | % preview che diventano "Apply" |
| **Accuracy** | > 85% | % apply che NON vengono undo |
| **Performance** | < 20s | Avg time per preview generation |
| **Error Rate** | < 5% | % richieste fallite |
| **Cost per Apply** | < $0.05 | Avg AI cost per suggestion |
| **Undo Rate** | < 20% | % apply seguiti da undo |

### Analytics Events

```typescript
// Da implementare
analytics.track('suggestion_preview_clicked', {
    projectId,
    chapterNumber,
    issueType,
    severity
});

analytics.track('suggestion_applied', {
    projectId,
    chapterNumber,
    wordsChanged,
    percentageChanged,
    cost
});

analytics.track('suggestion_rejected', {
    projectId,
    chapterNumber,
    reason: 'user_rejected'
});
```

---

## ⚠️ RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| **AI genera modifiche sbagliate** | MEDIUM | HIGH | • Confidence threshold (0.7)<br>• Preview obbligatorio<br>• Undo sempre disponibile |
| **Performance lenta (>30s)** | LOW | MEDIUM | • Timeout 30s<br>• Reasoning effort "medium"<br>• Show progress indicator |
| **Cascading invalidation confusion** | HIGH | LOW | • Warning banner in modal<br>• Toast reminder post-apply<br>• Documentation chiara |
| **Breaking existing features** | VERY LOW | HIGH | • Extensive regression testing<br>• Feature flag<br>• Gradual rollout |
| **High AI costs** | MEDIUM | MEDIUM | • Rate limiting<br>• Cost monitoring<br>• Budget alerts |
| **User applies all suggestions blindly** | MEDIUM | LOW | • Educational tooltips<br>• Require confirmation<br>• Show impact metrics |

---

## 🚀 TIMELINE SUMMARY

| Sprint | Duration | Deliverables | Owner |
|--------|----------|-------------|-------|
| **Sprint 1: Backend** | 3-4 giorni | • Types<br>• AI Service method<br>• API endpoint | Backend Team |
| **Sprint 2: Frontend** | 4-5 giorni | • DiffViewerModal<br>• ConsistencyTab integration<br>• Feature flag | Frontend Team |
| **Sprint 3: Testing & Docs** | 2-3 giorni | • Unit/Integration/E2E tests<br>• Documentation<br>• Changelog | QA + DevOps |
| **Total** | **2-3 settimane** | **Production-ready feature** | Full Team |

---

## ✅ PRE-MERGE CHECKLIST

### Before Submitting PR:

#### Code Review:
- [ ] Self-review completato
- [ ] No hardcoded values
- [ ] No commented-out code
- [ ] Proper error messages (user-friendly)
- [ ] Logging appropriato (no PII)

#### Testing:
- [ ] All unit tests green
- [ ] All integration tests green
- [ ] All E2E tests green (if applicable)
- [ ] Manual testing completato
- [ ] Tested on mobile (responsive)
- [ ] Tested error scenarios

#### Performance:
- [ ] No memory leaks
- [ ] Bundle size check (< 10KB increase)
- [ ] Lighthouse score > 90
- [ ] No console errors in browser

#### Documentation:
- [ ] API docs updated
- [ ] Component docs updated
- [ ] Changelog entry added
- [ ] README updated (if needed)
- [ ] JSDoc comments complete

#### Deployment:
- [ ] Environment variables documented
- [ ] Feature flag default set correctly
- [ ] Migration scripts (if needed)
- [ ] Rollback plan documented

### Before Merging to Main:

- [ ] PR approved by 2+ reviewers
- [ ] All CI/CD checks green
- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Product Owner approval
- [ ] Deployment plan reviewed
- [ ] Monitoring/alerts configured

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues

#### Issue: Preview generation takes > 30s

**Cause**: AI call timeout or network issues

**Solution**:
```typescript
// Increase timeout in API route
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
    const result = await applySuggestion(...);
} finally {
    clearTimeout(timeoutId);
}
```

---

#### Issue: AI confidence always < 0.7

**Cause**: Vague suggestions or ambiguous content

**Solution**:
- Improve consistency check prompts
- Add more context to suggestions
- Lower threshold to 0.6 (with caution)

---

#### Issue: Highlighting doesn't work in diff view

**Cause**: HTML escaping or regex mismatch

**Solution**:
- Use proper HTML sanitization
- Test with edge cases (quotes, special chars)
- Consider using diff library (e.g., `react-diff-viewer`)

---

## 📚 REFERENCES

### External Libraries (to consider)

- **react-diff-viewer-continued**: Better diff visualization
- **diff**: Text diffing algorithm
- **react-syntax-highlighter**: Code highlighting
- **framer-motion**: Smooth animations

### Internal References

- `docs/API_DOCUMENTATION.md` - API patterns
- `docs/COMPONENTS.md` - Component structure
- `lib/ai/prompts/` - Prompt examples
- `tests/` - Testing patterns

---

## 🎉 CONCLUSION

Questo piano garantisce:

✅ **ZERO Breaking Changes** - Tutto backward compatible  
✅ **DRY Compliant** - Riusa 80%+ codebase esistente  
✅ **Production Ready** - Testing, docs, feature flag, monitoring  
✅ **Clean Architecture** - Separation of concerns, SOLID principles  
✅ **State of the Art** - Modern patterns, best practices UX/UI  
✅ **User-Centric** - Preview obbligatorio, undo sempre disponibile  
✅ **Cost-Conscious** - Confidence threshold, rate limiting  

### Next Steps

1. **Review this plan** with team
2. **Estimate effort** per task
3. **Assign owners** per sprint
4. **Set up tracking** (Jira/GitHub issues)
5. **Kick off Sprint 1** 🚀

---

**Document Version**: 1.0  
**Last Updated**: 21 Novembre 2025  
**Status**: ✅ Ready for Implementation  
**Reviewers**: [To be assigned]  
**Approvers**: [To be assigned]
