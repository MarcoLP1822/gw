# Sistema di Gestione Errori - Quick Start

## ✨ Novità

Il sistema di gestione errori è stato completamente riprogettato per fornire:

- **Messaggi chiari e user-friendly** invece di errori tecnici generici
- **Errori specifici** per OpenAI (API key non valida, credito esaurito, rate limit, ecc.)
- **Suggerimenti actionable** che guidano l'utente a risolvere il problema
- **UI/UX migliorata** con componenti visuali dedicati
- **Retry automatico** per errori temporanei

## 🚀 Uso Rapido

### Nel Backend

```typescript
import { handleApiError, ApiErrors } from '@/lib/errors/api-errors';

export async function POST(request: NextRequest) {
    try {
        // Validazione
        if (!data) {
            throw ApiErrors.validation('Dati mancanti');
        }
        
        // Not found
        if (!project) {
            throw ApiErrors.notFound('Progetto', projectId);
        }
        
        // Prerequisiti
        if (!outline) {
            throw ApiErrors.prerequisiteNotMet("Genera prima l'outline");
        }
        
        // Chiamate OpenAI
        try {
            await openai.chat.completions.create(...);
        } catch (error) {
            throw parseOpenAIError(error);
        }
        
    } catch (error) {
        const apiError = handleApiError(error);
        return NextResponse.json(apiError.toJSON(), { 
            status: apiError.statusCode 
        });
    }
}
```

### Nel Frontend

#### Metodo 1: Toast semplice
```typescript
import { getErrorMessage } from '@/lib/api/projects';

try {
    await projectsApi.generateChapter(projectId, chapterNumber);
    toast.success('Capitolo generato!');
} catch (error) {
    toast.error(getErrorMessage(error));
}
```

#### Metodo 2: Con componente ErrorDisplay
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
            <button onClick={handleAction}>Genera</button>
        </>
    );
}
```

## 📋 Errori Gestiti

| Scenario | Codice | Messaggio |
|----------|--------|-----------|
| API Key non valida | `API_KEY_INVALID` | ⚠️ API Key non valida. Configura le credenziali nelle impostazioni. |
| Credito esaurito | `API_QUOTA_EXCEEDED` | 💳 Credito API esaurito. Ricarica il tuo account. |
| Rate limit | `API_RATE_LIMIT` | ⏱️ Troppi tentativi. Attendi qualche secondo. |
| Timeout | `API_TIMEOUT` | ⏰ L'operazione sta richiedendo troppo tempo. |
| Prerequisiti | `PREREQUISITE_NOT_MET` | 📋 Completa i passi precedenti. |
| Non trovato | `NOT_FOUND` | 🔍 Elemento non trovato. |

## 🎨 Componenti UI

### ErrorDisplay

Mostra errori con:
- Icone e colori basati sulla severità
- Messaggi user-friendly
- Suggerimenti per risolvere il problema
- Pulsante "Riprova" per errori temporanei
- Link diretto alle impostazioni per API key

```tsx
<ErrorDisplay
    error={error}                    // Oggetto errore o stringa
    onRetry={() => handleRetry()}    // Callback per riprova
    onDismiss={() => setError(null)} // Callback per chiudere
    showDetails={true}               // Mostra dettagli tecnici
/>
```

## 🔄 Retry Logic

```typescript
import { isRetryableError } from '@/lib/api/projects';

catch (error) {
    if (isRetryableError(error)) {
        // Mostra pulsante "Riprova"
        setShowRetry(true);
    }
}
```

## 📚 Documentazione Completa

Vedi [ERROR_HANDLING.md](./ERROR_HANDLING.md) per:
- Architettura completa del sistema
- Tutti i tipi di errore disponibili
- Best practices
- Esempi avanzati
- Come estendere il sistema

## 🧪 Testing

Per testare gli errori durante lo sviluppo:

1. **API Key non valida**: Imposta una chiave OpenAI errata nelle impostazioni
2. **Rate limit**: Fai molte richieste rapidamente
3. **Prerequisiti**: Prova a generare un capitolo senza outline

## 🎯 Benefici

- ✅ **UX migliorata**: Gli utenti capiscono cosa è andato storto
- ✅ **Actionable**: Suggerimenti chiari su come risolvere
- ✅ **Manutenibilità**: Codice centralizzato e riutilizzabile
- ✅ **Debug facile**: Errori strutturati con context
- ✅ **Estensibile**: Facile aggiungere nuovi tipi di errore

## 📝 Esempi Reali

### Errore API Key
```
⚠️ API Key non valida. Configura le credenziali nelle impostazioni.
💡 Suggerimento: Vai su Impostazioni → Configurazione AI per configurare la tua API Key OpenAI.
[⚙️ Vai alle Impostazioni]
```

### Errore Credito Esaurito
```
💳 Credito API esaurito. Ricarica il tuo account o aggiorna la chiave API.
💡 Suggerimento: Ricarica il credito sul tuo account OpenAI o aggiorna la chiave API nelle impostazioni.
[🔄 Riprova] [⚙️ Vai alle Impostazioni]
```

### Errore Prerequisiti
```
📋 Prerequisiti non soddisfatti. Completa i passi precedenti.
💡 Suggerimento: Genera prima l'outline del libro prima di creare i capitoli.
[Chiudi]
```

## 🔧 Migrazione

Per aggiornare codice esistente:

**Prima:**
```typescript
throw new Error('Errore generico');
```

**Dopo:**
```typescript
throw ApiErrors.validation('Messaggio specifico');
// oppure
throw ApiErrors.invalidApiKey();
// oppure
throw ApiErrors.prerequisiteNotMet("Genera prima l'outline");
```

---

Per domande o suggerimenti, vedi la documentazione completa in `docs/ERROR_HANDLING.md`.
