# 🗄️ Database Setup - Supabase

Questa guida ti aiuterà a configurare il database PostgreSQL su Supabase per l'applicazione Ghost Writing.

## 📋 Prerequisiti

- Account Supabase (già disponibile)
- Node.js e npm installati
- Progetto Ghost Writing clonato

## 🚀 Step 1: Configurazione Progetto Supabase

### 1.1 Accedi a Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Fai login con il tuo account
3. Clicca su "New Project" (se non hai già un progetto per questa app)

### 1.2 Crea un Nuovo Progetto
Se non hai già un progetto, creane uno:
- **Name**: `ghost-writing-app` (o il nome che preferisci)
- **Database Password**: Scegli una password sicura e **salvala in un posto sicuro**
- **Region**: Scegli la regione più vicina ai tuoi utenti (es. `Europe West (Ireland)` per l'Italia)
- **Pricing Plan**: Free tier va bene per iniziare (fino a 500 MB database, 2 GB bandwidth)

⏱️ La creazione del progetto richiede 1-2 minuti.

## 🔑 Step 2: Ottieni le Credenziali

### 2.1 Connection String (per Prisma)
1. Nel dashboard Supabase, vai su **Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **Database** nel menu laterale
3. Scorri fino a **Connection string** → **Connection pooling**

Vedrai due tipi di connection string:

**Transaction Mode** (per migrations):
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Session Mode** (per Prisma connection pooling):
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2.2 API Keys
1. Vai su **Settings** > **API**
2. Copia i seguenti valori:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ NON condividere MAI)

## ⚙️ Step 3: Configurazione Locale

### 3.1 Crea il File .env
Nella root del progetto, crea un file `.env` (NON `.env.example`):

```bash
# Copia .env.example a .env
cp .env.example .env
```

### 3.2 Compila le Variabili d'Ambiente
Apri `.env` e compila con i valori di Supabase:

```bash
# Database URLs
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Supabase Config
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NextAuth (genereremo il secret dopo)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

**⚠️ IMPORTANTE**: 
- Sostituisci `[YOUR-PASSWORD]` con la password del database Supabase
- Sostituisci `xxxxx` con il tuo Project Reference (es. `abcdefghijklmn`)
- Il file `.env` è già nel `.gitignore` - NON committarlo mai!

### 3.3 Genera NextAuth Secret
Esegui questo comando per generare un secret sicuro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia l'output e incollalo in `NEXTAUTH_SECRET` nel file `.env`.

## 📊 Step 4: Crea le Tabelle nel Database

### 4.1 Verifica la Connessione
Prima di tutto, verifica che Prisma possa connettersi al database:

```bash
npx prisma db pull
```

Se vedi "Introspecting based on datasource...", la connessione funziona! ✅

### 4.2 Esegui la Prima Migration
Ora creiamo le tabelle definite nello schema Prisma:

```bash
npx prisma migrate dev --name init
```

Questo comando:
1. Crea le tabelle nel database Supabase
2. Genera il Prisma Client
3. Applica la migration

Dovresti vedere output simile a:
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

### 4.3 Verifica le Tabelle in Supabase
1. Torna al dashboard Supabase
2. Clicca su **Table Editor** nel menu laterale
3. Dovresti vedere le tabelle create:
   - `User`
   - `Project`
   - `Outline`
   - `Chapter`
   - `GenerationLog`

🎉 **Database configurato con successo!**

## 🔍 Step 5: Esplora il Database con Prisma Studio

Prisma include uno strumento visual per esplorare i dati:

```bash
npx prisma studio
```

Si aprirà automaticamente nel browser su `http://localhost:5555`.

Da qui puoi:
- Visualizzare tutte le tabelle
- Inserire dati di test manualmente
- Editare/eliminare record
- Esplorare le relazioni tra tabelle

## 📝 Step 6: Script di Seed (Opzionale)

Per popolare il database con dati di esempio, possiamo creare uno script seed.

