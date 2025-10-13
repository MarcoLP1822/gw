# Verifica del Modello AI Utilizzato

## Come verificare che stai usando il modello corretto

Dopo aver cambiato il modello da `gpt-4o-mini` a `gpt-5-mini-2025-08-07`, puoi verificare che le chiamate API stiano usando il modello corretto in diversi modi:

---

## 1. 📊 Verifica nei Log del Terminal

Quando generi un outline o un capitolo, ora vedrai log dettagliati nel terminal che mostrano:

### Durante la generazione dell'outline:
```
🎯 GENERATING OUTLINE WITH MODEL: gpt-5-mini-2025-08-07
   Temperature: 0.7
   Max Tokens: 4000

[OpenAI API] Generate Outline - Model: gpt-5-mini-2025-08-07

✅ Outline response received from model: gpt-5-mini-2025-08-07
   Tokens used: 2345
   Generation time: 3.42s

[OpenAI API] Outline Generated - Model: gpt-5-mini-2025-08-07 - Tokens: 2345
```

### Durante la generazione di un capitolo:
```
🎯 USING AI MODEL: gpt-5-mini-2025-08-07
   Temperature: 0.7
   Max Tokens: 4000
   Top P: 0.95

[OpenAI API] Generate Chapter 1 - Model: gpt-5-mini-2025-08-07

✅ Response received from model: gpt-5-mini-2025-08-07
   Tokens used: 3421

[OpenAI API] Chapter 1 Generated - Model: gpt-5-mini-2025-08-07 - Tokens: 3421
```

---

## 2. 🔍 Verifica nel Database

Il modello utilizzato viene salvato nel database. Puoi verificarlo in diversi modi:

### A. Tramite la tabella `GenerationLog`
```sql
-- Vedi gli ultimi modelli usati
SELECT step, aiModel, success, createdAt, totalTokens
FROM "GenerationLog"
ORDER BY createdAt DESC
LIMIT 10;
```

### B. Tramite la tabella `Outline`
```sql
-- Verifica il modello usato per gli outline
SELECT projectId, aiModel, generatedAt
FROM "Outline"
ORDER BY generatedAt DESC;
```

### C. Tramite la tabella `Chapter`
```sql
-- Verifica il modello usato per i capitoli
SELECT projectId, chapterNumber, aiModel, generatedAt
FROM "Chapter"
ORDER BY generatedAt DESC;
```

---

## 3. 🎯 Verifica nella Configurazione AI del Progetto

Puoi verificare la configurazione AI salvata per ogni progetto:

```sql
-- Vedi la configurazione AI attiva per un progetto
SELECT projectId, model, temperature, maxTokens, topP
FROM "AIConfig"
WHERE projectId = 'il-tuo-project-id';
```

---

## 4. 📝 Verifica tramite API Response

Quando fai una richiesta API per generare contenuti, la risposta include informazioni sul modello:

### Esempio di risposta per outline generation:
```json
{
  "success": true,
  "outline": { ... },
  "usage": {
    "model": "gpt-5-mini-2025-08-07",
    "promptTokens": 1234,
    "completionTokens": 2345,
    "totalTokens": 3579,
    "generationTime": "3.42s"
  }
}
```

---

## 5. 🔧 File di Configurazione

### File: `lib/ai/config/defaults.ts`
Il modello di default è definito qui:
```typescript
export const DEFAULT_AI_CONFIG = {
    model: 'gpt-5-mini-2025-08-07' as const,
    // ...altri parametri
};
```

### File: `lib/ai/openai-client.ts`
Il modello di fallback è definito qui:
```typescript
export const DEFAULT_MODEL = 'gpt-5-mini-2025-08-07';
```

---

## 6. 🧪 Test Rapido

Per fare un test rapido e verificare il modello:

1. **Avvia il server di sviluppo:**
   ```powershell
   npm run dev
   ```

2. **Genera un nuovo outline o capitolo**

3. **Controlla il terminal** - Dovresti vedere i log con il modello corretto

4. **Controlla la risposta API** - Il campo `model` nella risposta dovrebbe mostrare `gpt-5-mini-2025-08-07`

---

## 7. ⚠️ Possibili Problemi

### Se vedi ancora il vecchio modello:

1. **Verifica che il server sia stato riavviato** dopo le modifiche
2. **Controlla la configurazione AI del progetto specifico:**
   ```sql
   SELECT * FROM "AIConfig" WHERE projectId = 'tuo-project-id';
   ```
3. **Aggiorna manualmente la configurazione AI se necessario:**
   ```sql
   UPDATE "AIConfig" 
   SET model = 'gpt-5-mini-2025-08-07'
   WHERE projectId = 'tuo-project-id';
   ```

---

## 8. 💡 Best Practices

- **Controlla sempre i log** durante la generazione
- **Verifica il database** dopo ogni generazione importante
- **Monitora i costi** - il nuovo modello potrebbe avere costi diversi
- **Testa con un progetto di prova** prima di usare in produzione

---

## 9. 🆘 Supporto

Se il modello non cambia nonostante le verifiche:

1. Ferma il server (`Ctrl+C`)
2. Pulisci la cache: `rm -rf .next`
3. Riavvia: `npm run dev`
4. Controlla i log del terminal durante una nuova generazione

---

## Modifiche Effettuate

Le seguenti modifiche sono state apportate per aggiungere il logging:

1. ✅ `lib/ai/openai-client.ts` - Aggiornato DEFAULT_MODEL e aggiunta funzione `logAPICall`
2. ✅ `lib/ai/services/chapter-generation.ts` - Aggiunto logging per generazione capitoli
3. ✅ `app/api/projects/[id]/generate-outline/route.ts` - Aggiunto logging per generazione outline
4. ✅ `lib/ai/config/defaults.ts` - Già configurato con il modello corretto

---

**Data ultimo aggiornamento:** 13 Ottobre 2025
