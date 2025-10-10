# Component Documentation

## 📦 Component Overview

This document provides detailed documentation for all reusable components in the Ghost Writing application.

---

## 🎨 Layout Components

### PageContainer

**Location**: `components/PageContainer.tsx`

**Purpose**: Provides consistent layout wrapper for all pages with optional title and description.

**Props**:
```typescript
interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
```

**Usage**:
```tsx
<PageContainer title="Dashboard" description="Panoramica generale">
  {/* Your content here */}
</PageContainer>
```

**Features**:
- Consistent 24px padding (`p-6`)
- Overflow auto for content
- Optional title with 2xl font size
- Optional gray description text
- Full height flex container

---

### Card

**Location**: `components/Card.tsx`

**Purpose**: Reusable container component with consistent styling.

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage**:
```tsx
<Card padding="lg">
  <h2>Card Title</h2>
  <p>Card content...</p>
</Card>
```

**Features**:
- White background
- Rounded corners (`rounded-lg`)
- Border and shadow
- Configurable padding (sm: 12px, md: 16px, lg: 24px)
- Accepts additional className for customization

---

### Sidebar

**Location**: `components/Sidebar.tsx`

**Purpose**: Main navigation sidebar with collapsible functionality.

**Props**:
```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
```

**Usage**:
```tsx
<Sidebar 
  collapsed={sidebarCollapsed} 
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
/>
```

**Features**:
- Collapsible design (full width / icon only)
- Navigation links with icons:
  - Home (Dashboard)
  - Progetti (Projects)
  - Clienti (Clients)
  - Analytics
  - Settings
- Active route highlighting
- User profile section at bottom
- Smooth transitions

**Navigation Items**:
- Uses `lucide-react` icons
- Active state with blue background
- Hover effects

---

## 🎯 Modal Components

### Modal

**Location**: `components/Modal.tsx`

**Purpose**: Reusable modal/dialog component with backdrop.

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

**Usage**:
```tsx
<Modal 
  isOpen={isOpen} 
  onCloseAction={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
>
  <p>Modal content...</p>
</Modal>
```

**Features**:
- Dark backdrop (50% opacity black)
- Click outside to close
- ESC key to close
- Prevents body scroll when open
- Responsive sizing:
  - sm: max-w-md
  - md: max-w-lg
  - lg: max-w-2xl
  - xl: max-w-4xl
  - full: max-w-6xl
- Header with close button (X icon)
- Scrollable content area
- Centered on screen

---

### NewProjectModal

**Location**: `components/NewProjectModal.tsx`

**Purpose**: Complex form for creating new ghost writing projects for high-end business clients.

**Props**:
```typescript
interface NewProjectModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSubmitAction: (projectData: ProjectFormData) => void;
}
```

**Data Structure**:
```typescript
interface ProjectFormData {
  // Author Info
  authorName: string;
  authorRole: string; // Imprenditore, CEO, Founder, YouTuber, etc.
  company: string;
  industry: string;
  
  // Book Info
  bookTitle: string;
  bookSubtitle?: string;
  targetAudience: string;
  
  // Hero's Journey (Business Context)
  currentSituation: string; // Starting point
  challengeFaced: string; // The problem
  transformation: string; // The journey
  achievement: string; // The results
  lessonLearned: string; // The message
  
  // Business Goals
  businessGoals: string;
  targetReaders: string;
  uniqueValue: string;
  
  // Technical Details
  estimatedPages?: number;
  additionalNotes?: string;
}
```

**Form Sections**:

1. **Informazioni Autore** (Author Information)
   - Nome Completo (required)
   - Ruolo/Posizione (required, dropdown)
   - Azienda/Brand (required)
   - Settore/Industria (required)

2. **Informazioni Libro** (Book Information)
   - Titolo del Libro (required)
   - Sottotitolo (optional)
   - Target di Lettori (required)

3. **Il Viaggio Imprenditoriale** (The Entrepreneurial Journey)
   - Situazione di Partenza (required) - The ordinary world
   - La Sfida/Problema Affrontato (required) - The challenge
   - Il Percorso di Trasformazione (required) - The transformation
   - Risultati e Successi Ottenuti (required) - The achievement
   - Lezione Principale e Messaggio (required) - The lesson

4. **Obiettivi e Posizionamento** (Goals and Positioning)
   - Obiettivi del Libro (required)
   - Proposta di Valore Unica (required)

5. **Dettagli Progetto** (Project Details)
   - Pagine Stimate (optional)
   - Note Aggiuntive (optional)

**Usage**:
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

const handleSubmit = (data: ProjectFormData) => {
  // Save project data
  console.log(data);
  setIsModalOpen(false);
};

<NewProjectModal
  isOpen={isModalOpen}
  onCloseAction={() => setIsModalOpen(false)}
  onSubmitAction={handleSubmit}
