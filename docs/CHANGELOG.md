# Changelog

All notable changes to the Ghost Writing Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Consistency Check Tab** - Dedicated UI for consistency reports
  - New "Consistency" tab between Chapters and Export
  - Moved consistency report from Chapters tab to dedicated space
  - Enhanced UI with large score display (circle badge)
  - 3 gradient cards for dimension breakdown (narrative, style, factual)
  - Improved issues display with severity badges and color coding
  - Warning badges for obsolete reports (when chapters are modified)
  - Info card explaining how consistency check works
  - Better button states (disabled during generation)

### Changed
- **Consistency Check Reasoning** - Optimized GPT-5 parameters
  - Changed reasoning effort from `minimal` to `medium` for balanced accuracy
  - Updated `maxOutputTokens` from 2000 to 4000 (sufficient for medium reasoning)
  - Fixed inconsistency: now uses `getReasoningEffortForTask()` helper function
  - Added comment: "balanced accuracy" instead of "complex analysis"
  - Cost-effective while maintaining quality

### Fixed
- **Consistency Check Architecture** - Resolved parameter inconsistency
  - Fixed mismatch between `responses-api.ts` (defined `'high'`) and `chapter-generation.ts` (hardcoded `'minimal'`)
  - Now both files agree on `'medium'` as optimal reasoning level
  - Eliminated hardcoded reasoning effort in favor of centralized helper function

---

## [1.0.0] - 2025-10-11 🎉 PRODUCTION READY

### Added
- **DOCX Export System** (`lib/export/docx-generator.ts`)
  - Professional document generation with `docx` library
  - Cover page with title, subtitle, author info
  - Copyright page with automatic year
  - Automatic Table of Contents with hyperlinks
  - All chapters with professional formatting
  - Author biography section
  - Custom filename generation (title-slug-date.docx)
  - Page numbering and margins (1 inch all sides)
  - Calibri font, 12pt body text, justified alignment

- **Export API Route** (`app/api/projects/[id]/export/route.ts`)
  - GET endpoint for DOCX download
  - Automatic file download with proper headers
  - Content-Type: DOCX MIME type
  - Content-Disposition with filename
  - Validation: project exists, has chapters
  - Error handling with clear messages

- **Export Tab UI** (Updated `app/progetti/[id]/page.tsx`)
  - Full-featured Export tab (replaced placeholder)
  - Project statistics: chapters, words, estimated pages
  - Export button with loading states
  - Success/error messages with visual feedback
  - Warning for incomplete chapters
  - Info card with export details
  - Automatic download trigger

- **API Client Helper** (`lib/api/projects.ts`)
  - `exportDocx()` method
  - Blob handling and download
  - Filename extraction from headers
  - Temporary link creation and cleanup
  - Returns success status and filename

### Documentation
- **SPRINT5_COMPLETE.md** - Complete Sprint 5 documentation
  - DOCX generation implementation details
  - Document structure and formatting
  - API routes and client helpers
  - UI components and states
  - Testing guide
  - Cost analysis (free, client-side generation)
  - Performance metrics

- **Updated NEXT_STEPS.md** - Project completion summary
  - All 5 sprints completed checklist
  - End-to-end workflow documentation
  - Complete testing guide
  - Deployment checklist
  - Optional future enhancements

### Changed
- Project now **production-ready** for deployment
- Complete end-to-end workflow: Create → Outline → Chapters → Check → Export
- Total time to generate book: 10-15 minutes
- Total cost per book: ~$0.15
- Export time: 2-3 seconds (client-side, free)

### Technical
- Installed `docx` (v8.x) for Word document generation
- Installed `file-saver` for client-side downloads
- Added TypeScript types for file-saver

---

## [0.5.0] - 2025-10-09

### Added
- **Modal Component** (`components/Modal.tsx`)
  - Reusable modal/dialog system
  - Dark backdrop with click-outside-to-close
  - ESC key support
  - Configurable sizes (sm, md, lg, xl, full)
  - Body scroll prevention when open
  - Smooth transitions and animations

- **NewProjectModal Component** (`components/NewProjectModal.tsx`)
  - Comprehensive project creation form
  - 5 main sections: Author Info, Book Info, Entrepreneurial Journey, Goals, Project Details
  - 13 required fields, 3 optional fields
  - Hero's Journey framework adapted for business narratives
  - Specialized for high-end business ghost writing
  - Target audience: Entrepreneurs, CEOs, Founders, YouTubers, Startuppers
  - Role dropdown with 9 professional options
  - Multi-line textareas for detailed responses
  - Responsive grid layout
  - Visual section separators with icons
  - HTML5 form validation

- **Dashboard CTA Card**
  - Prominent "Crea un Nuovo Progetto" call-to-action
  - Centered design with blue color scheme
  - Opens NewProjectModal on click
  - Positioned between stats and recent activity

- **Project Form Data Interface**
  - New `ProjectFormData` TypeScript interface
  - 16 total fields capturing comprehensive project information
  - Exported from NewProjectModal for reuse

- **Documentation**
  - Moved all docs to `/docs` folder
  - `docs/ARCHITECTURE.md` - Complete architectural overview
  - `docs/COMPONENTS.md` - Detailed component documentation
  - `docs/PROJECT_FORM.md` - New project form guide with examples
  - `docs/CHANGELOG.md` - This file

