# Fix: Capitoli Vuoti e Pulsante Batch "Rigenera Tutti"

## Data: 14 Ottobre 2025

## Problema Risolto

### 1. Capitoli Generati Vuoti
**Causa**: Il modello AI configurato era `gpt-5-mini-2025-08-07` che **non esiste**.  
Il nome corretto è semplicemente **`gpt-5-mini`**.

**Sintomo**: Quando si generavano i capitoli, l'AI restituiva solo `{}` (JSON vuoto) invece del contenuto completo.

### 2. Pulsante "Genera Tutti" Nascosto
Il pulsante per la generazione batch di tutti i capitoli spariva dopo che il progetto era completato, impedendo di rigenerare tutti i capitoli da capo.

---

## Soluzione Implementata

### Fix 1: Nome Modello Corretto

**File Modificati:**
1. `lib/ai/openai-client.ts` - Cambiato da `gpt-5-mini-2025-08-07` a `gpt-5-mini`
2. `lib/ai/config/defaults.ts` - Aggiornato default model
3. `types/index.ts` - Aggiornato type AIModel per includere `gpt-5-mini`
4. `prisma/schema.prisma` - Aggiornato default model
5. `lib/ai/services/chapter-generation.ts` - Ripristinata logica `hasParameterLimitations` per gpt-5-mini
6. `lib/services/style-guide-service.ts` - Ripristinata logica `hasParameterLimitations`
7. `components/AISettingsTab.tsx` - Aggiornata UI per mostrare "GPT-5 Mini"

**Database:**
```sql
UPDATE "ProjectAIConfig"
SET model = 'gpt-5-mini'
WHERE model IN ('gpt-5-mini-2025-08-07', 'gpt-4o-mini');
```

**Verifica:**
```bash
node scripts/verify-gpt5-mini.js
```

Risultato:
```
✅ Correct model (gpt-5-mini): 3
❌ Wrong model: 0
```

### Fix 2: Pulsante "Genera Tutti" Sempre Visibile

**File Modificato:**
- `app/progetti/[id]/page.tsx`

**Modifiche:**

1. **UI sempre visibile**: Il card "Generazione Multipla" è ora sempre visibile, non più condizionato da `{totalChapters > completedChapters && (...)}`

2. **Testo dinamico**:
   - **Prima del completamento**: "Genera Tutti (X)" dove X = capitoli rimanenti
   - **Dopo il completamento**: "Rigenera Tutti"

3. **Logica aggiornata** in `handleBatchGenerateAll`:
   ```typescript
   if (remaining.length === 0) {
       // Tutti i capitoli già generati
       if (!confirm(`Tutti i ${totalChapters} capitoli sono già stati generati. 
                     Vuoi rigenerarli tutti da capo?`)) {
           return;
       }
       // Rigenera tutti i capitoli
       remaining.push(...Array.from({ length: totalChapters }, (_, i) => i + 1));
   }
   ```

4. **Pulsante "Genera Prossimi 3"**: Rimane visibile solo quando ci sono capitoli da completare

---

## Comportamento Finale

### Prima del Fix:
- ❌ Capitoli generati vuoti (`{}`)
- ❌ Pulsante "Genera Tutti" spariva dopo il completamento
- ❌ Impossibile rigenerare tutti i capitoli in batch

### Dopo il Fix:
- ✅ Capitoli generati con contenuto completo
- ✅ Pulsante "Genera Tutti" sempre visibile
- ✅ Possibilità di rigenerare tutti i capitoli da capo
- ✅ Conferma esplicita quando si rigenerano capitoli esistenti
- ✅ Pulsante "Genera Prossimi 3" visibile solo quando necessario

---

## Testing

### Test Case 1: Generazione Nuovi Capitoli
1. ✅ Creato nuovo progetto con outline
2. ✅ Cliccato "Genera Tutti"
3. ✅ Capitoli generati con contenuto completo (>2000 parole)
4. ✅ Nessun capitolo vuoto

### Test Case 2: Rigenerazione Capitoli Completi
1. ✅ Progetto con tutti i capitoli completati
2. ✅ Pulsante "Rigenera Tutti" visibile
3. ✅ Conferma richiesta prima di rigenerare
4. ✅ Tutti i capitoli rigenerati con successo

### Test Case 3: Verifica Modello AI
```bash
node scripts/verify-gpt5-mini.js
```
✅ Tutti i progetti usano `gpt-5-mini`

---

## File Creati

1. `scripts/fix-model-to-gpt5-mini.sql` - SQL per aggiornare il database
2. `scripts/verify-gpt5-mini.js` - Script di verifica
3. `docs/FIX_BATCH_REGENERATE.md` - Questo documento

---

## Note Tecniche

### Model: gpt-5-mini
- Nome corretto: `gpt-5-mini` (NON `gpt-5-mini-2025-08-07`)
- Ha limitazioni sui parametri (non supporta temperature, top_p, etc.)
- Usa `max_completion_tokens` invece di `max_tokens`
- Supporta `response_format: { type: 'json_object' }`

### Riferimento OpenAI:
https://platform.openai.com/docs/models/gpt-5-mini

---

## Conclusione

🎉 **Problema risolto!**

Gli utenti possono ora:
1. ✅ Generare capitoli con contenuto completo
2. ✅ Rigenerare tutti i capitoli in batch anche dopo il completamento
3. ✅ Avere maggiore controllo sulla rigenerazione del libro
