# 🔧 Guida Risoluzione Problemi Comuni

## 🚨 Problemi e Soluzioni

### 1. ❌ Server non si avvia

**Sintomo**: `npm run dev` fallisce o esce immediatamente

**Soluzioni**:
```bash
# Soluzione 1: Pulisci cache Next.js
Remove-Item -Recurse -Force .next
npm run dev

# Soluzione 2: Reinstalla dipendenze
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev

# Soluzione 3: Verifica porta 3000 libera
netstat -ano | findstr :3000
# Se occupata, chiudi il processo o usa altra porta
$env:PORT=3001
npm run dev
```

---

### 2. ❌ Errore Database Connection

**Sintomo**: 
```
Error: Can't reach database server
PrismaClientInitializationError
```

**Soluzioni**:
```bash
# 1. Verifica variabili ambiente
cat .env | Select-String "DATABASE_URL"

# 2. Assicurati che DATABASE_URL includa ?pgbouncer=true
# Deve essere tipo:
DATABASE_URL="postgresql://...6543/postgres?pgbouncer=true&connect_timeout=15"

# 3. Testa connessione diretta
npx prisma db push

# 4. Verifica password corretta su Supabase
# Dashboard > Settings > Database > Connection String

# 5. Rigenera Prisma Client
npx prisma generate
npm run dev
```

---

### 3. ❌ Errore "prepared statement already exists"

**Sintomo**: 
```
PostgresError { code: "42P05" }
prepared statement "s0" already exists
```

**Soluzione**:
```bash
# 1. Aggiungi ?pgbouncer=true alla DATABASE_URL
# Nel file .env, modifica:
DATABASE_URL="postgresql://...?pgbouncer=true&connect_timeout=15"

# 2. Riavvia il server
npm run dev
```

**Riferimento**: Vedi `docs/TROUBLESHOOTING_PGBOUNCER.md`

---

### 4. ❌ OpenAI API Error

**Sintomo**: 
```
Error: Invalid API key
OpenAI API returned 401
```

**Soluzioni**:
```bash
# 1. Verifica che OPENAI_API_KEY sia nel .env
cat .env | Select-String "OPENAI_API_KEY"

# 2. Controlla che la chiave sia valida
# https://platform.openai.com/api-keys

# 3. Verifica che la chiave abbia credito
# https://platform.openai.com/usage

# 4. Formato corretto:
OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"

# 5. Riavvia il server dopo aver modificato .env
npm run dev
```

---

### 5. ❌ Generazione Outline Fallisce

**Sintomo**: Loader infinito o errore dopo 20+ secondi

**Soluzioni**:
```bash
# 1. Apri Developer Console (F12)
# Controlla errori in Network tab

# 2. Verifica log del server
# Nel terminale dove gira npm run dev

# 3. Testa API direttamente
curl http://localhost:3000/api/projects/PROJECT_ID/generate-outline -X POST

# 4. Controlla credito OpenAI
# https://platform.openai.com/usage

# 5. Se rate limit exceeded:
# Attendi 1 minuto e riprova
```

---

### 6. ❌ Generazione Capitoli Fallisce

**Sintomo**: Errore durante generazione capitolo

**Checklist**:
1. [ ] Outline già generato? (prerequisito)
2. [ ] Capitoli precedenti generati? (generazione sequenziale)
3. [ ] OpenAI API key valida?
4. [ ] Credito OpenAI disponibile?
5. [ ] Server ancora in esecuzione?

**Soluzioni**:
```bash
# 1. Verifica outline esiste
# Apri Prisma Studio
npm run db:studio
# Controlla tabella Outline

# 2. Verifica capitoli precedenti
# Controlla tabella Chapter
# Il capitolo N richiede capitolo N-1 generato

# 3. Rigenera capitolo specifico
# Click su "Rigenera" invece che "Genera"

# 4. Controlla log dettagliati
# Tabella GenerationLog in Prisma Studio
```

---

### 7. ❌ Export DOCX Non Funziona

**Sintomo**: Click su "Scarica DOCX" non fa nulla

**Soluzioni**:
```bash
# 1. Apri Developer Console (F12)
# Controlla errori JavaScript

# 2. Verifica che ci siano capitoli generati
# Minimo 1 capitolo necessario

# 3. Controlla Network tab
# Deve fare richiesta a /api/projects/[id]/export

# 4. Se errore server:
# Controlla log del server nel terminale

# 5. Permessi browser
# Alcuni browser bloccano download automatici
# Abilita popup/download per localhost
```

