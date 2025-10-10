# New Project Form Guide

## 📋 Overview

The **NewProjectModal** is a comprehensive form designed specifically for creating high-end business ghost writing projects. This form is tailored for entrepreneurs, CEOs, YouTubers, and other high-spending professionals who want to write autobiographical or business-related books.

---

## 🎯 Purpose & Target Audience

### Who This Is For:
- **Entrepreneurs** - Business owners with proven track records
- **CEOs & Founders** - C-level executives with leadership stories
- **YouTubers & Content Creators** - Digital influencers with engaged audiences
- **Startuppers** - Startup founders with innovative journeys
- **Business Coaches** - Professional coaches sharing methodologies
- **Investors** - Angel investors and VCs with industry insights

### What We DON'T Do:
- ❌ Fiction writing
- ❌ Children's books
- ❌ Creative fiction genres
- ❌ Academic writing (unless business-related)

---

## 📝 Form Structure

The form is divided into **5 main sections**:

### 1️⃣ Informazioni Autore (Author Information)

This section collects basic information about the author/client.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Nome Completo | Text Input | ✅ Yes | Full name of the author |
| Ruolo/Posizione | Dropdown | ✅ Yes | Professional role (CEO, Founder, etc.) |
| Azienda/Brand | Text Input | ✅ Yes | Company or personal brand name |
| Settore/Industria | Text Input | ✅ Yes | Industry sector (Tech, Finance, etc.) |

**Role Options**:
- Imprenditore (Entrepreneur)
- CEO
- Founder/Co-founder
- YouTuber/Content Creator
- Startupper
- Consulente (Business Consultant)
- Coach (Business Coach)
- Investitore (Investor)
- Altro (Other)

**Example Data**:
```json
{
  "authorName": "Mario Rossi",
  "authorRole": "CEO",
  "company": "TechStart Italia",
  "industry": "Technology"
}
```

---

### 2️⃣ Informazioni Libro (Book Information)

This section defines the book's basic details and target audience.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Titolo del Libro | Text Input | ✅ Yes | Book title (can be tentative) |
| Sottotitolo | Text Input | ❌ No | Explanatory subtitle |
| Target di Lettori | Textarea | ✅ Yes | Who should read this book |

**Example Data**:
```json
{
  "bookTitle": "Da Zero a Leader",
  "bookSubtitle": "Come ho costruito un'azienda da 10 milioni partendo da un garage",
  "targetReaders": "Giovani imprenditori che vogliono avviare una startup nel settore tech, aspiranti founder tra i 25-40 anni"
}
```

---

### 3️⃣ Il Viaggio Imprenditoriale (The Entrepreneurial Journey)

This is the **core section** that uses the **Hero's Journey** framework adapted for business narratives.

**The Framework**:

```
Ordinary World → Call to Adventure → The Journey → Victory → Return with Knowledge
      ↓                  ↓                ↓            ↓              ↓
  Situazione        Sfida/Problema    Trasformazione  Successi    Lezione
   di Partenza                                        Ottenuti    Appresa
```

**Fields**:

| Field | Framework Stage | Required | Description |
|-------|----------------|----------|-------------|
| Situazione di Partenza | Ordinary World | ✅ Yes | Where the author started |
| La Sfida/Problema Affrontato | Call to Adventure | ✅ Yes | The challenge that started the journey |
| Il Percorso di Trasformazione | The Journey | ✅ Yes | How the author transformed |
| Risultati e Successi Ottenuti | The Victory | ✅ Yes | Concrete achievements and metrics |
| Lezione Principale e Messaggio | Return with Elixir | ✅ Yes | The key lesson to share |

**Example Data**:
```json
{
  "currentSituation": "Lavoravo come dipendente in una grande corporation, guadagnavo bene ma sentivo di non realizzarmi. Avevo 28 anni e una famiglia da mantenere.",
  
  "challengeFaced": "Il mercato del lavoro stava cambiando rapidamente. L'AI stava automatizzando molti ruoli e sentivo che dovevo creare qualcosa di mio prima che fosse troppo tardi. Il problema era che non avevo capitale, esperienza imprenditoriale né una rete di contatti nel mondo startup.",
  
  "transformation": "Ho iniziato a studiare ogni sera dopo il lavoro: business model, coding, marketing digitale. Ho partecipato a hackathon nei weekend. Ho imparato a vendere, a gestire team remoti, a prendere decisioni difficili. La vera trasformazione è stata mentale: da dipendente che esegue ordini a leader che crea visione.",
  
  "achievement": "In 3 anni abbiamo raggiunto 500.000 utenti attivi, raccolto 2 milioni di euro in seed funding, e assunto un team di 15 persone. Il fatturato è passato da 0 a 1.2 milioni annui. Ma soprattutto, abbiamo creato una cultura aziendale che attrae i migliori talenti del settore.",
  
  "lessonLearned": "Il successo imprenditoriale non dipende dal capitale iniziale o dalle connessioni, ma dalla capacità di imparare velocemente e adattarsi. Ogni fallimento è stato una lezione travestita. La cosa più importante che ho imparato: costruire un business sostenibile richiede tempo, pazienza e una visione chiara che motiva te e il tuo team ogni giorno."
}
```

