# Piano di Implementazione - PDF Export + Flipbook Viewer 📚

## 📋 Executive Summary

**Obiettivo**: Implementare export PDF (accanto al DOCX esistente) + sezione Flipbook dedicata per visualizzare i libri generati.

**Approccio Semplificato v2.0**:
1. **Export PDF**: Aggiungere pulsante "Scarica PDF" nel tab Esporta (accanto a "Scarica DOCX")
2. **Auto-Save**: Quando user esporta PDF, salvare automaticamente in Vercel Blob + Supabase
3. **Flipbook Viewer**: Nuova sezione per visualizzare tutti i PDF salvati

**Status**: Piano di Implementazione v2.0 - Approccio Semplificato ✅

---

## 🚀 Quick Reference

### Infrastruttura Riutilizzata (100%)
- ✅ **Supabase PostgreSQL** - Database già configurato
- ✅ **Vercel Blob** - File storage già configurato  
- ✅ **Prisma ORM** - Type-safe queries + migrations
- ✅ **Pattern Export** - Da `DocxGenerator` + API `/export`
- ✅ **Pattern Upload/Delete** - Da `DocumentService`
- ✅ **UI Export Tab** - Già esistente, aggiungi solo PDF button

### Nuovo da Creare (Semplificato)
- 📄 **PDF Generator** (~300 LOC) - Parallelo a DocxGenerator
- 📤 **Export PDF API** (~120 LOC) - Parallelo a `/export` route + auto-save
- 💾 **BookExportService** (~200 LOC) - Solo management (list/get/delete)
- 🎨 **UI Components** (~410 LOC) - BookViewer, BookSelector, Flipbook page
- 🔌 **API Books CRUD** (~110 LOC) - List/Get/Delete operations
- 🗄️ **Schema Update** (+30 LOC) - ExportedBook model
- 🔘 **Export Tab Update** (+50 LOC) - Add PDF button

### Timeline (Semplificato!)
- **Sprint 1**: 6-8 ore (DB + PDF Export + Auto-Save)
- **Sprint 2**: 6-8 ore (Flipbook UI + Viewer)
- **Sprint 3**: 4-5 ore (Testing + Docs)
- **Totale**: 16-21 ore (**-7 ore vs approccio precedente!**)

### Costo
- **Infrastruttura**: $0.00 (free tier esistenti)
- **Dependencies**: 3 npm packages (jspdf, jspdf-autotable, react-pdf)

---

## 🏗️ Infrastruttura Esistente (Riutilizzata al 100%)

### Database: Supabase PostgreSQL
**Status**: ✅ Già configurato e in produzione

**Connection Strings** (da `.env`):
```bash
# Runtime queries (con pgBouncer, porta 6543)
DATABASE_URL="postgresql://postgres.xxx:pwd@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15"

# Migrations only (direct connection, porta 5432)
DIRECT_URL="postgresql://postgres.xxx:pwd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

**Utilizzo Attuale**:
- Models: Project, Chapter, Outline, User, GenerationLog, ProjectDocument, etc.
- ORM: Prisma (type-safe queries)
- Migrations: `npx prisma migrate dev`
- Free Tier: 500MB database (sufficiente per 500k+ ExportedBook records)

---

### File Storage: Vercel Blob
**Status**: ✅ Già configurato per upload documenti

**Configuration** (da `.env`):
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXXXXXXXX"
```

**Utilizzo Attuale**:
- Upload documenti in `ProjectDocument` (PDF, DOCX, TXT fino a 50MB)
- Pattern: Client-side direct upload (bypass serverless 4.5MB limit)
- Storage: Vercel Blob URLs pubblici

**Codice Esistente da Riutilizzare**:
```typescript
// lib/services/document-service.ts
import { put, del } from '@vercel/blob';

// Upload file
const { url } = await put(fileName, blob, {
  access: 'public',
  addRandomSuffix: true,
});

// Delete file
await del(fileUrl);
```

**Free Tier**: 10GB storage, 100GB bandwidth/month  
**Capacity**: ~2,000-5,000 libri PDF (2-5MB cadauno)

---

## 🎯 Decisione Architetturale

### Approccio: Export Separato + Flipbook Viewer

