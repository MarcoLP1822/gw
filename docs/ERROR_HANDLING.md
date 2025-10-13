# Sistema di Gestione Errori Migliorato

## Panoramica

Il sistema di gestione errori è stato completamente rivisitato per fornire messaggi più chiari e utili agli utenti, gestendo in modo specifico errori comuni come API key non valide, credito esaurito, rate limits, ecc.

## Architettura

### 1. Tipi di Errore Strutturati (`lib/errors/api-errors.ts`)

Il sistema definisce tipi di errore specifici per ogni scenario:

```typescript
enum ErrorType {
    // Validazione
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    
    // Autenticazione
    AUTH_ERROR = 'AUTH_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    
    // API Esterne (OpenAI)
    API_KEY_INVALID = 'API_KEY_INVALID',
    API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
    API_RATE_LIMIT = 'API_RATE_LIMIT',
    API_TIMEOUT = 'API_TIMEOUT',
    API_ERROR = 'API_ERROR',
    
    // Database
    DATABASE_ERROR = 'DATABASE_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    
    // Business Logic
    INVALID_STATE = 'INVALID_STATE',
    PREREQUISITE_NOT_MET = 'PREREQUISITE_NOT_MET',
    
    // Generici
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
}
```

### 2. Classe ApiError

Ogni errore ha proprietà strutturate:

```typescript
class ApiError extends Error {
    code: ErrorType;           // Tipo di errore
    statusCode: number;        // Codice HTTP
    severity: ErrorSeverity;   // LOW | MEDIUM | HIGH | CRITICAL
    retryable: boolean;        // Se può essere ritentato
    context?: ErrorContext;    // Contesto aggiuntivo
}
```

### 3. Factory Functions

Funzioni helper per creare errori specifici:

```typescript
// Esempi
ApiErrors.invalidApiKey()
ApiErrors.quotaExceeded()
ApiErrors.notFound('Progetto', projectId)
ApiErrors.prerequisiteNotMet('Genera prima l\'outline')
```

## Utilizzo

### Backend (API Routes)

```typescript
import { handleApiError, ApiErrors } from '@/lib/errors/api-errors';

export async function POST(request: NextRequest) {
    try {
        // Validazione
        if (!data.title) {
            const error = ApiErrors.validation('Titolo obbligatorio');
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        
        // Business logic
        const project = await getProject(id);
        if (!project) {
            throw ApiErrors.notFound('Progetto', id);
        }
        
        // Chiamata API esterna
        try {
            const result = await openai.chat.completions.create(...);
        } catch (error) {
            throw parseOpenAIError(error);
        }
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        // Handler centralizzato
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
    }
}
```

### Frontend (React Components)

#### Gestione Base

```typescript
import { getErrorMessage, isRetryableError } from '@/lib/api/projects';

try {
    await projectsApi.generateChapter(projectId, chapterNumber);
} catch (error) {
    // Ottieni messaggio user-friendly
    const message = getErrorMessage(error);
    toast.error(message);
    
    // Verifica se può essere ritentato
    if (isRetryableError(error)) {
        // Mostra pulsante "Riprova"
    }
}
```

#### Con Componente ErrorDisplay

```tsx
import { ErrorDisplay } from '@/components/ErrorDisplay';

function MyComponent() {
    const [error, setError] = useState(null);
    
    const handleAction = async () => {
        try {
            await someApiCall();
        } catch (err) {
            setError(err);
        }
    };
    
    return (
        <>
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={handleAction}
                    onDismiss={() => setError(null)}
                    showDetails={true}
                />
            )}
        </>
    );
}
```

## Messaggi User-Friendly

Ogni tipo di errore ha un messaggio predefinito user-friendly:

| Codice | Messaggio |
|--------|-----------|
| `API_KEY_INVALID` | ⚠️ API Key non valida. Configura le credenziali nelle impostazioni. |
| `API_QUOTA_EXCEEDED` | 💳 Credito API esaurito. Ricarica il tuo account o aggiorna la chiave API. |
| `API_RATE_LIMIT` | ⏱️ Troppi tentativi. Attendi qualche secondo e riprova. |
| `API_TIMEOUT` | ⏰ L'operazione sta richiedendo troppo tempo. Riprova. |
| `PREREQUISITE_NOT_MET` | 📋 Prerequisiti non soddisfatti. Completa i passi precedenti. |
| `NOT_FOUND` | 🔍 Elemento non trovato. |

## Parsing Errori OpenAI

Il sistema riconosce automaticamente gli errori di OpenAI:

```typescript
parseOpenAIError(error)
```

