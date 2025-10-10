# Architecture Overview

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│                      http://localhost:3000                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js 14 App Router                      │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Dashboard  │  │  Progetti  │  │   Clienti  │  │ Settings │ │
│  │     /      │  │ /progetti  │  │  /clients  │  │ /settings│ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│                         │                │                       │
│                         ├── /progetti/[id] (Editor)              │
│                         └── /clients/[id] (Client Detail)        │
└─────────────────────────────────────────────────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
    ┌─────────────┐      ┌──────────────┐     ┌─────────────┐
    │   Sidebar   │      │ ProjectTable │     │ ClientTable │
    │             │      │              │     │             │
    │ - Nav Menu  │      │ - Filters    │     │ - Search    │
    │ - Profile   │      │ - Table View │     │ - Filters   │
    └─────────────┘      └──────────────┘     └─────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Reusable Components    │
                    │  - PageContainer        │
                    │  - Card                 │
                    │  - Modal                │
                    │  - NewProjectModal      │
                    │  - ContentEditor        │
                    │  - WorkflowPanel        │
                    └─────────────────────────┘
```

## 📊 Component Flow

```
App Router Structure
├── / (Dashboard)
│   ├── State: sidebarCollapsed, isModalOpen
│   ├── <Sidebar />
│   ├── <PageContainer>
│   │   ├── Stats Cards (wrapped in <Card />)
│   │   ├── CTA New Project Card
│   │   └── Recent Activity (wrapped in <Card />)
│   ├── <NewProjectModal>
│   │   ├── Form Sections (5 sezioni)
│   │   └── State: formData
│   └── Uses: Card, PageContainer, Modal, NewProjectModal
│
├── /progetti (Projects List)
│   ├── State: sidebarCollapsed
│   ├── <Sidebar />
│   ├── <PageContainer title="Progetti">
│   │   └── <ProjectTable>
│   │       ├── Filters Card
│   │       ├── Table Card
│   │       └── State: searchTerm, projects[]
│   └── Uses: Card, PageContainer, ProjectTable
│
├── /progetti/[id] (Project Detail)
│   ├── State: sidebarCollapsed
│   ├── <Sidebar />
│   ├── Back Button
│   ├── <ContentEditor>
│   │   ├── State: content, title
│   │   └── Toolbar + Editor
│   └── <WorkflowPanel>
│       ├── State: collapsed, stages[]
│       └── Progress + Stage Cards
│
├── /clients (Clients List)
│   ├── State: sidebarCollapsed
│   ├── <Sidebar />
│   ├── <PageContainer title="Clienti">
│   │   └── <ClientTable>
│   │       ├── Filters Card
│   │       ├── Table Card
│   │       └── State: searchTerm, clients[]
│   └── Uses: Card, PageContainer, ClientTable
│
├── /clients/[id] (Client Detail)
│   ├── State: sidebarCollapsed
│   ├── <Sidebar />
│   ├── <PageContainer>
│   │   ├── Back Button
│   │   ├── Client Info Card
│   │   └── Projects Section Card
│   └── Uses: Card, PageContainer
│
├── /analytics (Analytics Dashboard)
│   ├── State: sidebarCollapsed
│   ├── <Sidebar />
│   └── <PageContainer title="Analytics">
│       └── Placeholder content
│
└── /settings (Settings Page)
    ├── State: sidebarCollapsed, form states
    ├── <Sidebar />
    └── <PageContainer title="Impostazioni">
        ├── Profile Card
        ├── Notifications Card
        ├── Privacy Card
        └── Preferences Card (Language only)