**Rationale**:
- ✅ **User Control**: L'utente decide quando esportare (explicit action)
- ✅ **Consistent UX**: Pattern identico a "Scarica DOCX" già esistente
- ✅ **Separation of Concerns**: Export logic ≠ Viewing logic
- ✅ **Reusabilità**: PdfGenerator usabile anche per altri scopi futuri
- ✅ **Più Semplice**: Meno logica automatica, più prevedibile
- ✅ **Testabile**: Export e Viewer testabili indipendentemente

### Flow Utente Completo
```
1. User completa progetto (genera tutti i capitoli)
2. User va su tab "Esporta"
3. User vede: [Scarica DOCX] [Scarica PDF] ← NUOVO
4. User clicca "Scarica PDF"
   ├─ System genera PDF
   ├─ System salva in Vercel Blob
   ├─ System salva metadata in Supabase
   ├─ System avvia download browser
   └─ Toast: "PDF scaricato e salvato nella libreria Flipbook!"
5. User può andare su /flipbook per vedere tutti i libri
```

---

## 📝 Implementation Steps

### **FASE 1: Database Setup** ⚙️
**Obiettivo**: Aggiungere model ExportedBook a Supabase  
**Stima**: 30 minuti

#### Step 1.1: Schema Migration

**File**: `prisma/schema.prisma`

```prisma
// Line ~85: Add to Project model
model Project {
  // ... existing fields ...
  exportedBooks ExportedBook[] // ADD THIS LINE
}

// Line ~284: Add new model at the end
model ExportedBook {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // File Information
  title          String
  fileName       String
  fileUrl        String        // Vercel Blob URL
  fileSizeBytes  Int
  
  // Format & Version
  format         String @default("pdf")
  version        Int @default(1)         // Track re-exports
  
  // Metadata
  chaptersCount  Int
  totalWords     Int
  totalPages     Int           // Estimated (wordCount / 250)
  
  // Status
  status         String @default("ready") // "generating" | "ready" | "error"
  errorMessage   String? @db.Text
  
  // Timestamps
  generatedAt    DateTime @default(now())
  lastAccessedAt DateTime @default(now())
  
  @@index([projectId])
  @@index([status])
  @@index([generatedAt])
  @@index([lastAccessedAt])
}
```

**Commands**:
```bash
# Generate migration
npx prisma migrate dev --name add_exported_books

# Generate Prisma Client
npx prisma generate
```

**Tasks**:
- [ ] Aggiungere `exportedBooks` relation a `Project`
- [ ] Creare model `ExportedBook`
- [ ] Eseguire migration su Supabase
- [ ] Verificare in Supabase Dashboard (Table Editor)
- [ ] Testare rollback (solo in dev!)

---

### **FASE 2: PDF Export Feature** 📄
**Obiettivo**: Aggiungere export PDF nel tab Esporta  
**Stima**: 5-7 ore

#### Step 2.1: Install Dependencies

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

---

#### Step 2.2: Create PDF Generator

**File**: `lib/export/pdf-generator.ts`

