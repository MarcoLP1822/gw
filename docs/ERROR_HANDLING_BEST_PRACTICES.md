# Best Practices - Sistema di Gestione Errori

## 🎯 Linee Guida Generali

### 1. **Sempre Usare Errori Strutturati nel Backend**

❌ **NON fare:**
```typescript
throw new Error('Qualcosa è andato storto');
return NextResponse.json({ error: 'Errore generico' }, { status: 500 });
```

✅ **FARE:**
```typescript
throw ApiErrors.validation('Campo obbligatorio mancante');
throw ApiErrors.notFound('Progetto', projectId);
throw ApiErrors.prerequisiteNotMet("Genera prima l'outline");
```

### 2. **Handler Centralizzato nei Catch**

❌ **NON fare:**
```typescript
catch (error) {
    return NextResponse.json(
        { error: 'Errore' },
        { status: 500 }
    );
}
```

✅ **FARE:**
```typescript
catch (error) {
    const apiError = handleApiError(error);
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode });
}
```

### 3. **Wrapper per Chiamate OpenAI**

❌ **NON fare:**
```typescript
const response = await openai.chat.completions.create(...);
```

✅ **FARE:**
```typescript
try {
    const response = await openai.chat.completions.create(...);
} catch (error) {
    throw parseOpenAIError(error);
}
```

### 4. **Messaggi User-Friendly nel Frontend**

❌ **NON fare:**
```typescript
catch (error) {
    toast.error(error.message); // Messaggio tecnico
}
```

✅ **FARE:**
```typescript
catch (error) {
    toast.error(getErrorMessage(error)); // Messaggio user-friendly
}
```

## 📋 Checklist per Nuove Features

Quando aggiungi una nuova feature che può generare errori:

- [ ] Backend usa `ApiErrors.*` invece di `new Error()`
- [ ] Handler centralizzato nel catch finale
- [ ] Chiamate API esterne wrappate con error parser
- [ ] Frontend usa `getErrorMessage()` per toast
- [ ] Componente mostra `ErrorDisplay` se appropriato
- [ ] Errori ritentabili hanno pulsante "Riprova"
- [ ] Errori critici hanno link alle impostazioni
- [ ] Testing di scenari di errore comuni

## 🔍 Quando Usare Quale Errore

### API Key Invalida
```typescript
// Quando: API Key OpenAI non funziona
throw ApiErrors.invalidApiKey();
// Severità: CRITICAL
// Retryable: false
// Azione utente: Configura API Key in impostazioni
```

### Quota Esaurita
```typescript
// Quando: Credito OpenAI finito
throw ApiErrors.quotaExceeded();
// Severità: HIGH
// Retryable: false
// Azione utente: Ricarica credito o cambia API Key
```

### Rate Limit
```typescript
// Quando: Troppe richieste in poco tempo
throw ApiErrors.rateLimit(60); // retry dopo 60 secondi
// Severità: MEDIUM
// Retryable: true
// Azione utente: Attendi e riprova
```

### Timeout
```typescript
// Quando: Operazione troppo lunga
throw ApiErrors.timeout('generazione capitolo');
// Severità: MEDIUM
// Retryable: true
// Azione utente: Riprova o riduci dimensione input
```

### Prerequisiti Non Soddisfatti
```typescript
// Quando: Step precedente non completato
throw ApiErrors.prerequisiteNotMet("Genera prima l'outline", {
    projectId,
    requiredStep: 'outline'
});
// Severità: MEDIUM
// Retryable: false
// Azione utente: Completa step precedente
```

### Risorsa Non Trovata
```typescript
// Quando: ID non esiste nel database
throw ApiErrors.notFound('Progetto', projectId);
// Severità: LOW
// Retryable: false
// Azione utente: Verifica ID o torna indietro
```

### Validazione
```typescript
// Quando: Input utente non valido
throw ApiErrors.validation('Email non valida');
// Severità: LOW
// Retryable: false
// Azione utente: Correggi input
```

### Database Error
```typescript
// Quando: Errore nel salvataggio/lettura DB
throw ApiErrors.database('Errore nel salvataggio del capitolo', originalError);
// Severità: HIGH
// Retryable: false
// Azione utente: Contatta supporto
```

## 🎨 Pattern UI Consigliati

### Pattern 1: Toast per Errori Minori
```typescript
// Per validazione, non trovato, ecc.
try {
    await operation();
} catch (error) {
    toast.error(getErrorMessage(error));
}
```

### Pattern 2: ErrorDisplay per Errori Importanti
```tsx
// Per API Key, quota, prerequisiti
{error && (
    <ErrorDisplay
        error={error}
        onRetry={isRetryableError(error) ? handleRetry : undefined}
        onDismiss={() => setError(null)}
        showDetails={false}
    />
)}
```

### Pattern 3: Persistente per Errori Critici
```tsx
// Per problemi che bloccano l'utente
{criticalError && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-lg">
            <ErrorDisplay
                error={criticalError}
                showDetails={true}
            />
        </div>
    </div>
)}
```

## 🧪 Testing degli Errori