```

## 🔄 Data Flow

```
┌──────────────┐
│  User Input  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   Component      │ ← useState (local state)
│   Event Handler  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Update State   │ ← setState()
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Re-render      │ ← React reconciliation
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Update UI      │
└──────────────────┘
```

### New Project Creation Flow

```
┌─────────────────────┐
│  Dashboard          │
│  "Nuovo Progetto"   │
│  Button Click       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  setIsModalOpen     │
│  (true)             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  NewProjectModal    │
│  renders with form  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User fills form    │
│  (5 sections)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Form Submit        │
│  onSubmitAction()   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  handleSubmitProject│
│  - Log data         │
│  - Close modal      │
│  - Navigate to      │
│    /progetti        │
└─────────────────────┘
```

## 🎨 Styling Architecture

```
┌────────────────────────────────────────┐
│         Tailwind CSS (JIT)             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   globals.css                    │ │
│  │   - @tailwind base               │ │
│  │   - @tailwind components         │ │
│  │   - @tailwind utilities          │ │
│  │   - CSS variables                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   tailwind.config.ts             │ │
│  │   - Theme customization          │ │
│  │   - Content paths                │ │
│  │   - Custom colors                │ │
│  │   - NO darkMode (removed)        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Reusable Components            │ │
│  │   - PageContainer (p-6)          │ │
│  │   - Card (borders, shadows)      │ │
│  │   - Modal (backdrop, overlay)    │ │
│  │   - Consistent spacing           │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

Design System:
- Spacing: 24px (p-6) between sidebar and content
- Cards: white bg, rounded-lg, border, shadow-sm
- Padding: sm (12px), md (16px), lg (24px)
- Colors: gray-50/100 backgrounds, gray-900 text
- Interactive: hover states, transitions
- NO dark mode support
```

## 🔐 Type System

```
┌────────────────────────────────────────┐
│         TypeScript Types               │
│                                        │
│  types/index.ts                        │
│  ├── Project                           │
│  │   ├── id: string                    │
│  │   ├── title: string                 │
│  │   ├── date: string                  │
│  │   ├── orderNumber: string           │
│  │   ├── invoiceNumber: string         │
│  │   ├── client: string                │
│  │   ├── status: string                │
│  │   ├── receiptDate?: string          │
│  │   └── wordCount: number             │
│  │                                     │
│  ├── Client                            │
│  │   ├── id: string                    │
│  │   ├── name: string                  │
│  │   ├── email: string                 │
│  │   ├── phone: string                 │
│  │   ├── registrationDate: string      │
│  │   ├── activeProjects: number        │
│  │   ├── completedProjects: number     │
│  │   └── status: string                │
│  │                                     │
│  ├── WorkflowStage                     │
│  │   ├── id: string                    │
│  │   ├── name: string                  │
│  │   ├── status: 'completed' | 'in-progress' | 'pending'
│  │   └── assignee?: string             │
│  │                                     │
│  ├── ProjectFormData (NEW)            │
│  │   ├── authorName: string            │
│  │   ├── authorRole: string            │
│  │   ├── company: string               │
│  │   ├── industry: string              │
│  │   ├── bookTitle: string             │
│  │   ├── bookSubtitle?: string         │
│  │   ├── targetAudience: string        │
│  │   ├── currentSituation: string      │
│  │   ├── challengeFaced: string        │
│  │   ├── transformation: string        │
│  │   ├── achievement: string           │
│  │   ├── lessonLearned: string         │
│  │   ├── businessGoals: string         │
│  │   ├── targetReaders: string         │
│  │   ├── uniqueValue: string           │
│  │   ├── estimatedPages?: number       │
│  │   └── additionalNotes?: string      │
│  │                                     │
│  └── ContentBlock (legacy)             │
│      ├── id: string                    │
│      ├── type: enum                    │
│      ├── content: string               │
│      └── ...                           │
└────────────────────────────────────────┘
```

## 📁 File System Structure

```
ghost/
│
├── app/                      ← Next.js App Router
│   ├── layout.tsx           ← Root layout (clean, no ThemeProvider)
│   ├── page.tsx             ← Dashboard with New Project Modal
│   ├── globals.css          ← Global styles
│   │
│   ├── progetti/            ← Projects routes
│   │   ├── page.tsx         ← Projects list with PageContainer title
│   │   └── [id]/
│   │       └── page.tsx     ← Project detail with editor
│   │
│   ├── clients/             ← Clients routes
│   │   ├── page.tsx         ← Clients list with PageContainer title
│   │   └── [id]/
│   │       └── page.tsx     ← Client detail
│   │
│   ├── analytics/           ← Analytics route
│   │   └── page.tsx         ← Analytics dashboard
│   │
│   └── settings/            ← Settings route
│       └── page.tsx         ← Settings (no theme option)
│
├── components/               ← React Components
│   ├── Sidebar.tsx          ← Navigation (no theme toggle)
│   ├── PageContainer.tsx    ← Layout wrapper with title/description
│   ├── Card.tsx             ← Reusable card component
│   ├── Modal.tsx            ← NEW: Reusable modal component
│   ├── NewProjectModal.tsx  ← NEW: Project creation form
│   ├── ProjectTable.tsx     ← Projects table (title in PageContainer)
│   ├── ProjectList.tsx      ← Projects card view (legacy)
│   ├── ClientTable.tsx      ← Clients table (title in PageContainer)
│   ├── ContentEditor.tsx    ← Main content editor
│   └── WorkflowPanel.tsx    ← Progress tracking panel
│
├── types/                    ← TypeScript Definitions
│   └── index.ts             ← Shared interfaces
│
├── docs/                     ← Documentation
│   ├── ARCHITECTURE.md      ← This file
│   ├── COMPONENTS.md        ← Component documentation
│   ├── PROJECT_FORM.md      ← New Project Form guide
│   └── CHANGELOG.md         ← Version history
│
└── [config files]            ← Configuration
    ├── tsconfig.json        ← TypeScript config
    ├── tailwind.config.ts   ← Tailwind config (no darkMode)
    ├── next.config.mjs      ← Next.js config
    └── package.json         ← Dependencies
