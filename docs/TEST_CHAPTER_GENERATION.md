# 🎯 Quick Test Guide - Sprint 4 Chapter Generation

## Setup Veloce (5 minuti)

### 1. Verifica Environment Variables

Assicurati che `.env` contenga:
```bash
OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2. Avvia il Server

```bash
npm run dev
```

Server attivo su: http://localhost:3000

---

## 🧪 Test Flow Completo

### STEP 1: Crea un Progetto di Test

1. Vai su http://localhost:3000
2. Click "Nuovo Progetto"
3. Compila con questi dati di esempio:

```
INFORMAZIONI AUTORE:
- Nome: Marco Bianchi
- Ruolo: CEO & Founder
- Azienda: TechVision Italia
- Settore: Technology

INFORMAZIONI LIBRO:
- Titolo: "Da Developer a Leader"
- Sottotitolo: "Il viaggio di un imprenditore tech"
- Target: Giovani imprenditori tech e startup founders

HERO'S JOURNEY:
- Situazione iniziale: "Ho iniziato come developer freelance nel 2015, lavorando da casa senza un piano chiaro..."
- Sfida: "Il passaggio da tecnico a leader è stato il più difficile. Dovevo imparare business, gestione team, vendita..."
- Trasformazione: "Ho capito che la tecnologia da sola non basta. Ho studiato leadership, fatto coaching..."
- Risultati: "In 5 anni ho portato l'azienda da 0 a 50 dipendenti e 5M€ di fatturato..."
- Lezione: "Il successo dipende dalle persone, non dal codice. Un team motivato vale più di qualsiasi tecnologia..."

OBIETTIVI BUSINESS:
"Voglio ispirare giovani developer a diventare imprenditori. Mostrare che è possibile costruire un'azienda tech solida in Italia..."

VALORE UNICO:
"Combino competenza tecnica profonda con visione business pragmatica. Parlo la lingua dei developer ma penso come un CEO..."