```typescript
/**
 * PDF Generator
 * Genera PDF professionale del libro completo
 * Parallelo a DocxGenerator (DRY principle)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Chapter } from '@prisma/client';

interface PdfExportOptions {
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  includeAuthorBio?: boolean;
  pageNumbering?: boolean;
}

export class PdfGenerator {
  /**
   * Genera PDF completo
   * Returns Buffer per server-side usage
   */
  static async generateDocument(
    project: Project & { chapters: Chapter[] },
    options: PdfExportOptions = {}
  ): Promise<Buffer> {
    const {
      includeTableOfContents = true,
      includeCoverPage = true,
      includeAuthorBio = true,
      pageNumbering = true,
    } = options;

    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Cover Page
    if (includeCoverPage) {
      this.addCoverPage(doc, project);
    }

    // 2. Copyright Page
    this.addCopyrightPage(doc, project);

    // 3. Table of Contents
    if (includeTableOfContents) {
      this.addTableOfContents(doc, project.chapters);
    }

    // 4. Chapters
    const sortedChapters = [...project.chapters].sort(
      (a, b) => a.chapterNumber - b.chapterNumber
    );

    for (const chapter of sortedChapters) {
      this.addChapter(doc, chapter);
    }

    // 5. Author Bio
    if (includeAuthorBio) {
      this.addAuthorBio(doc, project);
    }

    // Return as Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  /**
   * Genera filename (riusa da DocxGenerator)
   */
  static generateFileName(project: Project): string {
    const titleSlug = project.bookTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const date = new Date().toISOString().split('T')[0];
    return `${titleSlug}-${date}.pdf`;
  }

  private static addCoverPage(doc: jsPDF, project: Project): void {
    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(project.bookTitle, 105, 100, { align: 'center' });

    // Subtitle
    if (project.bookSubtitle) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'italic');
      doc.text(project.bookSubtitle, 105, 120, { align: 'center' });
    }

    // Author
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(project.authorName, 105, 200, { align: 'center' });

    doc.addPage();
  }

  private static addCopyrightPage(doc: jsPDF, project: Project): void {
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ${project.authorName}`, 20, 20);
    doc.text('Tutti i diritti riservati.', 20, 30);
    doc.addPage();
  }

  private static addTableOfContents(doc: jsPDF, chapters: Chapter[]): void {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Indice', 20, 20);

    let y = 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    chapters.forEach((chapter) => {
      doc.text(`Capitolo ${chapter.chapterNumber}: ${chapter.title}`, 20, y);
      y += 10;
    });

    doc.addPage();
  }

  private static addChapter(doc: jsPDF, chapter: Chapter): void {
    // Chapter number
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Capitolo ${chapter.chapterNumber}`, 20, 20);

    // Chapter title
    doc.setFontSize(18);
    doc.text(chapter.title, 20, 30);

    // Chapter content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const contentLines = doc.splitTextToSize(chapter.content, 170);
    doc.text(contentLines, 20, 45);

    doc.addPage();
  }

  private static addAuthorBio(doc: jsPDF, project: Project): void {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Sull'Autore", 20, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(project.authorName, 20, 35);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const bioText = `${project.authorRole || ''}\n${project.company || ''}\n\n${project.businessGoals || ''}`;
    const bioLines = doc.splitTextToSize(bioText, 170);
    doc.text(bioLines, 20, 45);
  }
}
```

**Tasks**:
- [ ] Implementare PdfGenerator class
- [ ] Cover page (titolo, autore, subtitle)
- [ ] Copyright page
- [ ] Table of Contents
- [ ] Chapters rendering (con text wrapping)
- [ ] Author bio page
- [ ] Testare PDF output visivamente

**Note**: Implementazione base, può essere migliorata con styling avanzato in futuro

**Estimated Time**: 3-4 ore

---

#### Step 2.3: API Route PDF Export + Auto-Save

**File**: `app/api/projects/[id]/export-pdf/route.ts`

```typescript
/**
 * PDF Export API
 * Genera PDF + Download + Auto-Save to Flipbook
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PdfGenerator } from '@/lib/export/pdf-generator';
import { put } from '@vercel/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Fetch project + chapters
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        chapters: {
          where: { status: 'completed' },
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    if (!project.chapters || project.chapters.length === 0) {
      return NextResponse.json(
        { error: 'Nessun capitolo disponibile' },
        { status: 400 }
      );
    }

    // 2. Generate PDF
    const buffer = await PdfGenerator.generateDocument(project, {
      includeTableOfContents: true,
      includeCoverPage: true,
      includeAuthorBio: true,
      pageNumbering: true,
    });

    const fileName = PdfGenerator.generateFileName(project);

    // 3. AUTO-SAVE to Vercel Blob + Supabase (for Flipbook)
    try {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const { url } = await put(fileName, blob, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Calculate metadata
      const totalWords = project.chapters.reduce(
        (sum, ch) => sum + (ch.wordCount || 0),
        0
      );

      // Check existing version
      const existingBook = await prisma.exportedBook.findFirst({
        where: { projectId: id },
        orderBy: { version: 'desc' },
      });

      // Save to Supabase
      await prisma.exportedBook.create({
        data: {
          projectId: id,
          title: project.bookTitle,
          fileName,
          fileUrl: url,
          fileSizeBytes: buffer.length,
          format: 'pdf',
          version: existingBook ? existingBook.version + 1 : 1,
          chaptersCount: project.chapters.length,
          totalWords,
          totalPages: Math.ceil(totalWords / 250),
          status: 'ready',
        },
      });

      console.log(`✅ PDF auto-saved to Flipbook: ${url}`);
    } catch (saveError) {
      // Log error but don't fail the download
      console.error('❌ Failed to save PDF to Flipbook:', saveError);
    }

    // 4. Return PDF for download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'esportazione' },
      { status: 500 }
    );
  }
}
```

**Design**:
- ✅ Download sempre funziona (anche se auto-save fallisce)
- ✅ Versioning automatico (incrementa version se re-export)
- ✅ Logging per debugging
- ✅ Pattern identico a `/export` route DOCX

**Tasks**:
- [ ] Implementare GET handler
- [ ] Generazione PDF
- [ ] Upload to Vercel Blob
- [ ] Save metadata to Supabase
- [ ] Error handling (try-catch auto-save)
- [ ] Return PDF buffer con headers corretti
- [ ] Testare download + verifica Supabase

**Estimated Time**: 1.5 ore

---

#### Step 2.4: Update Export Tab UI

**File**: `app/progetti/[id]/page.tsx` (ExportTab component)

**Add State**:
```typescript
const [isExportingPdf, setIsExportingPdf] = useState(false);
```

**Add Handler**:
```typescript
const handleExportPdf = async () => {
  try {
    setIsExportingPdf(true);
    setExportError(null);

    toast.info('📄 Generazione PDF in corso...');

    // Call API
    const response = await fetch(`/api/projects/${project.id}/export-pdf`);
    
    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.bookTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('📄 PDF scaricato e salvato nella libreria Flipbook!');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
    setExportError(errorMessage);
    toast.error(`Errore: ${errorMessage}`);
  } finally {
    setIsExportingPdf(false);
  }
};
```

**Add UI Button** (accanto a "Scarica DOCX"):
```tsx
<div className="flex gap-4">
  {/* Existing DOCX button */}
  <button
    onClick={handleExport}
    disabled={isExporting}
    className="flex items-center gap-2 px-8 py-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
  >
    <Download size={24} />
    <span>Scarica DOCX</span>
  </button>

  {/* NEW PDF button */}
  <button
    onClick={handleExportPdf}
    disabled={isExportingPdf}
    className="flex items-center gap-2 px-8 py-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white"
  >
    <FileText size={24} />
    <span>Scarica PDF</span>
  </button>
</div>
```

**Tasks**:
- [ ] Aggiungere state `isExportingPdf`
- [ ] Implementare `handleExportPdf`
- [ ] Aggiungere pulsante PDF (styling verde per differenziare)
- [ ] Loading state
- [ ] Toast notifications
- [ ] Error handling
- [ ] Testare download + auto-save

**Estimated Time**: 1 ora

---

### **FASE 3: Book Management Service** 💾
**Obiettivo**: Service per gestire libri nel Flipbook  
**Stima**: 1.5-2 ore

#### Step 3.1: Book Management Service

**File**: `lib/services/book-export-service.ts`

**Nota**: Generation + save è già in `/export-pdf` route.  
Questo service fornisce solo metodi di **management**.

```typescript
/**
 * Book Export Service
 * Gestione libri esportati (list, get, delete)
 */

import { del } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { ExportedBook } from '@prisma/client';

export class BookExportService {
  /**
   * Lista tutti i libri disponibili
   */
  static async listAvailableBooks(): Promise<
    (ExportedBook & { project: { authorName: string } })[]
  > {
    return prisma.exportedBook.findMany({
      where: {
        status: 'ready',
      },
      include: {
        project: {
          select: {
            authorName: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });
  }

  /**
   * Ottieni singolo libro
   */
  static async getBook(bookId: string): Promise<ExportedBook | null> {
    return prisma.exportedBook.findUnique({
      where: { id: bookId },
      include: {
        project: {
          select: {
            authorName: true,
            bookTitle: true,
          },
        },
      },
    });
  }

  /**
   * Elimina libro (Vercel Blob + Supabase)
   */
  static async deleteBook(bookId: string): Promise<void> {
    const book = await prisma.exportedBook.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error('Libro non trovato');
    }

    // Delete from Vercel Blob
    try {
      await del(book.fileUrl);
    } catch (error) {
      console.error('Failed to delete from Vercel Blob:', error);
      // Continue to delete DB record anyway
    }

    // Delete DB record
    await prisma.exportedBook.delete({
      where: { id: bookId },
    });
  }

  /**
   * Marca come accessato (tracking)
   */
  static async markAsAccessed(bookId: string): Promise<void> {
    await prisma.exportedBook.update({
      where: { id: bookId },
      data: { lastAccessedAt: new Date() },
    });
  }

  /**
   * Cleanup old books (maintenance)
   */
  static async cleanupOldBooks(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldBooks = await prisma.exportedBook.findMany({
      where: {
        lastAccessedAt: {
          lt: cutoffDate,
        },
      },
    });

    // Delete from Vercel Blob
    await Promise.all(
      oldBooks.map((book) =>
        del(book.fileUrl).catch((err) =>
          console.error(`Failed to delete ${book.fileUrl}:`, err)
        )
      )
    );

    // Delete from DB
    const result = await prisma.exportedBook.deleteMany({
      where: {
        id: {
          in: oldBooks.map((b) => b.id),
        },
      },
    });

    return result.count;
  }
}
```

**Tasks**:
- [ ] Implementare `listAvailableBooks`
- [ ] Implementare `getBook`
- [ ] Implementare `deleteBook`
- [ ] Implementare `markAsAccessed`
- [ ] Implementare `cleanupOldBooks` (optional)
- [ ] Error handling
- [ ] JSDoc comments

**Estimated Time**: 1.5 ore

---

#### Step 3.2: API Routes for Book Management

**File**: `app/api/books/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { BookExportService } from '@/lib/services/book-export-service';

// GET /api/books - List all books
export async function GET(request: NextRequest) {
  try {
    const books = await BookExportService.listAvailableBooks();
    return NextResponse.json(books);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
```

**File**: `app/api/books/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { BookExportService } from '@/lib/services/book-export-service';

// GET /api/books/[id] - Get single book
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await BookExportService.getBook(params.id);
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Failed to fetch book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete book
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BookExportService.deleteBook(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
```

**Tasks**:
- [ ] Implementare GET /api/books
- [ ] Implementare GET /api/books/[id]
- [ ] Implementare DELETE /api/books/[id]
- [ ] Error handling
- [ ] Testing con Postman/Thunder Client

**Estimated Time**: 1 ora

---

### **FASE 4: Frontend - Flipbook Route** 🎨
**Obiettivo**: Creare pagina `/flipbook` con viewer  
**Stima**: 6-8 ore

#### Step 4.1: Install Dependencies

```bash
npm install react-pdf
npm install --save-dev @types/react-pdf
```

---

#### Step 4.2: Flipbook Page Component

**File**: `app/flipbook/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import BookSelector from '@/components/BookSelector';
import BookViewer from '@/components/BookViewer';
import { Card } from '@/components/Card';
import { BookOpen } from 'lucide-react';

interface ExportedBook {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  version: number;
  chaptersCount: number;
  totalWords: number;
  totalPages: number;
  generatedAt: string;
  project: {
    authorName: string;
  };
}

export default function FlipbookPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<ExportedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 overflow-auto">
        <PageContainer 
          title="📚 Flipbook - Libreria Digitale"
          onMobileMenuOpen={() => setMobileOpen(true)}
        >
          {/* Book Selector */}
          <Card>
            <BookSelector
              books={books}
              selectedBookId={selectedBookId}
              onSelectBook={setSelectedBookId}
              onRefresh={loadBooks}
              loading={loading}
            />
          </Card>

          {/* Book Viewer or Empty State */}
          {selectedBookId ? (
            <BookViewer 
              bookId={selectedBookId}
              onDelete={() => {
                loadBooks();
                setSelectedBookId(null);
              }}
            />
          ) : (
            <EmptyState hasBooks={books.length > 0} />
          )}
        </PageContainer>
      </div>
    </div>
  );
}

function EmptyState({ hasBooks }: { hasBooks: boolean }) {
  return (
    <Card>
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasBooks 
            ? 'Nessun Libro Selezionato' 
            : 'Nessun Libro Disponibile'}
        </h3>
        <p className="text-gray-600">
          {hasBooks
            ? 'Seleziona un libro dal menu a tendina per visualizzarlo'
            : 'Esporta un libro in PDF per vederlo qui'}
        </p>
      </div>
    </Card>
  );
}
```

**Estimated Time**: 1.5 ore

---

#### Step 4.3: BookSelector Component

**File**: `components/BookSelector.tsx`

```typescript
'use client';

import { RefreshCw } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  version: number;
  generatedAt: string;
  project: {
    authorName: string;
  };
}

interface BookSelectorProps {
  books: Book[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function BookSelector({ 
  books, 
  selectedBookId, 
  onSelectBook,
  onRefresh,
  loading = false
}: BookSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Dropdown */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleziona Libro
        </label>
        <select
          value={selectedBookId || ''}
          onChange={(e) => onSelectBook(e.target.value || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">-- Nessun libro selezionato --</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} - {book.project.authorName} (v{book.version}) - {new Date(book.generatedAt).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Aggiorna lista"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
```

**Estimated Time**: 1 ora

---

#### Step 4.4: BookViewer Component

**File**: `components/BookViewer.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card } from '@/components/Card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash2 } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Book {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  totalPages: number;
}

interface BookViewerProps {
  bookId: string;
  onDelete?: () => void;
}

export default function BookViewer({ bookId, onDelete }: BookViewerProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);
      if (!response.ok) throw new Error('Failed to fetch book');
      const data = await response.json();
      setBook(data);
      
      // Mark as accessed
      await fetch(`/api/books/${bookId}/access`, { method: 'POST' });
    } catch (error) {
      console.error('Error loading book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo libro?')) return;
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete book');
      
      onDelete?.();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Errore durante l\'eliminazione del libro');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento libro...</p>
        </div>
      </Card>
    );
  }

  if (!book) return null;

  return (
    <Card>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700 min-w-[100px] text-center">
            Pagina {currentPage} di {numPages || '...'}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages || 1, p + 1))}
            disabled={currentPage === numPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => window.open(book.fileUrl, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Download className="w-4 h-4" />
            Scarica
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            <Trash2 className="w-4 h-4" />
            Elimina
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex justify-center bg-gray-100 p-4 min-h-[600px]">
        <Document
          file={book.fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          }
        >
          <Page 
            pageNumber={currentPage} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </Card>
  );
}
```

**Estimated Time**: 2.5-3 ore

---

#### Step 4.5: Update Sidebar Navigation

**File**: `components/Sidebar.tsx`

**Add to menuItems**:
```typescript
const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Progetti', href: '/progetti' },
  { icon: Users, label: 'Clienti', href: '/clients' },
  { icon: BarChart, label: 'Analytics', href: '/analytics' },
  { icon: BookOpen, label: 'Istruzioni', href: '/istruzioni' },
  { icon: Book, label: 'Flipbook', href: '/flipbook' }, // ADD THIS
  { icon: History, label: 'Changelog', href: '/changelog' },
  { icon: Settings, label: 'Impostazioni', href: '/settings' },
];
```

**Import Icon**:
```typescript
import { Book } from 'lucide-react';
```

**Estimated Time**: 10 minuti

---

### **FASE 5: Client API Helper** 🔌
**Obiettivo**: Helper functions per API calls  
**Stima**: 45 minuti

**File**: `lib/api/books-api.ts`

```typescript
export interface ExportedBook {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  format: string;
  version: number;
  chaptersCount: number;
  totalWords: number;
  totalPages: number;
  status: string;
  generatedAt: string;
  lastAccessedAt: string;
  project?: {
    authorName: string;
  };
}

export const booksApi = {
  async list(): Promise<ExportedBook[]> {
    const response = await fetch('/api/books');
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  },

  async get(bookId: string): Promise<ExportedBook> {
    const response = await fetch(`/api/books/${bookId}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  },

  async delete(bookId: string): Promise<void> {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete book');
  },

  async markAccessed(bookId: string): Promise<void> {
    await fetch(`/api/books/${bookId}/access`, {
      method: 'POST',
    });
  },
};
```

---

### **FASE 6: Documentation & Testing** 📚
**Obiettivo**: Documentare e testare  
**Stima**: 4-5 ore

#### Testing Checklist

**Unit Tests**:
- [ ] PdfGenerator.generateDocument()
- [ ] BookExportService methods

**Integration Tests**:
- [ ] GET /api/projects/[id]/export-pdf
- [ ] POST /api/books (auto-save)
- [ ] GET /api/books
- [ ] DELETE /api/books/[id]

**E2E Tests**:
- [ ] Export PDF da progetto
- [ ] PDF salvato in Supabase
- [ ] Visualizza in Flipbook
- [ ] Navigate PDF pages
- [ ] Zoom in/out
- [ ] Download PDF
- [ ] Delete PDF

**Browser Compatibility**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Responsive**:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 📊 Summary & Estimates

### Total Implementation Time
| Fase | Descrizione | Tempo Stimato |
|------|-------------|---------------|
| FASE 1 | Database Setup | 0.5 ore |
| FASE 2 | PDF Export Feature | 5-7 ore |
| FASE 3 | Book Management Service | 1.5-2 ore |
| FASE 4 | Flipbook UI | 6-8 ore |
| FASE 5 | Client API Helper | 0.75 ore |
| FASE 6 | Testing & Docs | 4-5 ore |
| **TOTALE** | | **18-23 ore** |

### Risparmio vs Approccio Precedente
- ✅ **-5 ore** grazie a approccio semplificato
- ✅ Export inline nel route (no service layer complesso)
- ✅ UI button in tab esistente (no integrazione complessa)

### Development Sprints
- **Sprint 1** (6-8 ore): Database + PDF Export completo
- **Sprint 2** (7-9 ore): Management Service + Flipbook UI
- **Sprint 3** (5-6 ore): Testing + Documentation

---

## ✅ Quality Checklist

### Code Quality
- [ ] **DRY**: Riutilizzo pattern esistenti
- [ ] **Type Safety**: Full TypeScript
- [ ] **Error Handling**: Try-catch completo
- [ ] **Logging**: Console.log per debugging
- [ ] **Comments**: JSDoc su funzioni pubbliche

### Architecture
- [ ] **Separation of Concerns**: Export ≠ Viewing
- [ ] **Backward Compatible**: Zero breaking changes
- [ ] **Scalable**: Supporta 2k-5k libri
- [ ] **Maintainable**: Codice pulito

### UX
- [ ] **User Control**: Export esplicito
- [ ] **Consistent**: Pattern DOCX riutilizzato
- [ ] **Fast**: Loading < 2s
- [ ] **Responsive**: Mobile-friendly
- [ ] **Accessible**: ARIA labels

---

## 🚨 Risks & Mitigations

### Risk 1: PDF Generation Performance
**Problema**: Libri grandi (200+ pagine) lenti  
**Mitigation**: Server-side generation, timeout aumentato

### Risk 2: Storage Costs
**Problema**: Vercel Blob 10GB limit  
**Mitigation**: Cleanup automatico (90 giorni), user feedback

### Risk 3: Browser PDF Rendering
**Problema**: Safari limitazioni  
**Mitigation**: react-pdf + fallback download

---

## 🎉 Conclusioni

### Architettura Finale
- ✅ **Separation of Concerns**: Export separato da Viewing
- ✅ **User Control**: Export esplicito, no auto-magic
- ✅ **DRY Principle**: 100% riutilizzo infrastruttura
- ✅ **Consistent UX**: Pattern DOCX + PDF affiancati
- ✅ **Production Ready**: Error handling, logging, testing
- ✅ **Zero Breaking Changes**: Backward compatible
- ✅ **Cost Efficient**: $0.00 (free tier)

### Flow Finale
```
1. User completa libro
2. User clicca "Scarica PDF" (accanto a DOCX)
3. System genera + salva + download
4. Toast: "Salvato nella libreria!"
5. User va su /flipbook
6. User visualizza tutti i libri
```

### Zero Setup Required
- ✅ Supabase PostgreSQL già configurato
- ✅ Vercel Blob già configurato
- ✅ Prisma ORM già in uso
- ✅ UI patterns già esistenti

**Totale**: 18-23 ore di sviluppo

---

**Autore**: GitHub Copilot  
**Data**: 14 Novembre 2025  
**Versione**: 2.0 - Approccio Semplificato (Export + Viewer separati)