---

### 4️⃣ Obiettivi e Posizionamento (Goals and Positioning)

This section clarifies the book's strategic goals and unique value proposition.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Obiettivi del Libro | Textarea | ✅ Yes | Why write this book |
| Proposta di Valore Unica | Textarea | ✅ Yes | What makes this story unique |

**Common Book Goals**:
- 🎯 **Autorevolezza** - Establish thought leadership
- 📈 **Lead Generation** - Attract clients/customers
- 💼 **Personal Branding** - Build personal brand
- 🏆 **Legacy** - Leave a lasting impact
- 🎓 **Educazione** - Teach and mentor others
- 🤝 **Network Building** - Connect with peers and mentors

**Example Data**:
```json
{
  "businessGoals": "Voglio posizionarmi come esperto di scaling per startup tech in Italia. Il libro serve a: 1) Generare lead qualificati per il mio programma di mentorship, 2) Essere invitato come speaker a conferenze, 3) Creare autorevolezza per futuri round di investimento",
  
  "uniqueValue": "La mia storia è unica perché sono partito letteralmente da zero - nessun background tech, nessun capitale, città di provincia. Eppure ho scalato velocemente usando strategie non convenzionali che ho testato personalmente. Inoltre, ho documentato tutto il processo con dati reali, non solo aneddoti."
}
```

---

### 5️⃣ Dettagli Progetto (Project Details)

Optional technical details about the project scope.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Pagine Stimate | Number | ❌ No | Estimated page count (50-1000) |
| Note Aggiuntive | Textarea | ❌ No | Any other relevant information |

**Example Data**:
```json
{
  "estimatedPages": 250,
  "additionalNotes": "Ho già scritto alcuni articoli sul mio blog che potrebbero essere usati come base. Preferisco uno stile diretto e pratico, con molti esempi concreti. Disponibile per 2-3 sessioni di intervista al mese."
}
```

---

## 🎨 UI/UX Features

### Visual Organization

Each section is clearly separated with:
- **Icon** - Visual identifier (User, BookOpen, TrendingUp, Target, AlertCircle)
- **Title** - Section name
- **Colored Icon** - Blue, Purple, Green, Orange, Indigo
- **Border Bottom** - Visual separator

### Form Fields

**Input Styling**:
```
- Full width
- 3px horizontal padding, 2px vertical padding
- Border: gray-300
- Rounded corners (lg)
- Focus: Blue ring, transparent border
- Placeholder text with examples
```

**Required Fields**:
- Red asterisk (*) next to label
- HTML5 `required` attribute
- Browser validation on submit

**Textareas**:
- Multi-line input for detailed responses
- Row count: 2-3 rows
- Expandable as user types

### Responsive Design

**Grid Layout**:
```
Mobile (default): 1 column
Medium screens: 2 columns for author info
Large screens: Maintained layout with better spacing
```

**Modal Sizing**:
- Size: `xl` (max-width: 4xl / ~896px)
- Scrollable content area
- Fixed header with title and close button

---

## 🔄 Form Submission Flow

```
1. User clicks "Nuovo Progetto" button on Dashboard
   ↓
2. Modal opens with empty form
   ↓
3. User fills out form sections
   ↓
4. Browser validates required fields on submit
   ↓
5. Form data collected in ProjectFormData object
   ↓
6. onSubmitAction callback fired with data
   ↓
7. Parent component processes data (save to DB, etc.)
   ↓
8. Modal closes
   ↓
9. User navigated to /progetti page
```

---

## 💾 Data Structure

### Complete ProjectFormData Interface

```typescript
interface ProjectFormData {
  // Informazioni Cliente/Autore
  authorName: string;
  authorRole: string;
  company: string;
  industry: string;
  
  // Informazioni Progetto
  bookTitle: string;
  bookSubtitle?: string;
  targetAudience: string;
  
  // Struttura Narrativa (Hero's Journey Business)
  currentSituation: string;
  challengeFaced: string;
  transformation: string;
  achievement: string;
  lessonLearned: string;
  
  // Dettagli Business
  businessGoals: string;
  targetReaders: string;
  uniqueValue: string;
  
  // Informazioni Tecniche
  estimatedPages?: number;
  
  // Note
  additionalNotes?: string;
}
```

