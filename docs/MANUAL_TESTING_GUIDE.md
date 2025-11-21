# 🧪 Manual Testing Guide - Apply Consistency Suggestions

**Feature**: Apply Consistency Suggestions (v3.21.0)  
**Date**: 21 Novembre 2025  
**Status**: Ready for Testing

---

## ✅ Pre-requisiti

1. **Environment Variables**:
   ```bash
   # .env or .env.local
   NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY="true"
   ```

2. **Database**: Progetto esistente con capitoli completati e consistency report generato

3. **Dev Server**: `npm run dev` in esecuzione

---

## 🔬 Test Cases

### Test 1: Feature Flag - OFF

**Steps**:
1. Imposta `NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY="false"` in `.env.local`
2. Riavvia dev server (`npm run dev`)
3. Vai a un progetto con consistency report
4. Naviga al tab "Consistency"
5. Verifica che nella sezione "Criticità Rilevate" **NON** appaiano bottoni "🔍 Preview Modifica"

**Expected**: Nessun bottone visibile

---

### Test 2: Feature Flag - ON

**Steps**:
1. Imposta `NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY="true"` in `.env.local`
2. Riavvia dev server
3. Vai a un progetto con consistency report
4. Naviga al tab "Consistency"
5. Verifica che ogni issue con `chapter` number mostri il bottone "🔍 Preview Modifica"

**Expected**: Bottoni visibili per ogni issue con chapter

---

### Test 3: Preview Modal - Loading State

**Steps**:
1. Assicurati che feature flag sia ON
2. Clicca su "🔍 Preview Modifica" per una qualsiasi issue
3. Osserva modal che si apre
4. Verifica che appaia:
   - Spinner animato
   - Testo "Generazione proposta di modifica..."
   - Sottotesto "L'AI sta analizzando il capitolo (10-20 secondi)"

**Expected**: UI di loading chiara durante generazione

---

### Test 4: Preview Modal - Success State

**Steps**:
1. Attendi che il preview venga generato (10-20 secondi)
2. Verifica che appaia:
   - **Split view**: 2 colonne (Originale | Con Modifica)
   - **Highlighting**: Testo modificato evidenziato in rosso (old) e verde (new)
   - **Impact Metrics**: 
     - Parole modificate (numero)
     - Percentuale (%)
     - Tipo modifica (deletion/replacement/addition)
     - Costo stima ($)
   - **AI Reasoning**: Box con spiegazione della modifica
   - **Warning banner**: Alert giallo per cascading invalidation
   - **3 Bottoni**: Rifiuta | Rigenera | Applica

**Expected**: UI completa con tutte le informazioni visibili e chiare

---

### Test 5: Preview Modal - Error State (Low Confidence)

**Steps**:
1. Se possibile, crea una issue con suggerimento molto vago
2. Clicca "Preview Modifica"
3. Se AI ritorna confidence < 0.7, verifica che appaia:
   - Box rosso con icona X
   - Messaggio errore "Suggestion troppo ambigua per applicazione automatica..."
   - Bottone "Riprova"

**Expected**: Error handling chiaro con opzione retry

---

### Test 6: Rigenera Preview

**Steps**:
1. Da modal con preview caricato, clicca bottone "🔄 Rigenera"
2. Verifica che:
   - UI torni a loading state
   - Venga fatta nuova chiamata API
   - Nuovo diff venga generato (potrebbe essere diverso)

**Expected**: Funzione rigenera funziona, nuovo preview appare

---

### Test 7: Rifiuta Modifica

**Steps**:
1. Da modal con preview caricato, clicca "❌ Rifiuta"
2. Verifica che:
   - Modal si chiuda
   - Nessuna modifica applicata al capitolo
   - Si torni alla lista di issues

**Expected**: Modal chiude senza applicare modifiche

---

### Test 8: Applica Modifica - Success

**Steps**:
1. Da modal con preview caricato, clicca "✅ Applica"
2. Conferma nel dialog nativo del browser
3. Verifica che:
   - Toast success: "✅ Modifica applicata al Cap. X!"
   - Toast info: "💡 Considera di rigenerare il consistency report..."
   - Modal si chiude
   - Progetto viene ricaricato (onRefresh)
4. Vai al tab "Capitoli" e verifica:
   - Capitolo modificato ha nuovo content
   - `previousContent` salvato (testa con bottone Undo)

**Expected**: Modifica applicata con successo, undo disponibile

---

### Test 9: Undo After Apply