Identifica:
- **401**: API Key non valida → `API_KEY_INVALID`
- **429**: Quota/Rate limit → `API_QUOTA_EXCEEDED` o `API_RATE_LIMIT`
- **504**: Timeout → `API_TIMEOUT`
- **Altri**: Errore generico → `API_ERROR`

## Livelli di Severità

```typescript
enum ErrorSeverity {
    LOW = 'LOW',           // Info/warning (es. validazione)
    MEDIUM = 'MEDIUM',     // Errore recuperabile (es. timeout)
    HIGH = 'HIGH',         // Errore critico (es. database)
    CRITICAL = 'CRITICAL', // Sistema non funzionante (es. API key)
}
```

Il componente `ErrorDisplay` usa colori diversi per ogni livello:
- **LOW**: Giallo
- **MEDIUM**: Arancione
- **HIGH**: Rosso
- **CRITICAL**: Rosso scuro

## Retry Logic

Errori con `retryable: true`:
- `API_RATE_LIMIT`
- `API_TIMEOUT`
- `NETWORK_ERROR`

Il frontend può mostrare automaticamente un pulsante "Riprova" per questi errori.

## Context e Details

Ogni errore può avere un context con dettagli aggiuntivi:

```typescript
throw ApiErrors.prerequisiteNotMet('Completa il capitolo precedente', {
    projectId: 'abc123',
    chapterNumber: 5,
    requiredChapter: 4
});
```

Questi dettagli sono disponibili per il debug ma non mostrati all'utente.

## Best Practices

### 1. Nel Backend
- Usa sempre `ApiErrors.*` invece di `new Error()`
- Gestisci specificamente gli errori di OpenAI con `parseOpenAIError()`
- Includi sempre l'handler centralizzato nel catch finale

### 2. Nel Frontend
- Usa `getErrorMessage()` per ottenere messaggi user-friendly
- Controlla `isRetryableError()` per mostrare il pulsante riprova
- Mostra suggerimenti specifici usando `ErrorDisplay`

### 3. Testing
- Testa scenari comuni: API key invalida, quota esaurita, timeout
- Verifica che i messaggi siano chiari e actionable

## Esempi Completi

### Esempio 1: Generazione Capitolo

**Backend:**
```typescript
export async function POST(request: NextRequest, { params }) {
    try {
        const chapter = await chapterGenerationService.generateChapter(
            params.id,
            params.chapterNumber
        );
        return NextResponse.json({ success: true, chapter });
    } catch (error) {
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
    }
}
```

**Frontend:**
```typescript
const handleGenerate = async () => {
    try {
        await projectsApi.generateChapter(projectId, chapterNumber);
        toast.success('Capitolo generato!');
    } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        
        if (error.code === ErrorType.API_KEY_INVALID) {
            // Redirect alle impostazioni
            router.push('/settings');
        }
    }
};
```

### Esempio 2: Validazione Input

**Backend:**
```typescript
if (!project.outline) {
    throw ApiErrors.prerequisiteNotMet("Genera prima l'outline del libro");
}
```

**Frontend:**
```typescript
try {
    await generateChapter();
} catch (error) {
    // Mostra: "📋 Prerequisiti non soddisfatti. Completa i passi precedenti."
    toast.error(getErrorMessage(error));
}
```

## Migrazione da Sistema Vecchio

### Prima
```typescript
// Backend
throw new Error('Errore generico');

// Frontend
catch (error) {
    toast.error(error.message);
}
```

### Dopo
```typescript
// Backend
throw ApiErrors.invalidApiKey();

// Frontend
catch (error) {
    const message = getErrorMessage(error);
    toast.error(message); // Mostra messaggio user-friendly
}
```

## Estensione

Per aggiungere un nuovo tipo di errore:

1. Aggiungi il tipo in `ErrorType` enum
2. Aggiungi il messaggio in `ERROR_MESSAGES`
3. Aggiungi una factory function in `ApiErrors`
4. (Opzionale) Aggiungi suggerimento in `ErrorDisplay`

```typescript
// 1. Tipo
export enum ErrorType {
    MY_NEW_ERROR = 'MY_NEW_ERROR',
}

// 2. Messaggio
const ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.MY_NEW_ERROR]: '🔧 Messaggio user-friendly',
};

// 3. Factory
export const ApiErrors = {
    myNewError: (context) => new ApiError(
        'Technical message',
        ErrorType.MY_NEW_ERROR,
        400,
        { severity: ErrorSeverity.MEDIUM, context }
    ),
};
```

## Conclusioni

Il nuovo sistema di gestione errori fornisce:
- ✅ Messaggi chiari e actionable per gli utenti
- ✅ Errori strutturati per il debugging
- ✅ Gestione centralizzata ed estensibile
- ✅ Supporto per retry automatico
- ✅ UI/UX migliorata con componenti dedicati
