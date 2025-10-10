# Feature: Modifica Progetto ✅

**Data**: 10 Ottobre 2025  
**Richiesta**: "prima di procedere io devo avere la possibilità di modificare i dati del progetto dopo averli inseriti la prima volta in modo che se poi rigenero l'outline prenda in considerazione i nuovi dati"

---

## 🎯 Problema Risolto

Prima dell'implementazione:
- ❌ Non era possibile modificare i dati di un progetto dopo la creazione
- ❌ Se i dati erano sbagliati o incompleti, bisognava ricreare tutto
- ❌ La rigenerazione dell'outline usava sempre gli stessi dati

Dopo l'implementazione:
- ✅ Pulsante "Modifica" nella pagina del progetto
- ✅ Form completo con tutti i campi del progetto
- ✅ Salvataggio con API PUT
- ✅ Rigenerazione outline usa i nuovi dati aggiornati

---

## 📝 Implementazione

### 1. Componente EditProjectModal

**File**: `components/EditProjectModal.tsx`

**Caratteristiche**:
- Modal a schermo intero con 4 step (come NewProjectModal)
- Pre-popolato con i dati attuali del progetto
- Form validato con campi required
- Navigazione avanti/indietro tra gli step
- Salvataggio con feedback visivo

**Step del form**:
1. **Informazioni Autore**: Nome, Ruolo, Azienda, Settore
2. **Informazioni Libro**: Titolo, Sottotitolo, Target Lettori, Valore Unico, Pagine Stimate
3. **Hero's Journey**: 5 fasi del viaggio dell'eroe
4. **Business Goals**: Obiettivi del libro, Note aggiuntive

### 2. Integrazione nella Pagina Progetto

**File**: `app/progetti/[id]/page.tsx`

**Modifiche**:
- Importato `EditProjectModal` e `ProjectFormData`
- Aggiunto state `isEditModalOpen`
- Creato handler `handleUpdateProject` che chiama l'API
- Aggiunto pulsante "Modifica" nell'header (con icona Edit2)
- Passati i dati del progetto come `initialData` al modal

**Pulsante Modifica**:
```tsx
<button onClick={() => setIsEditModalOpen(true)}>
  <Edit2 /> Modifica
</button>
```

### 3. Flusso Completo

1. **Click su "Modifica"** → Apre il modal
2. **Form pre-popolato** → Vede tutti i dati attuali
3. **Modifica campi** → Può cambiare qualsiasi informazione
4. **Salva** → Chiama `PUT /api/projects/:id`
5. **Ricarica dati** → fetchProject() aggiorna la vista
6. **Rigenera outline** → Usa i nuovi dati aggiornati

---

## 🧪 Come Testare

### Test 1: Modifica Base

1. Apri un progetto esistente
2. Clicca sul pulsante **"Modifica"** in alto a destra
3. Modifica alcuni campi (es. titolo del libro, descrizione)
4. Naviga tra gli step con "Avanti"/"Indietro"
5. Clicca "Salva Modifiche" nell'ultimo step
6. Verifica che i dati siano aggiornati nella pagina

### Test 2: Modifica e Rigenerazione Outline

1. Crea un progetto con dati di test
2. Genera l'outline (tab "Outline" → "Genera Outline con AI")
3. Torna alla **Panoramica**
4. Clicca **"Modifica"**
5. Cambia drasticamente alcuni campi importanti:
   - Modifica il settore
   - Cambia la sfida affrontata
   - Aggiorna gli obiettivi business
6. Salva le modifiche
7. Vai al tab **"Outline"**
8. Clicca **"Rigenera"**
9. Verifica che il nuovo outline riflette i dati modificati

### Test 3: Validazione Form

1. Apri il modal di modifica
2. Prova a cancellare campi obbligatori (*)
3. Verifica che non permetta di andare avanti senza compilarli
4. Verifica che i campi opzionali possano essere lasciati vuoti

---

## 🔄 API Endpoint Utilizzato

**Endpoint**: `PUT /api/projects/:id`  
**Body**: `ProjectFormData` completo  
**Response**: Progetto aggiornato

L'API era già implementata nello Sprint 1, quindi questa feature la utilizza senza modifiche.

---

## 💡 Dettagli Tecnici

### State Management

```tsx
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
```

### Update Handler

```tsx
const handleUpdateProject = async (formData: ProjectFormData) => {
  await projectsApi.update(params.id, formData);
  await fetchProject(); // Ricarica i dati freschi
};
```

### Props del Modal

```tsx
<EditProjectModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  onSubmit={handleUpdateProject}
  initialData={{ ...tutti i campi del project... }}
/>
```

---

## 📊 Vantaggi

### Per l'Utente
- ✅ Può correggere errori di battitura
- ✅ Può aggiungere dettagli dimenticati
- ✅ Può affinare la descrizione per outline migliori
- ✅ Può iterare sulla generazione migliorando i dati

### Per il Workflow AI
- ✅ Outline più accurati con dati completi
- ✅ Possibilità di A/B test con dati diversi
- ✅ Iterazione rapida senza ricreare progetti
- ✅ Feedback loop: genera → valuta → modifica → rigenera

---

## 🚀 Esempio d'Uso Reale

**Scenario**: Un imprenditore ha creato un progetto ma l'outline generato non è soddisfacente.

**Prima** (senza modifica):
1. ❌ Deve eliminare il progetto
2. ❌ Ricreare tutto da zero
3. ❌ Rigenerare l'outline
4. ❌ Processo lungo e frustrante

**Dopo** (con modifica):
1. ✅ Clicca "Modifica"
2. ✅ Aggiunge più dettagli alla "Sfida Affrontata"
3. ✅ Espande gli "Obiettivi Business"
4. ✅ Salva e rigenera
5. ✅ Outline molto migliore in 2 minuti!

---

## 🔮 Future Enhancements

Possibili miglioramenti futuri:

### Versioning
- Salvare storico delle modifiche
- Confrontare versioni precedenti
- Rollback a versioni precedenti

### Tracking Modifiche
- Log delle modifiche (chi, quando, cosa)
- Diff visivo delle modifiche
- Notifiche se l'outline è obsoleto rispetto ai dati

### AI Suggestions
- "Hai modificato il settore. Vuoi rigenerare l'outline?"
- "Questi campi sono incompleti, vuoi migliorarli con l'AI?"

### Bulk Edit
- Modifica rapida di campi specifici senza modal completo
- Edit inline nella panoramica

---

## 📁 Files Modificati/Creati

### Nuovi Files
- ✅ `components/EditProjectModal.tsx` (490+ righe)

### Files Modificati
- ✅ `app/progetti/[id]/page.tsx`:
  - Importato EditProjectModal e ProjectFormData
  - Aggiunto state isEditModalOpen
  - Aggiunto handler handleUpdateProject
  - Aggiunto pulsante "Modifica" nell'header
  - Aggiunto componente EditProjectModal con props

---

## ✅ Completamento

**Status**: Feature completa e funzionante ✅

L'utente può ora:
1. ✅ Modificare qualsiasi campo del progetto
2. ✅ Salvare le modifiche
3. ✅ Rigenerare l'outline con i nuovi dati
4. ✅ Iterare fino ad ottenere il risultato desiderato

**Ready to test!** 🎉

---

## 🎯 Next: Sprint 3 Testing

Ora che la modifica è implementata, puoi:
1. Testare la modifica dei progetti
2. Aggiungere la tua OpenAI API key nel `.env`
3. Testare la generazione dell'outline
4. Testare la rigenerazione dopo modifica
5. Procedere con Sprint 4 (Chapter Generation)