**Steps**:
1. Dopo aver applicato una modifica (Test 8)
2. Vai al tab "Capitoli"
3. Trova il capitolo modificato
4. Clicca bottone "Undo" (se disponibile)
5. Verifica che:
   - Content torna alla versione precedente
   - Toast success: "Capitolo ripristinato!"

**Expected**: Undo funziona, versioning OK

---

### Test 10: Disabled State Durante Generazione

**Steps**:
1. Avvia generazione di un capitolo (o rigenerazione)
2. Mentre capitolo sta generando, vai al tab "Consistency"
3. Prova a cliccare "Preview Modifica" su una issue
4. Verifica che:
   - Bottone sia disabilitato (grigio, cursore not-allowed)
   - Click non apre modal

**Expected**: Bottone disabilitato durante altre operazioni AI

---

## 🐛 Known Issues / Edge Cases

### Issue 1: Highlighting non funziona con caratteri speciali
- **Symptom**: Testo con regex special chars (es. `[]`, `()`, `*`) non viene evidenziato
- **Workaround**: Controllare `highlightText()` in `DiffViewerModal.tsx` (già escaped)

### Issue 2: Modal non si chiude con ESC
- **Note**: È deliberato - modal usa componente `Modal` che supporta ESC close
- **Test**: Premi ESC durante preview

### Issue 3: Preview timeout dopo 30s
- **Note**: Timeout non implementato in questa iterazione
- **Future**: Aggiungere AbortController con timeout 30s

---

## ✅ Acceptance Criteria Checklist

### Functional:
- [ ] Feature flag ON/OFF funziona
- [ ] Bottone "Preview Modifica" appare solo per issues con chapter
- [ ] Modal si apre al click
- [ ] Loading state visibile durante generazione
- [ ] Preview diff mostra before/after correttamente
- [ ] Highlighting evidenzia modifiche
- [ ] Impact metrics corrette
- [ ] AI reasoning visibile
- [ ] Warning banner presente
- [ ] Bottone "Rigenera" funziona
- [ ] Bottone "Rifiuta" chiude senza applicare
- [ ] Bottone "Applica" salva modifiche con confirm
- [ ] Undo disponibile dopo apply
- [ ] Bottoni disabilitati durante altre operazioni

### Non-Functional:
- [ ] Performance: Preview < 20s (95th percentile)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Mobile responsive
- [ ] Accessibility: keyboard navigation OK

### Edge Cases:
- [ ] Error handling per low confidence (<0.7)
- [ ] Error handling per network errors
- [ ] Error handling per API 500
- [ ] Bottone disabled durante generazione capitoli

---

## 📊 Performance Benchmarks

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Preview Generation Time | < 20s | ??? | ⏱️ TODO |
| API Response Size | < 100KB | ??? | ⏱️ TODO |
| Modal Open Time | < 500ms | ??? | ⏱️ TODO |
| Highlighting Render | < 1s | ??? | ⏱️ TODO |

**Note**: Popolare colonna "Actual" durante testing

---

## 🔍 Debug Tips

### Modal non si apre
1. Check console: errori JavaScript?
2. Check `selectedIssue` state in React DevTools
3. Check feature flag: `FEATURE_FLAGS.SUGGESTION_AUTO_APPLY`

### Preview non carica
1. Check Network tab: chiamata API parte?
2. Check API response: 200 OK?
3. Check console: errori parsing JSON?
4. Check backend logs: AI service errors?

### Highlighting non funziona
1. Check `diffData.changes` in React DevTools
2. Check `targetText` e `newText` non siano vuoti
3. Check escape regex in `highlightText()`

### Apply non salva
1. Check Network tab: chiamata con `preview: false`?
2. Check API response: `success: true`?
3. Check Prisma Studio: `previousContent` salvato?

---

## 📝 Test Results Log

**Tester**: _____________  
**Date**: _____________  
**Environment**: Development / Staging / Production

| Test Case | Status | Notes |
|-----------|--------|-------|
| Test 1: Flag OFF | ⏱️ | |
| Test 2: Flag ON | ⏱️ | |
| Test 3: Loading | ⏱️ | |
| Test 4: Success | ⏱️ | |
| Test 5: Error | ⏱️ | |
| Test 6: Rigenera | ⏱️ | |
| Test 7: Rifiuta | ⏱️ | |
| Test 8: Applica | ⏱️ | |
| Test 9: Undo | ⏱️ | |
| Test 10: Disabled | ⏱️ | |

**Overall Status**: ⏱️ PENDING

---

**Next Steps After Testing**:
1. ✅ Fix bugs trovati
2. ✅ Aggiorna performance benchmarks
3. ✅ Deploy to staging
4. ✅ User acceptance testing
5. ✅ Production deployment (gradual rollout)
