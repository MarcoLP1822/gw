# 🎯 Come Testare la Generazione Outline con AI

## Setup Rapido

### 1. Ottieni la tua OpenAI API Key

1. Vai su: https://platform.openai.com/api-keys
2. Fai login (o crea account se non ce l'hai)
3. Clicca "Create new secret key"
4. Copia la chiave (inizia con `sk-proj-...`)

### 2. Configura il .env

Apri il file `.env` e incolla la tua chiave:

```bash
OPENAI_API_KEY="sk-proj-TUA_CHIAVE_QUI"
```

### 3. Riavvia il Server

```bash
# Ferma il server (Ctrl+C nel terminale)
npm run dev
```

---

## 🧪 Test Flow

### 1. Crea un Progetto

1. Apri: http://localhost:3000
2. Clicca "Nuovo Progetto"
3. Compila TUTTI i campi del form:
   - Informazioni Autore
   - Informazioni Libro
   - Hero's Journey (tutte le 5 fasi)
   - Business Goals
4. Salva il progetto

### 2. Genera l'Outline

1. Clicca sul progetto appena creato
2. Vai al tab **"Outline"**
3. Clicca **"Genera Outline con AI"**
4. Attendi 10-30 secondi ⏳
5. Boom! 🎉 Outline generato

### 3. Cosa Aspettarti

Dovresti vedere:
- **Titolo del libro** (generato dall'AI)
- **Sottotitolo** attraente
- **Descrizione** del libro
- **10-15 capitoli** con:
  - Titolo capitolo
  - Descrizione breve
  - 3-5 punti chiave da trattare
  - Fase del Viaggio dell'Eroe

---

## 💰 Costi

Ogni generazione costa circa **$0.003** (meno di 1 centesimo!)

**Dettaglio**:
- Modello: `gpt-4o-mini` (il più economico di OpenAI)
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Tokens usati: ~3000 totali

Con $1 puoi generare circa **300+ outline**! 🚀

---

## 🐛 Se Qualcosa Non Funziona

### Errore: "Nessuna risposta da OpenAI"

**Soluzione**: Controlla che la tua API key sia corretta nel `.env`

### Errore: "Progetto non trovato"

**Soluzione**: Assicurati che il progetto esista nel database

### Loading infinito

**Soluzione**:
1. Apri la console del browser (F12)
2. Guarda eventuali errori
3. Controlla il terminale del server per log

### Outline vuoto o malformato

**Soluzione**: Rigenera cliccando "Rigenera". L'AI a volte ha bisogno di un secondo tentativo.

---

## 📊 Verifica Database

Puoi controllare cosa è stato salvato:

```bash
npm run db:studio
```

Si apre Prisma Studio su http://localhost:5555

**Controlla**:
- **Outline table**: Vedi la struttura JSON dell'outline
- **GenerationLog table**: Vedi token utilizzati e costi

---

## 🎨 Features Implementate

✅ Generazione outline automatica con AI  
✅ Visualizzazione professionale con card  
✅ Pulsante "Rigenera" per nuove versioni  
✅ Loading states e error handling  
✅ Tracking costi e usage nel database  
✅ Supporto completo Hero's Journey  

---

## 🚀 Prossimo Step: Sprint 4

Dopo aver testato l'outline, implementeremo:
- **Generazione dei singoli capitoli** (2000-3000 parole ciascuno)
- **Pulsante "Genera Capitolo"** per ogni capitolo dell'outline
- **Preview e edit** del contenuto generato
- **Salvataggio in database**

---

## 💡 Tips

1. **Descrizioni dettagliate**: Più dettagli fornisci nel form del progetto, migliore sarà l'outline generato
2. **Rigenera liberamente**: Non costa quasi nulla, prova diverse versioni!
3. **Salva nel database**: Ogni outline viene salvato automaticamente
4. **Monitora i costi**: Controlla la tabella GenerationLog

---

## 📞 Hai Problemi?

Controlla:
1. `.env` ha la chiave OpenAI corretta
2. Server è riavviato dopo aver modificato .env
3. Database è connesso (Supabase)
4. Tutti i campi del progetto sono compilati

Buon test! 🎉