### 6.1 Crea `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crea un utente di esempio
  const user = await prisma.user.upsert({
    where: { email: 'demo@ghostwriting.com' },
    update: {},
    create: {
      email: 'demo@ghostwriting.com',
      name: 'Demo User',
      role: 'ghost_writer',
    },
  })

  // Crea un progetto di esempio
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      authorName: 'Marco Rossi',
      authorRole: 'CEO & Founder',
      company: 'Tech Innovators Srl',
      industry: 'Technology',
      bookTitle: 'Da Zero a Leader',
      bookSubtitle: 'Come ho costruito un\'azienda tech di successo',
      targetReaders: 'Imprenditori tech, startup founders, giovani professionisti',
      currentSituation: 'Partito da zero, senza esperienza nel settore tech...',
      challengeFaced: 'Difficoltà nel trovare finanziamenti e costruire un team...',
      transformation: 'Ho sviluppato un metodo sistematico per...',
      achievement: 'Oggi l\'azienda vale 10M€ con 50 dipendenti...',
      lessonLearned: 'L\'importanza del team e della visione a lungo termine...',
      businessGoals: 'Attrarre investitori e talenti, posizionarsi come thought leader',
      uniqueValue: 'Approccio human-first alla tecnologia',
      estimatedPages: 200,
      status: 'draft',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created user: ${user.email}`)
  console.log(`Created project: ${project.bookTitle}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 6.2 Aggiungi script nel package.json
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

### 6.3 Installa ts-node
```bash
npm install -D ts-node
```

### 6.4 Esegui il Seed
```bash
npx prisma db seed
```

## 🛠️ Comandi Utili

### Durante lo Sviluppo

```bash
# Genera il Prisma Client dopo modifiche allo schema
npx prisma generate

# Crea una nuova migration dopo modifiche allo schema
npx prisma migrate dev --name nome_migration

# Apri Prisma Studio per visualizzare i dati
npx prisma studio

# Reset del database (⚠️ cancella tutti i dati!)
npx prisma migrate reset

# Verifica lo stato delle migrations
npx prisma migrate status
```

### Per Production

```bash
# Deploy migrations su production
npx prisma migrate deploy

# Genera il client per production
npx prisma generate
```

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Usa `DATABASE_URL` con connection pooling per query runtime
- ✅ Usa `DIRECT_URL` solo per migrations
- ✅ Tieni il `SERVICE_ROLE_KEY` segreto (mai nel frontend!)
- ✅ Usa Row Level Security (RLS) in Supabase per proteggere i dati
- ✅ Backup regolari (Supabase li fa automaticamente)

### ❌ DON'T:
- ❌ Non committare `.env` su Git
- ❌ Non condividere le password del database
- ❌ Non usare il `SERVICE_ROLE_KEY` nel client-side code
- ❌ Non esporre le API keys pubblicamente

## 📊 Monitoring & Limiti Free Tier

### Free Tier Limits (Supabase):
- **Database**: 500 MB storage
- **Bandwidth**: 2 GB/month
- **File Storage**: 1 GB
- **Auth Users**: 50,000 monthly active users
- **Edge Functions**: 500,000 invocations/month

### Monitorare l'Utilizzo:
1. Dashboard Supabase > **Settings** > **Usage**
2. Controlla regolarmente storage e bandwidth
3. Se superi i limiti, considera l'upgrade a Pro ($25/month)

## 🆘 Troubleshooting

### Errore: "Can't reach database server"
- ✅ Verifica che `DATABASE_URL` sia corretto
- ✅ Controlla che la password sia corretta (senza spazi extra)
- ✅ Verifica che il progetto Supabase sia attivo (non paused)

### Errore: "relation does not exist"
- ✅ Esegui `npx prisma migrate dev` per creare le tabelle
- ✅ Verifica che le migrations siano state applicate

### Errore: "SSL connection required"
- ✅ Aggiungi `?sslmode=require` alla connection string

### Database Paused (Free Tier)
Supabase mette in pausa i progetti inattivi dopo 7 giorni:
- Vai nel dashboard e clicca "Resume project"
- Considera upgrade a Pro se serve always-on

## 🎯 Next Steps

Ora che il database è configurato, puoi:

1. ✅ **Testare la connessione** creando una API route di test
2. ✅ **Implementare le API routes** per CRUD operations
3. ✅ **Setup Authentication** con NextAuth + Supabase
4. ✅ **Creare i primi form** collegati al database

---

📚 **Documentazione Utile**:
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)

**Autore**: AI Assistant  
**Ultima modifica**: 9 Ottobre 2025