/>
```

**Features**:
- Multi-section form with visual separators
- Icon-coded sections (User, BookOpen, TrendingUp, Target, AlertCircle)
- Required field indicators (red asterisk)
- Helpful placeholder text for each field
- Validation (HTML5 required attributes)
- Dropdown for author roles
- Text inputs and textareas
- Number input for pages
- Submit and Cancel buttons
- Responsive grid layout

**Target Audience**:
- High-spending entrepreneurs
- CEOs and Founders
- YouTubers and Content Creators
- Startuppers
- Business Coaches
- Investors

**Content Specialization**:
- ✅ Business autobiographies
- ✅ Entrepreneurial journey stories
- ✅ Professional development
- ❌ NO fiction
- ❌ NO children's books

---

## 📊 Data Display Components

### ProjectTable

**Location**: `components/ProjectTable.tsx`

**Purpose**: Display and manage projects in table format.

**Features**:
- Search by title or client
- Filter by status (Tutti, In Corso, Completato, Bozza)
- Date range filter (from/to)
- Sortable columns
- Status badges with colors
- Action buttons (view/edit)
- Responsive table layout

**Internal State**:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('Tutti');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
```

**Table Columns**:
- Titolo (Title)
- Data (Date)
- N. Ordine (Order Number)
- N. Fattura (Invoice Number)
- Cliente (Client)
- Stato (Status)
- Azioni (Actions)

**Usage**:
```tsx
<ProjectTable />
```

---

### ClientTable

**Location**: `components/ClientTable.tsx`

**Purpose**: Display and manage clients in table format.

**Features**:
- Search by name, email, or phone
- Filter by status (Tutti, Attivo, Inattivo)
- Status badges with colors
- Client metrics (active/completed projects)
- Action buttons
- Responsive table layout

**Internal State**:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('Tutti');
```

**Table Columns**:
- Nome (Name)
- Email
- Telefono (Phone)
- Data Registrazione (Registration Date)
- Progetti Attivi (Active Projects)
- Progetti Completati (Completed Projects)
- Stato (Status)
- Azioni (Actions)

**Usage**:
```tsx
<ClientTable />
```

---

## ✍️ Editor Components

### ContentEditor

**Location**: `components/ContentEditor.tsx`

**Purpose**: Rich text editor for project content.

**Props**:
```typescript
interface ContentEditorProps {
  // Currently uses internal state
}
```

**Features**:
- Title input field
- Toolbar with formatting options:
  - Bold, Italic, Underline
  - Headings (H1, H2, H3)
  - Lists (Bullet, Numbered)
  - Alignment (Left, Center, Right)
  - Insert Link, Image
  - Code block
  - Undo/Redo
- Large textarea for content
- Word count display
- Export and Share buttons
- Auto-save indicator

**Internal State**:
```typescript
const [title, setTitle] = useState('');
const [content, setContent] = useState('');
```

**Usage**:
```tsx
<ContentEditor />
```

---

### WorkflowPanel

**Location**: `components/WorkflowPanel.tsx`

**Purpose**: Visual workflow progress tracker.

**Features**:
- Collapsible panel
- Overall progress indicator
- Stage cards with:
  - Stage name
  - Status (completed, in-progress, pending)
  - Assignee
  - Color-coded status icons
- Status colors:
  - Completed: Green
  - In Progress: Blue
  - Pending: Gray

**Internal State**:
```typescript
const [collapsed, setCollapsed] = useState(false);
const [stages, setStages] = useState<WorkflowStage[]>([...]);
```

**Workflow Stages**:
1. Ricerca e Interviste
2. Outline e Struttura
3. Prima Bozza
4. Revisione Cliente
5. Editing Finale
6. Formattazione
7. Pubblicazione

**Usage**:
```tsx
<WorkflowPanel />
```

---

## 🎨 Styling Guidelines

### Common Patterns

**Input Fields**:
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg 
           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

**Buttons (Primary)**:
```tsx
className="px-6 py-2 bg-blue-600 text-white rounded-lg 
           hover:bg-blue-700 transition-colors font-medium"
```

**Buttons (Secondary)**:
```tsx
className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg 
           hover:bg-gray-50 transition-colors font-medium"
```

**Status Badges**:
```tsx
// Active/In Progress
className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"

// Completed
className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"

// Pending/Draft
className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
```

**Section Headers**:
```tsx
<div className="flex items-center gap-2 text-lg font-semibold 
                text-gray-900 border-b pb-2">
  <Icon size={20} className="text-blue-600" />
  <h3>Section Title</h3>
</div>
```

---

## 🔄 State Management Patterns

### Local Component State
All components use React `useState` for local state management.

```tsx
const [value, setValue] = useState<Type>(initialValue);
```

### Form Handling
```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};
```

### Modal State
```tsx
const [isOpen, setIsOpen] = useState(false);

// Open
setIsOpen(true);

// Close
setIsOpen(false);
```

---

## 🎯 Best Practices

1. **Component Composition**
   - Break down complex UIs into smaller components
   - Use props for customization
   - Keep components focused on single responsibility

2. **Type Safety**
   - Always define TypeScript interfaces for props
   - Use proper types for state variables
   - Export interfaces when needed by parent components

3. **Accessibility**
   - Use semantic HTML elements
   - Include aria-labels where appropriate
   - Ensure keyboard navigation works
   - Provide visual feedback for interactions

4. **Performance**
   - Use conditional rendering wisely
   - Avoid unnecessary re-renders
   - Keep component state minimal

5. **Consistency**
   - Follow established styling patterns
   - Use standard spacing (Tailwind spacing scale)
   - Maintain consistent naming conventions
   - Reuse components when possible

---

**Last Updated**: October 9, 2025