PAGINE STIMATE: 200
```

4. Click "Crea Progetto"

---

### STEP 2: Genera l'Outline

1. Nel progetto appena creato, vai al tab **"Outline"**
2. Click **"Genera Outline con AI"**
3. **Attendi 15-30 secondi** ⏳
4. **Verifica risultato**:
   - Dovresti vedere titolo, sottotitolo, descrizione
   - Lista di ~10-12 capitoli
   - Ogni capitolo ha: titolo, descrizione, punti chiave, fase Hero's Journey

**Esempio output atteso**:
```
Capitolo 1: Il Mondo del Freelancer
Capitolo 2: La Chiamata all'Imprenditoria
Capitolo 3: Primi Passi e Primi Errori
...
Capitolo 10: Il Team che Ho Sempre Sognato
Capitolo 11: Scaling e Crescita
Capitolo 12: Lezioni per il Futuro
```

---

### STEP 3: Genera Capitolo 1

1. Nella lista dei capitoli dell'outline, trova **Capitolo 1**
2. Click sul pulsante **"✨ Genera Capitolo"** (dovrebbe essere l'unico abilitato)
3. **Attendi 25-40 secondi** ⏳ (è più lungo perché genera 2000-3000 parole)
4. **Verifica**:
   - Capitolo 1 mostra **"✅ Generato"** (pulsante verde)
   - Capitolo 2 ora mostra **"✨ Genera Capitolo"** (abilitato)
   - Capitoli 3+ mostrano **"🔒 Bloccato"**

---

### STEP 4: Genera Capitolo 2 (Style Guide Creation)

1. Click **"✨ Genera Capitolo"** su Capitolo 2
2. **Attendi 25-40 secondi** ⏳
3. **IMPORTANTE**: Durante questa generazione, il sistema:
   - Analizza Cap 1 + Cap 2
   - Estrae lo **Style Guide** automaticamente
   - Lo salverà nel database
4. **Verifica**:
   - Capitolo 2 completato ✅
   - Capitolo 3 abilitato ✨

**Controlla Style Guide nel DB**:
```bash
npm run db:studio
```
- Vai alla tabella `Project`
- Trova il tuo progetto
- Campo `styleGuide` dovrebbe contenere JSON con:
  - `tone`, `pov`, `tense`, `sentenceLength`, ecc.

---

### STEP 5: Visualizza i Capitoli Generati

1. Vai al tab **"Capitoli"**
2. Dovresti vedere:
   - **Header** con statistiche: "2 capitoli, X parole totali"
   - **Card per Capitolo 1** con:
     - Titolo completo
     - Word count, AI model, data generazione
     - Preview contenuto (clippato a 6 righe)
     - Pulsanti "Modifica" e "Rigenera"
   - **Card per Capitolo 2** identica

---

### STEP 6: Test Edit Manuale

1. Su **Capitolo 1**, click **"Modifica"**
2. Si apre un **textarea grande** con tutto il contenuto in Markdown
3. **Modifica qualcosa** (es: cambia una frase nell'introduzione)
4. Click **"Salva"**
5. **Verifica**:
   - Il pulsante torna a "Modifica"
   - Il word count si aggiorna automaticamente
   - Il contenuto è salvato

---

### STEP 7: Test Rigenerazione

1. Su **Capitolo 2**, click **"Rigenera"**
2. **Conferma** il dialog: "Rigenerare il Capitolo 2? Il contenuto attuale verrà sostituito."
3. **Attendi 25-40 secondi** ⏳
4. **Verifica**:
   - Capitolo 2 ha nuovo contenuto
   - Il sistema ha mantenuto coerenza con Capitolo 1
   - Il word count è aggiornato

---

### STEP 8: Genera Tutti i Capitoli (Opzionale - richiede tempo)

Se vuoi testare il flow completo:

1. Torna al tab **"Outline"**
2. Genera Cap 3, 4, 5... **sequenzialmente** (uno alla volta)
3. Ogni generazione richiede ~30 secondi
4. **Per 10 capitoli totali**: ~5-8 minuti

**Nota**: Non puoi saltare capitoli! Devi generarli in ordine.

---

### STEP 9: Consistency Check Finale (Solo se hai tutti i capitoli)

1. Vai al tab **"Capitoli"**
2. Se hai generato tutti i capitoli dell'outline, vedrai:
   - **Pulsante "Consistency Check"** abilitato (viola)
3. Click **"Consistency Check"**
4. **Attendi 45-90 secondi** ⏳ (analizza TUTTO il libro con gpt-4o)
5. **Visualizza Report**:
   - **Overall Score**: 0-100
   - **Breakdown**: Narrativa, Stile, Coerenza (ognuno 0-100)
   - **Issues List**: Con severity (alta/media/bassa) e suggerimenti
   - **Raccomandazioni**: Lista di miglioramenti generali

**Esempio report**:
```
Overall Score: 87/100

Narrativa: 90/100
Stile: 85/100
Coerenza: 86/100

Issues:
🔴 HIGH: Cap. 5 - Contraddizione con Cap. 2 riguardo al numero di dipendenti
💡 Soluzione: Verificare e allineare i numeri

🟡 MEDIUM: Cap. 7 - Cambio di tono più formale rispetto ai capitoli precedenti
💡 Soluzione: Riscrivere le prime 3 pagine con tono più colloquiale

Raccomandazioni:
• Rafforzare la transizione tra Cap 4 e Cap 5
• Aggiungere più esempi concreti in Cap 8
• La conclusione potrebbe richiamare meglio l'introduzione
```

---

## 🔍 Verifica Database

Durante i test, controlla cosa viene salvato:

```bash
npm run db:studio
```

### Tabelle da verificare:

1. **Project**:
   - `masterContext`: Dovrebbe contenere `{ characters: [...], terms: {...}, numbers: {...} }`
   - `styleGuide`: Dopo Cap 2, contiene tono, POV, etc.

2. **Chapter**:
   - `content`: Markdown completo del capitolo
   - `wordCount`: Numero di parole
   - `newCharacters`: Array di personaggi introdotti
   - `newTerms`: Oggetto con termini spiegati
   - `keyNumbers`: Oggetto con numeri/metriche
   - `summary`: Summary del capitolo
   - `keyPoints`: Array di punti chiave

3. **ConsistencyReport**:
   - `report`: JSON completo del report
   - `overallScore`: Score numerico

4. **GenerationLog**:
   - Ogni generazione (outline + capitoli + checks)
   - Token usage e costi per ognuna

---

## 💰 Monitoraggio Costi

Ogni generazione logga i costi. Verifica:

```bash
# Nella tabella GenerationLog
SELECT 
  step, 
  aiModel, 
  totalTokens, 
  cost, 
  duration, 
  success 
