# 🧹 Pre-Push Checklist per GitHub

## ✅ Files da Verificare PRIMA di Push

### 🔒 Sicurezza - CRITICO

- [ ] `.env` è nel `.gitignore` ✅
- [ ] `.env` NON è mai stato committato
- [ ] `.env.example` non contiene dati sensibili ✅
- [ ] Nessuna API key nel codice sorgente
- [ ] Nessuna password nel codice sorgente
- [ ] Nessun token di autenticazione hardcoded

### 📁 Files da Includere

- [ ] `README.md` completo e aggiornato ✅
- [ ] `LICENSE` file presente ✅
- [ ] `.gitignore` configurato correttamente ✅
- [ ] `.env.example` con template pulito ✅
- [ ] `package.json` con dipendenze corrette ✅
- [ ] `prisma/schema.prisma` ✅
- [ ] Documentazione in `/docs` ✅

### 🚫 Files da NON Includere

- [ ] `.env` (contiene secret!) ✅ IGNORATO
- [ ] `node_modules/` ✅ IGNORATO
- [ ] `.next/` ✅ IGNORATO
- [ ] `*.log` files ✅ IGNORATO
- [ ] Database files locali ✅ IGNORATO
- [ ] IDE config (`.vscode/`, `.idea/`) ✅ IGNORATO

### 🧪 Test Pre-Push

```bash
# 1. Verifica .gitignore
git check-ignore .env
# Dovrebbe stampare: .env

# 2. Verifica che .env non sia tracked
git ls-files | grep "\.env$"
# Non dovrebbe stampare nulla

# 3. Build test
npm run build
# Dovrebbe completare senza errori

# 4. Type check
npx tsc --noEmit
# Nessun errore TypeScript
```

---

## 🚀 Procedura Push su GitHub

### 1. Inizializza Git (se non fatto)
```bash
git init
```

### 2. Verifica .gitignore
```bash
git check-ignore .env
# Output atteso: .env
```

### 3. Add Files
```bash
git add .
```

### 4. Verifica cosa stai per committare
```bash
git status
```

⚠️ **VERIFICA CHE NON CI SIA**:
- `.env` file
- Nessun file con API keys
- Nessun file con password

### 5. Commit
```bash
git commit -m "Initial commit: Ghost Writing Platform with AI"
```

### 6. Crea Repository su GitHub
1. Vai su https://github.com/new
2. Nome: `ghost-writing-platform` (o quello che preferisci)
3. Descrizione: "AI-powered platform for creating business books"
4. **IMPORTANTE**: NON inizializzare con README (ce l'hai già)
5. **IMPORTANTE**: NON aggiungere .gitignore (ce l'hai già)
6. Clicca "Create repository"

### 7. Collega Remote
```bash
git remote add origin https://github.com/TUO_USERNAME/ghost-writing-platform.git
```

### 8. Push
```bash
# Per GitHub con branch "main"
git branch -M main
git push -u origin main
```

---

## 🔍 Verifica Post-Push

### Su GitHub Web
1. ✅ README.md visualizzato correttamente
2. ✅ LICENSE file presente
3. ✅ `.env` NON presente nella repo
4. ✅ `.env.example` presente e pulito
5. ✅ Documentazione `/docs` accessibile

### File Critici da Verificare NON siano presenti
```
🚫 .env
🚫 .env.local
🚫 node_modules/
🚫 API keys visibili nel codice
🚫 Password nel codice
```

---

## 🛡️ Protezione Repository

### Settings Raccomandati

1. **Branch Protection** (Settings > Branches):
   - Require pull request reviews
   - Require status checks

2. **Security** (Settings > Security):
   - Enable Dependabot alerts
   - Enable secret scanning

3. **Environment Secrets** (Settings > Secrets):
   - Aggiungi `OPENAI_API_KEY` come secret per GitHub Actions

---

## 📋 Checklist Rapida

Prima di ogni push:
```bash
# 1. Build OK?
npm run build

# 2. .env ignorato?
git check-ignore .env

# 3. No secrets nel codice?
git diff --cached | grep -i "sk-proj\|password\|secret"

# 4. Commit OK?
git commit -m "Your message"

# 5. Push!
git push
```

---

## ⚠️ In Caso di Errore

### Se hai committato .env per sbaglio:

```bash
# 1. Rimuovi .env dalla storia Git
git rm --cached .env

# 2. Commit la rimozione
git commit -m "Remove .env from repository"

# 3. Push
git push
```

### Se hai pushato API keys:

1. **REVOCA IMMEDIATAMENTE** tutte le API keys esposte
2. Genera nuove API keys
3. Aggiornale nel tuo `.env` locale
4. Pulisci la storia Git (vedi sopra)

---

## ✅ Status Finale

Dopo aver completato:

- [ ] Repository creata su GitHub
- [ ] Codice pushato
- [ ] README visualizzato correttamente
- [ ] `.env` non presente nella repo
- [ ] Build funzionante
- [ ] Documentazione accessibile
- [ ] License file presente

**Ready to share! 🎉**