---

### 8. ❌ Build Fallisce

**Sintomo**: `npm run build` esce con errori

**Soluzioni**:
```bash
# 1. Controlla errori TypeScript
npm run lint

# 2. Verifica che .env esista
# Build ha bisogno di variabili ambiente

# 3. Pulisci e rebuilda
Remove-Item -Recurse -Force .next
npm run build

# 4. Se errore Prisma:
npx prisma generate
npm run build

# 5. Se errore dipendenze:
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

---

### 9. ❌ Modifiche Non Si Applicano

**Sintomo**: Modifico codice ma non vedo cambiamenti

**Soluzioni**:
```bash
# 1. Server in modalità dev?
# Deve essere npm run dev, non npm start

# 2. Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 3. Pulisci cache Next.js
Remove-Item -Recurse -Force .next
npm run dev

# 4. Riavvia il server
# Ctrl+C per fermare
npm run dev

# 5. Se modifichi .env:
# SEMPRE riavviare server
```

---

### 10. ❌ Prisma Migrate Fallisce

**Sintomo**: 
```
Error: P3009: Failed to apply migration
```

**Soluzioni**:
```bash
# 1. Usa DIRECT_URL per migrazioni
# Assicurati che DIRECT_URL punti a porta 5432

# 2. Reset database (ATTENZIONE: cancella dati!)
npx prisma migrate reset

# 3. O forza push
npx prisma db push --force-reset

# 4. Rigenera client
npx prisma generate

# 5. Se conflitto di schema:
# Vai su Supabase Dashboard > SQL Editor
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;
# Poi:
npx prisma migrate deploy
```

---

## 🔍 Debug Avanzato

### Abilita Logging Dettagliato

**Prisma Queries**:
```typescript
// In lib/db.ts
export const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'], // Mostra tutte le query
})
```

**OpenAI Requests**:
```typescript
// In lib/ai/openai-client.ts
console.log('OpenAI Request:', {
    model: DEFAULT_MODEL,
    prompt: prompt.substring(0, 100), // Prime 100 char
});
```

**Next.js Detailed Errors**:
```bash
# In .env
NODE_ENV=development
DEBUG=*
```

---

### Verifica Health Check

```bash
# 1. Server risponde?
curl http://localhost:3000

# 2. API risponde?
curl http://localhost:3000/api/projects

# 3. Database connesso?
npx prisma db push

# 4. OpenAI raggiungibile?
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### Prisma Studio per Debug

```bash
# Apri database viewer
npm run db:studio

# Controlla:
1. Progetti creati? → Tabella Project
2. Outline generato? → Tabella Outline
3. Capitoli salvati? → Tabella Chapter
4. Log generazione? → Tabella GenerationLog
5. Consistency report? → Tabella ConsistencyReport
```

---

## 🆘 Problema Non Risolto?

### Passi da Seguire

1. **Raccogli Informazioni**:
   ```bash
   # Salva versioni
   node --version > debug_info.txt
   npm --version >> debug_info.txt
   
   # Salva log errore
   # Copia tutto l'output del terminale
   
   # Salva console browser
   # F12 → Console → Click destro → Save as
   ```

2. **Verifica Documentazione**:
   - `docs/API_DOCUMENTATION.md` - Riferimento API
   - `docs/ARCHITECTURE.md` - Architettura sistema
   - `docs/TROUBLESHOOTING_PGBOUNCER.md` - Problemi database

3. **Reset Completo** (ultima risorsa):
   ```bash
   # ⚠️ ATTENZIONE: Cancella tutti i dati
   
   # 1. Ferma server
   # Ctrl+C
   
   # 2. Pulisci tutto
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   
   # 3. Reinstalla
   npm install
   
   # 4. Reset database
   npx prisma migrate reset
   
   # 5. Genera client
   npx prisma generate
   
   # 6. Riavvia
   npm run dev
   ```

---

## 📞 Contatti & Supporto

### Prima di Chiedere Aiuto

Prepara:
1. [ ] Descrizione problema
2. [ ] Steps per riprodurre
3. [ ] Output errore completo
4. [ ] Versioni (node, npm, prisma)
5. [ ] Screenshot (se UI issue)
6. [ ] File `.env.example` (NON il .env reale!)

### Risorse Utili

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Documento aggiornato**: 11 Ottobre 2025  
**Versione**: 1.0