### Test Scenari Comuni

```typescript
// 1. API Key non valida
// Imposta: OPENAI_API_KEY=sk_invalid
await expect(generateChapter()).rejects.toThrow(ApiError);

// 2. Prerequisiti mancanti
// Non creare outline prima di generare capitolo
await expect(generateChapter(1)).rejects.toHaveProperty('code', 'PREREQUISITE_NOT_MET');

// 3. Rate limit
// Fai molte richieste veloci
for (let i = 0; i < 100; i++) {
    await generateChapter(i);
}

// 4. Timeout
// Usa token molto grandi
await generateChapter(1, { maxTokens: 100000 });
```

## 📊 Monitoring e Analytics

### Errori da Tracciare

1. **Frequenza per tipo**
   - Quanti `API_KEY_INVALID` al giorno?
   - Quanti `QUOTA_EXCEEDED` al mese?

2. **Tasso di successo dopo retry**
   - Quanti utenti riprovano dopo un errore?
   - Quale percentuale ha successo?

3. **Tempo medio per risoluzione**
   - Quanto tempo passa tra errore e successo?

4. **Errori per utente**
   - Quali utenti hanno più problemi?
   - Pattern comuni?

### Implementazione
```typescript
// Log errori per analytics
const logError = (error: ApiError, context: any) => {
    // Invia a Sentry, LogRocket, ecc.
    analytics.track('error_occurred', {
        code: error.code,
        severity: error.severity,
        retryable: error.retryable,
        context,
        timestamp: new Date().toISOString(),
    });
};
```

## 🚨 Gestione Errori Critici

### Cosa fare per errori che bloccano l'app

1. **Mostra UI persistente**
   - Non permettere all'utente di continuare
   - Mostra chiaramente il problema

2. **Fornisci azioni chiare**
   - Link alle impostazioni
   - Contatto supporto
   - Documentazione

3. **Log dettagliato**
   - Invia a sistema di monitoring
   - Include context completo
   - Notifica team

```typescript
catch (error) {
    if (error.severity === ErrorSeverity.CRITICAL) {
        // Log urgente
        logger.critical('Critical error', { error, context });
        
        // Notifica team
        await notifyTeam(error);
        
        // Mostra UI bloccante
        setCriticalError(error);
        
        // Redirect se necessario
        if (error.code === ErrorType.API_KEY_INVALID) {
            setTimeout(() => router.push('/settings'), 3000);
        }
    }
}
```

## 💡 Tips & Tricks

### 1. Context Utile
```typescript
throw ApiErrors.prerequisiteNotMet('Completa il capitolo precedente', {
    projectId: 'abc',
    currentChapter: 5,
    requiredChapter: 4,
    missingSteps: ['generate', 'review']
});
```

### 2. Chain di Errori
```typescript
try {
    await openai.call();
} catch (originalError) {
    throw ApiErrors.externalApi('OpenAI', originalError);
    // Preserva stack trace originale
}
```

### 3. Errori Custom per Business Logic
```typescript
// Estendi il sistema per errori specifici del dominio
export const CustomErrors = {
    chapterTooLong: (length: number, max: number) =>
        new ApiError(
            `Capitolo troppo lungo: ${length} caratteri (max: ${max})`,
            ErrorType.VALIDATION_ERROR,
            400,
            {
                severity: ErrorSeverity.LOW,
                context: { length, max, exceededBy: length - max }
            }
        ),
};
```

### 4. Errori Localizzati
```typescript
// Per supportare multiple lingue
const ERROR_MESSAGES: Record<string, Record<ErrorType, string>> = {
    en: { /* messaggi in inglese */ },
    it: { /* messaggi in italiano */ },
    es: { /* messaggi in spagnolo */ },
};

export function getErrorMessage(code: ErrorType, locale = 'it'): string {
    return ERROR_MESSAGES[locale][code] || ERROR_MESSAGES['it'][code];
}
```

## 📚 Risorse Aggiuntive

- [Documentazione Completa](./ERROR_HANDLING.md)
- [Quick Start Guide](./ERROR_HANDLING_QUICKSTART.md)
- [Esempi Pratici](../examples/error-handling-examples.tsx)
- [Script di Test](../scripts/test-error-handling.ts)

## ❓ FAQ

**Q: Quando creare un nuovo tipo di errore?**  
A: Quando l'errore richiede un'azione utente diversa o ha una severità diversa dagli errori esistenti.

**Q: Come gestire errori di librerie esterne?**  
A: Wrappa sempre in try-catch e converti in ApiError appropriato.

**Q: Devo sempre usare ErrorDisplay?**  
A: No, per errori minori va bene un toast. Usa ErrorDisplay per errori che richiedono attenzione.

**Q: Come testare il parsing di errori OpenAI?**  
A: Usa il test script: `npm run test:errors` (o crea il comando)

**Q: Posso estendere ErrorType?**  
A: Sì, aggiungi nuovi valori nell'enum e aggiorna i messaggi.

---

**Ultimo aggiornamento:** 13 Ottobre 2025  
**Versione:** 1.0  
**Maintainer:** Team Development