```

## 🚀 Build Process

```
┌─────────────────┐
│  Source Code    │
│  (.tsx, .ts)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TypeScript     │
│  Compilation    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js        │
│  Build          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tailwind CSS   │
│  Processing     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Optimization   │
│  (Minify, etc)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Production     │
│  Bundle         │
└─────────────────┘
```

## 🔄 Development Workflow

```
┌─────────────────┐
│  Edit Code      │
│  (.tsx, .css)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save File      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js        │
│  Hot Reload     │ ← Fast Refresh
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Browser        │
│  Auto Update    │
└─────────────────┘
```

## 🌐 Deployment Architecture (Future)

```
┌─────────────────┐
│   Developer     │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│   GitHub        │
└────────┬────────┘
         │ webhook
         ▼
┌─────────────────┐
│   Vercel        │
│   - Build       │
│   - Deploy      │
│   - CDN         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Production    │
│   (yourapp.com) │
└─────────────────┘
```

## 🗄️ Future Data Architecture (Planned)

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Next.js    │
│   API Routes │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Prisma ORM │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │
│   Database   │
└──────────────┘
```

## 🔐 Future Auth Flow (Planned)

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │ login
       ▼
┌──────────────┐
│  NextAuth.js │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  OAuth       │
│  Provider    │
└──────┬───────┘
       │ token
       ▼
