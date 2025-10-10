import { ProjectFormData } from '@/types';

/**
 * Genera il prompt per la creazione dell'outline del libro
 * basato sui dati del progetto forniti dall'utente
 */
export function generateOutlinePrompt(project: ProjectFormData): string {
    return `Sei un esperto editor e consulente per l'autopubblicazione di libri di business e crescita personale.

Il tuo compito è creare un outline dettagliato per un libro basato sulle seguenti informazioni:

## INFORMAZIONI AUTORE
- Nome: ${project.authorName}
- Ruolo: ${project.authorRole}
- Azienda: ${project.company}
- Settore: ${project.industry}
- Lettori ideali: ${project.targetReaders}
- Valore unico: ${project.uniqueValue}

## LIBRO
- Titolo: ${project.bookTitle}
${project.bookSubtitle ? `- Sottotitolo: ${project.bookSubtitle}` : ''}
${project.estimatedPages ? `- Pagine stimate: ${project.estimatedPages}` : ''}

## VIAGGIO DELL'EROE (Business)
- Situazione iniziale (Mondo ordinario): ${project.currentSituation}
- Sfida affrontata (Chiamata): ${project.challengeFaced}
- Trasformazione (Viaggio): ${project.transformation}
- Risultato ottenuto (Vittoria): ${project.achievement}
- Lezione appresa (Elisir): ${project.lessonLearned}

## OBIETTIVI BUSINESS
- Obiettivi del libro: ${project.businessGoals}
${project.additionalNotes ? `- Note aggiuntive: ${project.additionalNotes}` : ''}

---

Crea un outline strutturato per un libro di crescita personale con:
- Titolo del libro (creativo e attraente per il target)
- Sottotitolo (che spieghi il beneficio chiave)
- Numero di capitoli: tra 10 e 15 capitoli
- Per ogni capitolo:
  * Titolo del capitolo
  * Breve descrizione (2-3 frasi) del contenuto
  * Punti chiave da trattare (3-5 bullet points)
  * Connessione con il viaggio dell'eroe (quale fase rappresenta)

Il tono deve essere: motivazionale, pratico, empatico e orientato all'azione.

IMPORTANTE: Rispondi SOLO con un oggetto JSON valido nel seguente formato:

{
  "title": "Titolo del Libro",
  "subtitle": "Sottotitolo che spiega il beneficio",
  "description": "Breve descrizione del libro (2-3 paragrafi)",
  "chapters": [
    {
      "number": 1,
      "title": "Titolo Capitolo",
      "description": "Descrizione del capitolo",
      "keyPoints": ["Punto 1", "Punto 2", "Punto 3"],
      "heroJourneyPhase": "Fase del viaggio dell'eroe"
    }
  ]
}

Non aggiungere commenti, spiegazioni o testo al di fuori del JSON. Rispondi SOLO con JSON valido.`;
}

/**
 * Prompt di sistema per guidare il comportamento dell'AI
 */
export const SYSTEM_PROMPT = `Sei un esperto editor specializzato in libri di crescita personale e sviluppo professionale.
Il tuo compito è creare outline dettagliati per libri che seguono la struttura del Viaggio dell'Eroe di Joseph Campbell.
Devi essere creativo, pratico e sempre orientato a fornire valore reale al lettore.
Rispondi SEMPRE e SOLO con JSON valido, senza markdown, commenti o testo aggiuntivo.`;