### Changed
- Dashboard page now includes modal integration
- Updated component count from 8 to 10 (added Modal, NewProjectModal)
- Reorganized documentation structure

### Removed
- **Deadline field** from NewProjectModal (not needed for business model)
- **Budget field** from NewProjectModal (removed per user request)

### Documentation
- Complete rewrite of ARCHITECTURE.md with new modal system
- Added comprehensive PROJECT_FORM.md guide
- Updated COMPONENTS.md with modal documentation
- Created CHANGELOG.md for version tracking

---

## [0.4.0] - 2025-10-09

### Removed
- **Dark Mode System** (Complete Removal)
  - Deleted `components/ThemeProvider.tsx` file entirely
  - Removed ThemeProvider import and wrapper from `app/layout.tsx`
  - Removed theme toggle button from Sidebar
  - Removed theme dropdown option from Settings page
  - Removed `darkMode: 'class'` from `tailwind.config.ts`
  - Cleaned all `dark:` CSS classes from components
  - Removed 200+ lines of dark mode documentation from ARCHITECTURE.md
  - Removed Context API references (no longer needed)

### Changed
- **Title Standardization**
  - Moved "Progetti" title from inside `ProjectTable` to `PageContainer` prop
  - Moved "Clienti" title from inside `ClientTable` to `PageContainer` prop
  - All 7 pages now have consistent title/description pattern
  - Titles displayed outside cards via `PageContainer` component

- **Component Updates**
  - `Sidebar.tsx`: Removed theme-related state, icons, and UI elements
  - `settings/page.tsx`: Removed entire "Tema" section from preferences
  - `ProjectTable.tsx`: Removed h1 title, now receives title from parent
  - `ClientTable.tsx`: Removed h1 title, now receives title from parent
  - `app/layout.tsx`: Simplified to basic HTML structure without theme provider

### Fixed
- UI consistency across all pages
- Title placement standardized
- No dark mode flickering or hydration issues

---

## [0.3.0] - 2025-10-08

### Added
- **Multi-page Routing**
  - Dashboard (`/`)
  - Projects list (`/progetti`)
  - Project detail (`/progetti/[id]`)
  - Clients list (`/clients`)
  - Client detail (`/clients/[id]`)
  - Analytics dashboard (`/analytics`)
  - Settings page (`/settings`)

- **PageContainer Component**
  - Reusable layout wrapper
  - Consistent padding (24px)
  - Optional title and description props
  - Full-height flex container

- **Card Component**
  - Reusable container with consistent styling
  - Configurable padding (sm, md, lg)
  - White background with border and shadow
  - Accepts custom className

- **ClientTable Component**
  - Table view for clients
  - Search and filter functionality
  - Status badges
  - Client metrics display

- **Settings Page**
  - Profile settings
  - Notification preferences
  - Privacy settings
  - Language preferences
  - Theme selector (later removed in 0.4.0)

- **Analytics Page**
  - Placeholder for future analytics features

### Changed
- Separated projects and clients into dedicated pages
- Updated navigation structure in Sidebar
- Improved component organization

---

## [0.2.0] - 2025-10-07

### Added
- **ProjectTable Component**
  - Table-based view for projects
  - Search functionality
  - Status filters
  - Date range filters
  - Sortable columns

- **TypeScript Interfaces**
  - `Project` interface
  - `Client` interface
  - `WorkflowStage` interface

### Changed
- Enhanced project listing with more metadata
- Improved filtering capabilities

---

## [0.1.0] - 2025-10-06

### Added
- **Initial Project Setup**
  - Next.js 14 with App Router
  - TypeScript configuration
  - Tailwind CSS integration
  - Basic component structure

- **Core Components**
  - `Sidebar` - Navigation component
  - `ProjectList` - Card-based project view
  - `ContentEditor` - Text editor with toolbar
  - `WorkflowPanel` - Progress tracker

- **Basic Features**
  - Project listing
  - Content editing interface
  - Workflow tracking
  - Responsive design

- **Documentation**
  - Initial README.md
  - Basic ARCHITECTURE.md

---

## Roadmap / Planned Features

### [0.6.0] - Database Integration (Planned)
- [ ] Set up Prisma ORM
- [ ] Create database schema
- [ ] API routes for CRUD operations
- [ ] Connect NewProjectModal to database
- [ ] Persist project data

### [0.7.0] - Authentication (Planned)
- [ ] NextAuth.js integration
- [ ] User registration and login
- [ ] Protected routes
- [ ] User-specific projects and clients

### [0.8.0] - Enhanced Editor (Planned)
- [ ] Rich text editor with formatting
- [ ] Auto-save functionality
- [ ] Version history
- [ ] Collaborative editing

### [0.9.0] - AI Integration (Planned)
- [ ] AI writing suggestions
- [ ] Grammar and style checking
- [ ] Content generation assistance
- [ ] Auto-summarization

### [1.0.0] - Production Release (Planned)
- [ ] Complete testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] User documentation
- [ ] Admin dashboard

---

## Notes

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, component additions, significant updates
- **Patch (0.0.X)**: Bug fixes, small improvements, documentation updates

### Removed Features Log
- **0.4.0**: Dark mode completely removed (user decision - simplicity preferred)
- **0.5.0**: Deadline and Budget fields removed from project form (not needed)

---

**Repository**: [Internal Project]  
**Maintained by**: Ghost Writing Development Team  
**Last Updated**: October 9, 2025