FROM "GenerationLog" 
WHERE projectId = 'TUO_PROJECT_ID'
ORDER BY createdAt DESC;
```

**Costi attesi**:
- Outline: ~$0.003
- Capitolo: ~$0.003-0.005
- Mini check: ~$0.001
- Style guide: ~$0.003
- Final check: ~$0.05

**Totale per libro 10 capitoli**: ~$0.10 🎉

---

## 🐛 Troubleshooting

### Problema: "Genera prima l'outline"
**Soluzione**: Devi generare l'outline prima di poter generare capitoli.

### Problema: "Completa prima il Capitolo X"
**Soluzione**: I capitoli vanno generati in ordine. Non puoi saltare.

### Problema: Capitolo generato è troppo corto o lungo
**Soluzione**: 
- Rigenera il capitolo
- Oppure editalo manualmente
- Oppure modifica i prompt in `lib/ai/prompts/chapter-generator.ts`

### Problema: Style inconsistente tra capitoli
**Soluzione**:
- Rigenera i primi 2 capitoli per ottenere un nuovo style guide
- Oppure rigenera i capitoli successivi che hanno problemi

### Problema: Consistency check mostra molti errori HIGH
**Soluzione**:
- Leggi gli issues specifici
- Rigenera i capitoli problematici
- Oppure editali manualmente
- Ri-esegui consistency check

### Problema: Generazione molto lenta (>60 secondi)
**Soluzione**:
- Controlla la tua connessione internet
- Verifica lo status di OpenAI: https://status.openai.com/
- Se persiste, potrebbe essere rate limit (prova dopo qualche minuto)

---

## 📊 Testing Checklist

Usa questa checklist per un test completo:

- [ ] Progetto creato con successo
- [ ] Outline generato correttamente (~10-12 capitoli)
- [ ] Capitolo 1 generato (✅ pulsante verde)
- [ ] Capitolo 2 abilitato dopo Cap 1
- [ ] Capitolo 2 generato (style guide creato)
- [ ] Style guide salvato nel DB (verifica con db:studio)
- [ ] Tab Capitoli mostra i 2 capitoli
- [ ] Edit manuale funziona
- [ ] Salvataggio edit aggiorna word count
- [ ] Rigenerazione capitolo funziona
- [ ] Master context si popola progressivamente
- [ ] (Opzionale) Tutti i capitoli generati
- [ ] (Opzionale) Consistency check eseguito
- [ ] (Opzionale) Report visualizzato correttamente
- [ ] GenerationLog contiene tutti i log
- [ ] Costi sono ragionevoli (~$0.003-0.005 per capitolo)

---

## 🎯 Next Steps

Dopo aver testato con successo Sprint 4:

1. **Testa con progetti diversi**:
   - Prova con settori diversi (coaching, consulenza, e-commerce)
   - Prova con stili diversi (formale vs informale)
   - Prova con lunghezze diverse (5 capitoli vs 15)

2. **Sperimenta con i prompts**:
   - Modifica `lib/ai/prompts/chapter-generator.ts`
   - Prova temperature diverse (0.5-0.9)
   - Prova max_tokens diversi (3000-5000)

3. **Prepara per Sprint 5**:
   - Export DOCX
   - Document assembly
   - Formatting professionale

---

## ✅ Test Completato!

Se hai seguito tutti gli step e tutto funziona, **Sprint 4 è pronto per la produzione**! 🚀

Prossimo: **Sprint 5 - Document Export & DOCX Generation** 📄
