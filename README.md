# 🎯 Ghost Writing Platform

> Una piattaforma moderna per la creazione di libri di business con AI, progettata per imprenditori e professionisti.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-00A67E?style=flat-square&logo=openai)](https://openai.com/)

---

## 📖 Descrizione

Una piattaforma completa per la creazione automatizzata di libri di business e crescita personale, utilizzando l'intelligenza artificiale di OpenAI. Il sistema guida gli utenti attraverso un processo strutturato basato sul **Viaggio dell'Eroe** di Joseph Campbell per creare outline e contenuti di alta qualità.

### 🎯 Target

- **Imprenditori** con storie di successo da condividere
- **CEO & Founder** che vogliono consolidare la propria autorevolezza
- **Business Coach** che desiderano creare il proprio metodo
- **Professionisti** che vogliono pubblicare un libro per il personal branding

---

## ✨ Features Implementate

### 🚀 Sprint 1-2: Core Application
- ✅ **CRUD Completo Progetti**: Crea, leggi, aggiorna, elimina progetti
- ✅ **Database PostgreSQL**: Supabase con Prisma ORM
- ✅ **Form Strutturato**: Raccolta dati seguendo Hero's Journey
- ✅ **Pagina Dettaglio Progetto**: Visualizzazione completa con tabs
- ✅ **Modifica Progetti**: Aggiorna dati dopo la creazione

### 🤖 Sprint 3: AI Outline Generation
- ✅ **Generazione Outline con AI**: OpenAI gpt-4o-mini
- ✅ **Prompt Engineering**: Template personalizzati per outline
- ✅ **Rigenerazione Illimitata**: Migliora l'outline infinite volte
- ✅ **Visualizzazione Professionale**: Card design per capitoli
- ✅ **Cost Tracking**: Log dei costi e usage tokens

### 📊 Dashboard & Analytics
- ✅ **Lista Progetti**: Overview con ricerca e filtri
- ✅ **Status Management**: Draft, In Progress, Review, Completed
- ✅ **Conteggio Capitoli**: Tracking progresso per progetto

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database (Supabase)
- **pgBouncer** - Connection pooling

### AI
- **OpenAI API** - gpt-4o-mini
- **JSON Mode** - Structured output
- **Custom Prompts** - Tailored for book writing

---

## 📦 Installazione

### Prerequisiti
- **Node.js** 18+ 
- **npm** o **pnpm**
- **PostgreSQL Database** (Supabase raccomandato)
- **OpenAI API Key**

### Setup Locale

1. **Clona il repository**
```bash
git clone https://github.com/YOUR_USERNAME/ghost-writing-platform.git
cd ghost-writing-platform
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env
```

Modifica `.env` con i tuoi dati:
```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-proj-..."
```

4. **Setup Database**
```bash
# Esegui migrations
npx prisma migrate deploy

# (Opzionale) Apri Prisma Studio
npx prisma studio
```

5. **Avvia il server di sviluppo**
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) 🚀

---

## 🗄️ Database Schema

### Tabelle Principali

- **User**: Gestione utenti (preparato per auth futura)
- **Project**: Progetti di libro con tutti i dati raccolti
- **Outline**: Struttura del libro generata dall'AI
- **Chapter**: Singoli capitoli del libro
- **GenerationLog**: Tracking costi e usage AI

Vedi `prisma/schema.prisma` per lo schema completo.

---

## 🤖 AI Integration

### Modello Utilizzato
**gpt-4o-mini** - Il modello più economico di OpenAI

**Costi**:
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- **Outline generation**: ~$0.003 (meno di 1 centesimo!)

### Prompt Strategy
- System prompt per guidare il comportamento
- User prompt personalizzato con dati del progetto
- JSON mode per output strutturato
- 10-15 capitoli con key points e hero journey phases

---

## 📁 Struttura Progetto

```
ghost-writing-platform/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   └── projects/        # Project CRUD + AI generation
│   ├── progetti/            # Projects pages
│   └── ...                  # Other pages
├── components/              # React Components
│   ├── Card.tsx
│   ├── EditProjectModal.tsx
│   ├── Sidebar.tsx
│   └── ...
├── lib/                     # Utilities
│   ├── ai/                  # AI integration
│   │   ├── openai-client.ts
│   │   └── prompts/
│   ├── api/                 # API client helpers
│   └── db.ts                # Prisma client
├── prisma/                  # Database
│   ├── schema.prisma
│   └── migrations/
├── types/                   # TypeScript types
├── docs/                    # Documentation
└── public/                  # Static assets
```

---

## 🚀 Deployment

### Vercel (Raccomandato)

1. **Push su GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy su Vercel**
- Connetti repository GitHub
- Configura environment variables
- Deploy automatico

### Environment Variables su Vercel
```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
```

---

## 📖 Documentazione

Documentazione dettagliata disponibile in `/docs`:

- `DATABASE_SETUP.md` - Setup database Supabase
- `API_DOCUMENTATION.md` - Documentazione API endpoints
- `SPRINT1_COMPLETE.md` - Sprint 1 features
- `SPRINT2_COMPLETE.md` - Sprint 2 features
- `SPRINT3_COMPLETE.md` - Sprint 3 AI integration
- `PROJECT_EDIT_FEATURE.md` - Feature modifica progetti
- `TROUBLESHOOTING_PGBOUNCER.md` - Fix problemi database

---

## 🔮 Roadmap

### Sprint 4: Chapter Generation (Prossimo)
- [ ] API per generazione singoli capitoli
- [ ] Progress bar per generazione multipla
- [ ] Preview e edit capitoli
- [ ] Salvataggio in database

### Sprint 5: Export & Publishing
- [ ] Export DOCX (Word)
- [ ] Export PDF
- [ ] Formattazione professionale
- [ ] Template personalizzabili

### Future Features
- [ ] Autenticazione con Clerk/Auth.js
- [ ] Multi-tenant support
- [ ] Collaboration features
- [ ] Advanced analytics
- [ ] Payment integration (Stripe)

---

## 🤝 Contributing

Contributi benvenuti! Per favore:

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📄 License

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

---

## 🙏 Acknowledgments

- Next.js team per l'amazing framework
- Vercel per l'hosting platform
- OpenAI per l'AI API
- Supabase per il database
- Prisma per l'ORM

---

<p align="center">
  Made with ❤️ for writers and entrepreneurs
</p>
