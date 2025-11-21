# ⚡ Quick Fixes - Soluzioni Rapide ai Problemi Comuni

**Riferimento veloce per risolvere i problemi più frequenti**

---

## 🚨 Problema: App non si avvia

### Sintomo
```
Error: Cannot find module 'X'
```

### ✅ Soluzione
```powershell
# 1. Pulisci node_modules e cache
Remove-Item -Recurse -Force node_modules, .next, package-lock.json
npm cache clean --force

# 2. Reinstalla tutto
npm install

# 3. Genera Prisma client
npx prisma generate

# 4. Riavvia
npm run dev
```

---

## 🚨 Problema: Database connection error

### Sintomo
```
PrismaClientInitializationError: Can't reach database server
```

### ✅ Soluzione

**Verifica 1: .env file**
```powershell
# Controlla che .env esista
Test-Path .env
# Se false, copia il template
Copy-Item .env.example .env
```

**Verifica 2: DATABASE_URL**
```dotenv
# .env
# DEVE includere ?pgbouncer=true per Supabase
DATABASE_URL="postgresql://...?pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://...5432/postgres"
```

**Verifica 3: Test connessione**
```powershell
npm run db:studio
# Se si apre Prisma Studio, connessione OK
```

---

## 🚨 Problema: OpenAI API errors

### Sintomo
```
Error: Invalid API Key
```

### ✅ Soluzione

**Verifica 1: API Key presente**
```powershell
# Controlla .env
Get-Content .env | Select-String "OPENAI_API_KEY"
```

**Verifica 2: Format corretto**
```dotenv
# DEVE iniziare con sk-proj- per nuove key
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"

# Oppure sk- per vecchie key
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
```

**Verifica 3: Test API**
```powershell
node scripts/test-ai-config.js
```

---

## 🚨 Problema: Build fails

### Sintomo
```
Error: Build failed with 1 error
```

### ✅ Soluzione

**Step 1: Check TypeScript**
```powershell
npx tsc --noEmit
# Se ci sono errori, correggili prima di procedere
```

**Step 2: Clear cache**
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

**Step 3: Check dependencies**
```powershell
npm list
# Cerca [UNMET] dependencies
npm install
```

---

## 🚨 Problema: Prisma errors

### Sintomo
```
PrismaClientValidationError
```

### ✅ Soluzione

**Rigenera client**
```powershell
npx prisma generate
```

**Se persistono errori**
```powershell
# Full reset (ATTENZIONE: cancella dati!)
npx prisma migrate reset

# Oppure solo push schema
npx prisma db push
```

---

## 🚨 Problema: Port already in use

### Sintomo
```
Error: Port 3000 is already in use
```

### ✅ Soluzione

**Opzione 1: Kill process**
```powershell
# Trova processo sulla porta 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
# Uccidi il processo (sostituisci PID)
Stop-Process -Id PID -Force
```

**Opzione 2: Usa porta diversa**
```powershell
npm run dev -- -p 3001
```

---

## 🚨 Problema: "Too many requests" da OpenAI

### Sintomo
```
Error: Rate limit exceeded
```

### ✅ Soluzione Immediata

**Attendi e riprova**
```typescript
// L'app ha retry automatico
// Attendi 60 secondi e riprova
```

**Soluzione Permanente**
```typescript
// Implementa rate limiting
// Vedi: lib/rate-limit.ts
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

await rateLimit(request, RateLimitPresets.AI_GENERATION)
```

---

## 🚨 Problema: Upload file fallisce

### Sintomo
```
Error: File too large
PayloadTooLargeError
```

### ✅ Soluzione

**Verifica 1: Limite size**
```typescript
// next.config.mjs - già configurato a 50MB
experimental: {
  serverActions: {
    bodySizeLimit: '50mb',
  },
}
```

**Verifica 2: Usa Vercel Blob**
```typescript
// Per file > 4.5MB, usa Vercel Blob upload
// Vedi: lib/services/document-service.ts
await DocumentService.uploadDocumentFromBlob(params)
```

---

## 🚨 Problema: Slow generation

### Sintomo
```
Chapter generation takes > 2 minutes
```

### ✅ Soluzione

