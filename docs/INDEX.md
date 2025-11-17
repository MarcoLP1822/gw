# 📚 Documentazione - Index

**Guida completa alla navigazione della documentazione**

---

## 🚀 **Start Here**

### Per Iniziare
1. **[README.md](../README.md)** - Overview del progetto
2. **[QUICK_FIXES.md](../QUICK_FIXES.md)** - Soluzioni rapide ai problemi
3. **[DEBUG_SUMMARY.md](../DEBUG_SUMMARY.md)** - Riepilogo stato app

### Setup Ambiente
```powershell
# 1. Health check
.\scripts\health-check.ps1

# 2. Se OK, start development
npm run dev

# 3. Se problemi, consulta QUICK_FIXES.md
```

---

## 📖 **Documentation Map**

### 🔍 Debug & Troubleshooting
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[DEBUG_SUMMARY.md](../DEBUG_SUMMARY.md)** | Riepilogo esecutivo + Roadmap | Panoramica veloce |
| **[DEBUG_REPORT.md](../DEBUG_REPORT.md)** | Analisi completa di debug | Approfondimento tecnico |
| **[QUICK_FIXES.md](../QUICK_FIXES.md)** | Soluzioni rapide | Quando hai un problema |
| **[TROUBLESHOOTING_GUIDE.md](../TROUBLESHOOTING_GUIDE.md)** | Guide dettagliate | Debug avanzato |

### 🏗️ Architecture & Design
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architettura sistema | Capire struttura progetto |
| **[COMPONENTS.md](COMPONENTS.md)** | Guida componenti UI | Sviluppo frontend |
| **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** | Sommario progetto | Overview features |

### 🔒 Security
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[SECURITY.md](SECURITY.md)** ⭐ NEW | Best practices sicurezza | Prima di produzione |
| - Authentication | NextAuth.js setup | Implementare auth |
| - Rate Limiting | Protezione API | Evitare abusi |
| - Input Validation | Zod schemas | Validare input |

### 🚀 API & Integration
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | API routes complete | Sviluppo API |
| **[WEB_CRAWLING_FEATURE.md](WEB_CRAWLING_FEATURE.md)** | Web scraping | Feature crawling |
| **[DOCUMENT_BASED_PROJECT_CREATION.md](DOCUMENT_BASED_PROJECT_CREATION.md)** | Upload documenti | Feature upload |

### 🧪 Testing
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[TESTING.md](TESTING.md)** | Guida ai test | Scrivere test |
| **[TEST_IMPLEMENTATION_SUMMARY.md](../TEST_IMPLEMENTATION_SUMMARY.md)** | Stato test | Verificare coverage |

### 🗄️ Database
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[DATABASE_SETUP.md](DATABASE_SETUP.md)** | Setup database | Prima volta |
| **[TROUBLESHOOTING_PGBOUNCER.md](TROUBLESHOOTING_PGBOUNCER.md)** | Fix Supabase | Problemi connessione |

### 🎨 Design & Features
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)** | Design responsive | Mobile/tablet |
| **[FLIPBOOK_IMPLEMENTATION_PLAN.md](FLIPBOOK_IMPLEMENTATION_PLAN.md)** | Piano flipbook | Feature flipbook |

### 📦 Deployment
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deploy su Vercel | Pubblicazione |
| **[VERCEL_BLOB_SETUP.md](VERCEL_BLOB_SETUP.md)** | Setup Vercel Blob | Upload files |
| **[FIX_UPLOAD_FILE_SIZE_LIMIT.md](FIX_UPLOAD_FILE_SIZE_LIMIT.md)** | Fix limiti upload | Upload > 4.5MB |

### 📝 Change History
| File | Descrizione | Quando Usarlo |
|------|-------------|---------------|
| **[CHANGELOG.md](CHANGELOG.md)** | Storia modifiche | Vedere evoluzione |

---

## 🛠️ **Code References**

### Librerie Utility ⭐ NEW
```
lib/
├── logger.ts          ⭐ Logging strutturato
├── rate-limit.ts      ⭐ Rate limiting
├── errors/
│   └── api-errors.ts      Gestione errori
└── ai/
    ├── openai-client.ts   Client OpenAI
    └── responses-api.ts   GPT-5 API
```

### Scripts Utility ⭐ NEW
```
scripts/
├── health-check.ps1           ⭐ Health check
├── update-dependencies.ps1    ⭐ Update deps
├── test-db-connection.ts      Test DB
└── seed-test-data.ts          Seed dati
```

### Components Principali
```
components/
├── ErrorDisplay.tsx           Gestione errori UI
├── ProjectTableV2.tsx         Lista progetti
├── WorkflowPanel.tsx          Generazione AI
└── ui/
    ├── Skeleton.tsx           Loading states
    └── Tooltip.tsx            Tooltips
```