┌──────────────┐
│  Session     │
│  Cookie      │
└──────────────┘
```

---

## 📊 Current Architecture Stats

- **Pages**: 7 routes
  - Dashboard (/) - with New Project Modal
  - Progetti (/progetti) - projects list
  - Progetti Detail (/progetti/[id]) - project editor
  - Clienti (/clients) - clients list
  - Clienti Detail (/clients/[id]) - client detail
  - Analytics (/analytics)
  - Settings (/settings)

- **Components**: 10 main UI components
  - Sidebar (navigation, no theme toggle)
  - PageContainer (layout wrapper with title/description props)
  - Card (reusable container)
  - Modal (NEW - reusable dialog component)
  - NewProjectModal (NEW - project creation form)
  - ProjectTable (projects list view)
  - ClientTable (clients list view)
  - ContentEditor (text editor)
  - WorkflowPanel (progress tracker)
  - ProjectList (legacy card view)

- **Type Definitions**: 5 interfaces
  - Project
  - Client
  - WorkflowStage
  - ProjectFormData (NEW)
  - ContentBlock (legacy)

- **State Management**: React useState (local component state only)
- **Routing**: Next.js App Router with dynamic routes
- **Styling**: Tailwind CSS (utility-first, NO dark mode)
- **Build Tool**: Next.js 14 compiler with Turbopack
- **Package Manager**: npm
- **Runtime**: Node.js 18+

## 🎯 Design Patterns Used

1. **Component Composition** - Build complex UI from simple parts
2. **Compound Components** - PageContainer + Card pattern
3. **Modal Pattern** - Overlay dialogs for user interactions
4. **Layout Components** - Consistent spacing and structure
5. **Controlled Components** - React controls form inputs
6. **Conditional Rendering** - Show/hide based on state
7. **Event Handling** - User interactions trigger updates
8. **Type Safety** - TypeScript prevents runtime errors
9. **File-based Routing** - Next.js App Router conventions
10. **Dynamic Routes** - [id] parameter for detail pages
11. **Form State Management** - Complex forms with multiple sections

## 🎨 UI/UX Patterns

1. **Table Views** - Projects and Clients use data tables
2. **Filter System** - Search, date range, status filters
3. **Card-based Layout** - Consistent bordered containers
4. **Modal Dialogs** - Centered overlays with backdrop
5. **Multi-section Forms** - Organized form with clear sections
6. **Responsive Design** - Mobile-first Tailwind utilities
7. **Navigation** - Collapsible sidebar with route links
8. **Detail Pages** - Dedicated views for individual items
9. **Back Navigation** - Return to list views
10. **Status Badges** - Color-coded states
11. **Call-to-Action Cards** - Prominent action buttons
12. **Consistent Titles** - All pages use PageContainer title/description

## 🎯 Ghost Writing Specialization

### Target Audience
- **High-spending entrepreneurs** - Business owners with premium budgets
- **CEOs and Founders** - C-level executives
- **YouTubers & Content Creators** - Digital influencers
- **Startuppers** - Startup founders and innovators
- **Business Coaches** - Professional coaches and consultants
- **Investors** - Angel investors and VCs

### Content Focus
- ✅ **Autobiographical business books**
- ✅ **Entrepreneurial journey stories**
- ✅ **Business strategy and methodology books**
- ✅ **Professional development content**
- ❌ **NO fiction**
- ❌ **NO children's books**
- ❌ **NO creative fiction genres**

### Narrative Framework
Uses **Hero's Journey** adapted for business context:
1. **Ordinary World** → Current business situation
2. **Call to Adventure** → Challenge/problem faced
3. **The Journey** → Transformation and growth
4. **The Victory** → Achievements and results
5. **The Return** → Lessons learned and message

---

## 📝 Recent Changes

**Version 0.5.0** - October 9, 2025
- ✅ Added Modal component (reusable dialog system)
- ✅ Added NewProjectModal (complex multi-section form)
- ✅ Integrated project creation flow in Dashboard
- ✅ Removed deadline and budget fields from form
- ✅ Specialized for high-end business ghost writing
- ✅ Implemented Hero's Journey framework for business books
- ✅ Updated all documentation
- ✅ Organized docs in `/docs` folder

**Version 0.4.0** - October 9, 2025
- ✅ COMPLETELY removed dark mode system
- ✅ Deleted ThemeProvider component
- ✅ Removed theme toggle from Sidebar
- ✅ Removed theme option from Settings
- ✅ Cleaned up all `dark:` CSS classes
- ✅ Standardized title placement (all use PageContainer)
- ✅ Moved Progetti and Clienti titles outside Cards

**Version 0.3.0** - Earlier
- Added multi-page routing (7 routes)
- Introduced PageContainer and Card components
- Separated Progetti and Clienti views
- Added Analytics and Settings pages

---

**Last Updated**: October 9, 2025  
**Maintained by**: Ghost Writing Team