**Ottimizza configurazione AI**
```typescript
// app/api/projects/[id]/ai-config
{
  "reasoning_effort": "low",    // Invece di "medium"
  "verbosity": "medium",         // Invece di "high"
  "max_output_tokens": 15000     // Invece di 20000
}
```

**Verifica timeout**
```typescript
// vercel.json - già configurato a 300s
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 300
  }
}
```

---

## 🚨 Problema: Session/Auth errors

### Sintomo
```
Error: No session found
Unauthorized
```

### ✅ Soluzione

**Nota**: Auth non ancora implementato (usa demo user)

**Temporary workaround**
```typescript
// L'app crea automaticamente demo user
// Email: demo@ghostwriting.com
// Nessuna password necessaria per ora
```

**Soluzione permanente**
```typescript
// Implementa NextAuth.js
// Vedi: docs/SECURITY.md
npm install next-auth @auth/prisma-adapter
```

---

## 🚨 Problema: CORS errors

### Sintomo
```
Access-Control-Allow-Origin error
```

### ✅ Soluzione

**Aggiungi headers in API route**
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data)
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  
  return response
}
```

---

## 🚨 Problema: Vercel deployment fails

### Sintomo
```
Error: Build failed on Vercel
```

### ✅ Soluzione

**Step 1: Verifica localmente**
```powershell
npm run build
# Deve completare senza errori
```

**Step 2: Environment variables**
```
Vercel Dashboard > Settings > Environment Variables
- DATABASE_URL
- DIRECT_URL
- OPENAI_API_KEY
- NEXTAUTH_SECRET (se auth implementato)
```

**Step 3: Build command**
```json
// vercel.json
{
  "buildCommand": "prisma generate && next build"
}
```

**Step 4: Verifica script**
```powershell
npm run verify:deployment
```

---

## 🚨 Problema: "Module not found" in production

### Sintomo
```
Error: Cannot find module '@/lib/X'
```

### ✅ Soluzione

**Verifica paths in tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // ✅ Corretto
    }
  }
}
```

**Rebuild**
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

---

## 🚨 Problema: Hot reload non funziona

### Sintomo
```
Changes not reflecting in browser
```

### ✅ Soluzione

**Restart dev server**
```powershell
# Ctrl+C per fermare
npm run dev
```

**Clear browser cache**
```
Ctrl+Shift+R (hard reload)
```

**Check file watcher**
```powershell
# Windows: potrebbe servire aumentare limit
# Nessuna azione necessaria normalmente
```

---

## 🚨 Problema: TypeScript errors in VS Code

### Sintomo
```
Red squiggles everywhere but builds fine
```

### ✅ Soluzione

**Restart TS Server**
```
VS Code:
1. Ctrl+Shift+P
2. "TypeScript: Restart TS Server"
```

**Reload VS Code**
```
Ctrl+Shift+P > "Developer: Reload Window"
```

---

## 🛠️ Maintenance Commands

### Daily
```powershell
# Health check
.\scripts\health-check.ps1

# Start dev
npm run dev
```

### Weekly
```powershell
# Check for updates
npm outdated

# Update if needed
.\scripts\update-dependencies.ps1
```

### Monthly
```powershell
# Database backup
npx prisma db pull

# Clean up
npm run db:reset  # Solo in dev!
```

---

## 📞 Still Having Issues?

### Debug Steps
1. ✅ Leggi il messaggio di errore completo
2. ✅ Cerca in `DEBUG_REPORT.md`
3. ✅ Controlla `TROUBLESHOOTING_GUIDE.md`
4. ✅ Verifica `.env` file
5. ✅ Esegui `health-check.ps1`

### Log Locations
```powershell
# Development logs
# Console in terminal dove gira npm run dev

# Build logs
.next/build.log

# Vercel logs
# Vercel Dashboard > Deployments > [deployment] > Logs
```

### Get Help
- 📖 Docs: `/docs` folder
- 🧪 Examples: `/examples` folder
- 🔍 Tests: `/tests` folder

---

## 📚 Documentazione Completa

Per guide più dettagliate, consulta:
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Guide approfondite
- **[DEBUG_SUMMARY.md](./DEBUG_SUMMARY.md)** - Stato app e roadmap
- **[docs/](./docs/)** - Documentazione tecnica completa

---

**Last Updated**: 19 Novembre 2025  
**Version**: 1.1