---

## 🎯 **Use Cases**

### "Ho un problema, come lo risolvo?"
1. Vai a **[QUICK_FIXES.md](../QUICK_FIXES.md)**
2. Cerca il sintomo del tuo problema
3. Segui la soluzione

### "Devo capire come funziona l'app"
1. Leggi **[DEBUG_SUMMARY.md](../DEBUG_SUMMARY.md)** per overview
2. Leggi **[ARCHITECTURE.md](ARCHITECTURE.md)** per dettagli
3. Consulta **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** per API

### "Devo implementare una feature"
1. Cerca in `docs/` se esiste già documentazione
2. Guarda `examples/` per pattern simili
3. Consulta **[COMPONENTS.md](COMPONENTS.md)** per UI

### "Devo fare deploy in produzione"
**IMPORTANTE**: Leggi prima **[SECURITY.md](SECURITY.md)**

1. Implementa autenticazione (NextAuth.js)
2. Applica rate limiting
3. Configura monitoring
4. Segui **[DEPLOYMENT.md](DEPLOYMENT.md)**

### "I test falliscono"
1. Consulta **[TESTING.md](TESTING.md)**
2. Verifica **[TEST_IMPLEMENTATION_SUMMARY.md](../TEST_IMPLEMENTATION_SUMMARY.md)**
3. Esegui `npm test -- --watch`

---

## 📊 **Metrics & Status**

### Ultimo Health Check
```
✅ Passed: 6
⚠️  Warnings: 1
❌ Errors: 0

Status: App is functional but has warnings
```

### Code Quality Scores
```
Code Quality:    ⭐⭐⭐⭐☆ 4/5
Type Safety:     ⭐⭐⭐⭐⭐ 5/5
Error Handling:  ⭐⭐⭐⭐⭐ 5/5
Security:        ⭐⭐☆☆☆ 2/5  ⚠️
Performance:     ⭐⭐⭐⭐☆ 4/5
Documentation:   ⭐⭐⭐⭐☆ 4/5
Testing:         ⭐⭐⭐☆☆ 3/5

Overall: 27/35 (77%) - GOOD
```

### Warnings
- ⚠️ 12 packages outdated (non critico)
- ⚠️ Authentication non implementata (CRITICO per prod)
- ⚠️ Rate limiting assente (IMPORTANTE)

---

## 🔄 **Update Cycle**

### Daily
```powershell
# Check app status
.\scripts\health-check.ps1

# Se OK, continua sviluppo
npm run dev
```

### Weekly
```powershell
# Check for updates
npm outdated

# Se ci sono update importanti
.\scripts\update-dependencies.ps1
```

### Before Production Deploy
```
1. ✅ Implementa authentication
2. ✅ Applica rate limiting
3. ✅ Setup monitoring
4. ✅ Esegui tutti i test
5. ✅ Verifica SECURITY.md checklist
6. ✅ Deploy staging
7. ✅ Test staging
8. ✅ Deploy production
```

---

## 📞 **Getting Help**

### Self-Service
1. **[QUICK_FIXES.md](../QUICK_FIXES.md)** - 90% dei problemi comuni
2. **[DEBUG_REPORT.md](../DEBUG_REPORT.md)** - Analisi tecnica
3. **[TROUBLESHOOTING_GUIDE.md](../TROUBLESHOOTING_GUIDE.md)** - Debug avanzato

### Code Examples
- `/examples` folder - Pattern di utilizzo
- `/tests` folder - Test cases

### Tools
```powershell
# Health check completo
.\scripts\health-check.ps1

# Test connessione DB
npm run test:db

# Verifica deployment
npm run verify:deployment
```

---

## 🗺️ **Quick Navigation**

```
ghost/
├── 📄 README.md                    ← Start here
├── 📄 DEBUG_SUMMARY.md            ← Overview ⭐
├── 📄 DEBUG_REPORT.md             ← Deep dive ⭐
├── 📄 QUICK_FIXES.md              ← Solutions ⭐
│
├── docs/
│   ├── 📄 INDEX.md                ← You are here
│   ├── 📄 SECURITY.md             ← Must read ⭐
│   ├── 📄 ARCHITECTURE.md         ← System design
│   ├── 📄 API_DOCUMENTATION.md    ← API reference
│   ├── 📄 TESTING.md              ← Testing guide
│   └── 📄 DEPLOYMENT.md           ← Deploy guide
│
├── lib/
│   ├── logger.ts                  ← New ⭐
│   └── rate-limit.ts              ← New ⭐
│
└── scripts/
    ├── health-check.ps1           ← New ⭐
    └── update-dependencies.ps1    ← New ⭐
```

---

**Last Updated**: 17 Novembre 2025  
**Version**: 1.0  
**Status**: ✅ Complete

**📌 Bookmark this page for easy documentation navigation!**