### Complete Example Submission

```json
{
  "authorName": "Giulia Verdi",
  "authorRole": "Founder/Co-founder",
  "company": "GreenTech Solutions",
  "industry": "Sustainable Energy",
  "bookTitle": "Energia Pulita, Futuro Concreto",
  "bookSubtitle": "Come abbiamo rivoluzionato il mercato dell'energia rinnovabile in Italia",
  "targetAudience": "Imprenditori nel settore green, policy makers, investitori sostenibili",
  "currentSituation": "Ingegnere ambientale frustrata dal ritmo lento dell'innovazione nel settore pubblico. Volevo fare la differenza ma mi sentivo bloccata dalla burocrazia.",
  "challengeFaced": "Il mercato dell'energia in Italia è dominato da pochi grandi player. Come startup dovevamo competere con budget 100x inferiori. Inoltre, la regolamentazione è complessa e gli incentivi cambiano continuamente.",
  "transformation": "Ho imparato che la tecnologia da sola non basta - devi capire la politica energetica, costruire partnership strategiche, e comunicare in modo semplice concetti complessi. Sono passata da ingegnere a CEO, da tecnico a comunicatore.",
  "achievement": "2000 installazioni in 18 mesi, partnership con 5 comuni italiani, 8 milioni di euro di fatturato nel secondo anno. Riconosciuta tra le top 10 startup green europee da TechCrunch.",
  "lessonLearned": "L'impatto sostenibile richiede un modello di business sostenibile. Non puoi cambiare il mondo se la tua azienda fallisce. La vera innovazione è rendere il bene accessibile ed economicamente vantaggioso per tutti.",
  "businessGoals": "Posizionarmi come voice leader nel settore green energy italiano, attrarre investitori internazionali, ispirare altre donne STEM a fare impresa",
  "targetReaders": "Aspiranti imprenditori nel settore sostenibilità, donne ingegnere, investitori ESG",
  "uniqueValue": "Prima donna founder nel settore energy tech in Italia ad aver scalato oltre i 5M di fatturato. Storia autentica con dati verificabili e metodologia replicabile.",
  "estimatedPages": 220,
  "additionalNotes": "Ho un archivio di pitch deck, business plan e dati di crescita da includere come appendice. Vorrei un capitolo dedicato alle sfide specifiche delle donne founder in settori dominati da uomini."
}
```

---

## 🛠️ Integration Guide

### Using the Modal in a Page

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewProjectModal, { ProjectFormData } from '@/components/NewProjectModal';

export default function YourPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (projectData: ProjectFormData) => {
    try {
      // Save to database
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      
      const savedProject = await response.json();
      
      // Close modal
      setIsModalOpen(false);
      
      // Navigate to project detail
      router.push(`/progetti/${savedProject.id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      // Show error message to user
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Nuovo Progetto
      </button>

      <NewProjectModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
        onSubmitAction={handleSubmit}
      />
    </>
  );
}
```

---

## 📊 Validation Rules

### Required Fields (13 total)
1. authorName
2. authorRole
3. company
4. industry
5. bookTitle
6. targetReaders
7. currentSituation
8. challengeFaced
9. transformation
10. achievement
11. lessonLearned
12. businessGoals
13. uniqueValue

### Optional Fields (3 total)
1. bookSubtitle
2. estimatedPages (50-1000 range)
3. additionalNotes

### HTML5 Validation
- All required fields use `required` attribute
- Email fields use `type="email"` (if added)
- Number fields use `type="number"` with min/max
- Browser shows native validation errors

### Future Enhancements
- Custom error messages
- Real-time validation feedback
- Character count for textareas
- Save as draft functionality
- Multi-step wizard instead of single form

---

## 🎯 Best Practices for Filling Out

### For Ghost Writers / Project Managers

**During Client Interview**:
1. Start with Section 1 (easy factual information)
2. Spend most time on Section 3 (the narrative core)
3. Use follow-up questions to dig deeper:
   - "Can you give me a specific example?"
   - "What were you feeling at that moment?"
   - "What did you learn from that failure?"
4. Take detailed notes in Additional Notes

**Quality Criteria**:
- ✅ Specific, concrete details (not generic statements)
- ✅ Emotional authenticity (real feelings, vulnerabilities)
- ✅ Measurable results (numbers, metrics, timelines)
- ✅ Clear narrative arc (beginning → middle → end)
- ❌ Avoid clichés ("think outside the box", "give 110%")
- ❌ Don't oversell (unrealistic claims damage credibility)

---

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall application architecture
- [COMPONENTS.md](./COMPONENTS.md) - All component documentation
- [README.md](../README.md) - Project setup and overview

---

**Last Updated**: October 9, 2025
