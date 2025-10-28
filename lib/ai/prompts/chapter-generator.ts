import { ChapterContext } from '@/types';

/**
 * Determina lo stile di apertura obbligatorio per un capitolo
 */
function getChapterOpeningStyle(chapterNumber: number): string {
  const styles = [
    "AZIONE DIRETTA - Inizia descrivendo un'azione concreta che stavi compiendo",
    "DIALOGO - Inizia con una conversazione specifica che hai avuto con qualcuno",
    "RIFLESSIONE - Inizia con una realizzazione o momento di insight improvviso",
    "SCENA SPECIFICA - Descrivi dettagliatamente un luogo preciso dove ti trovavi",
    "CONTRASTO - Inizia evidenziando una differenza rispetto al passato",
    "DOMANDA - Inizia con una domanda che ti sei posto in un momento specifico",
    "DATO SORPRENDENTE - Inizia con un numero o statistica che ti ha colpito",
    "CITAZIONE - Inizia con parole precise di qualcun altro che ti hanno influenzato"
  ];

  return styles[(chapterNumber - 1) % styles.length];
}

/**
 * System prompt per la generazione dei capitoli
 */
export const CHAPTER_SYSTEM_PROMPT = `Sei un ghost writer professionista esperto in libri business e autobiografici per imprenditori di successo.

Il tuo compito è scrivere capitoli che si leggono come storie avvincenti, non come manuali tecnici.

EQUILIBRIO: 80% narrazione immersiva / 20% framework pratici

PRIORITÀ ASSOLUTA:
- Scene estese e dettagliate (400-600 parole per scena importante)
- Dialoghi completi e realistici
- Dettagli sensoriali e concreti (odori, suoni, sensazioni fisiche)
- Progressione emotiva del protagonista
- Conflitti, dubbi, resistenze mostrati attraverso azioni

ELEMENTI PRATICI (massimo 20%):
- Massimo 1-2 elenchi puntati per capitolo
- Framework/metodi integrati narrativamente nella storia
- Insegnamenti emergono dalle esperienze, non le interrompono

Scrivi sempre in PRIMA PERSONA come se fossi l'autore del libro.
Mantieni un tono che fa dimenticare al lettore di stare "imparando" - deve sentirsi dentro una storia vera.`;


/**
 * Genera il prompt per un capitolo specifico
 */
export function generateChapterPrompt(context: ChapterContext): string {
  const { project, outline, styleGuide, masterContext, chapters, currentChapterInfo } = context;

  let prompt = `# CONTESTO PROGETTO

## Autore
- Nome: ${project.authorName}
- Ruolo: ${project.authorRole}
- Azienda: ${project.company}
- Settore: ${project.industry}

## Libro
Titolo: "${project.bookTitle}"
${project.bookSubtitle ? `Sottotitolo: "${project.bookSubtitle}"` : ''}
Target Lettori: ${project.targetReaders}

## Background Autore (da incorporare nella scrittura)
- Situazione di partenza: ${project.currentSituation}
- Sfida affrontata: ${project.challengeFaced}
- Trasformazione: ${project.transformation}
- Risultati ottenuti: ${project.achievement}
- Lezione chiave: ${project.lessonLearned}
- Valore unico: ${project.uniqueValue}

## Obiettivi Business
${project.businessGoals}

---

# OUTLINE COMPLETO DEL LIBRO

${outline.chapters.map((ch, idx) => `
**Capitolo ${ch.number}: ${ch.title}**
- Descrizione: ${ch.description}
- Punti chiave: ${ch.keyPoints.join(', ')}
- Fase Hero's Journey: ${ch.heroJourneyPhase}
`).join('\n')}

---

`;

  // Style Guide (se disponibile)
  if (styleGuide) {
    if (typeof styleGuide === 'string') {
      // Nuovo formato: testo libero
      prompt += `# STYLE GUIDE

**IMPORTANTE**: Mantieni rigorosamente questo stile in tutto il capitolo.

${styleGuide}

---

`;
    } else {
      // Vecchio formato: JSON strutturato (backward compatibility)
      prompt += `# STYLE GUIDE

**IMPORTANTE**: Mantieni rigorosamente questo stile in tutto il capitolo.

- **Tono**: ${styleGuide.tone}
- **POV**: ${styleGuide.pov}
- **Tempo verbale**: ${styleGuide.tense}
- **Lunghezza frasi**: ${styleGuide.sentenceLength}
- **Struttura paragrafi**: ${styleGuide.paragraphStructure}
- **Vocabolario**: ${styleGuide.vocabularyLevel}

**Pattern narrativi da seguire:**
${styleGuide.storytelling.map(p => `- ${p}`).join('\n')}

**Frasi ricorrenti da usare:**
${styleGuide.recurringPhrases.map(p => `- "${p}"`).join('\n')}

${styleGuide.metaphors.length > 0 ? `
**Metafore/analogie usate nel libro:**
${styleGuide.metaphors.map(m => `- ${m}`).join('\n')}
` : ''}

---

`;
    }
  }

  // Master Context (personaggi, termini, numeri)
  if (masterContext && Object.keys(masterContext).length > 0) {
    prompt += `# MASTER CONTEXT (Coerenza)

**IMPORTANTE**: Usa questi riferimenti per mantenere coerenza.

`;

    if (masterContext.characters && masterContext.characters.length > 0) {
      prompt += `**Personaggi/Figure già introdotte:**
${masterContext.characters.map(c => `- ${c}`).join('\n')}

`;
    }

    if (masterContext.terms && Object.keys(masterContext.terms).length > 0) {
      prompt += `**Termini/Concetti già spiegati:**
${Object.entries(masterContext.terms).map(([term, def]) => `- **${term}**: ${def}`).join('\n')}

`;
    }

    if (masterContext.numbers && Object.keys(masterContext.numbers).length > 0) {
      prompt += `**Numeri/Metriche già stabiliti:**
${Object.entries(masterContext.numbers).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

`;
    }

    prompt += `---

`;
  }

  // Capitoli precedenti
  if (chapters.first && currentChapterInfo.number > 1) {
    prompt += `# CAPITOLO 1 - KEY POINTS

${chapters.first}

Questo è il setup iniziale del libro. Mantieni coerenza con questi punti.

---

`;
  }

  if (chapters.beforePrevious) {
    prompt += `# CAPITOLO ${currentChapterInfo.number - 2} - SUMMARY

${chapters.beforePrevious}

---

`;
  }

  if (chapters.previous) {
    prompt += `# CAPITOLO PRECEDENTE (${currentChapterInfo.number - 1}) - FULL TEXT

**IMPORTANTE**: Crea continuità narrativa con questo capitolo. Il lettore ha appena finito di leggerlo.

${chapters.previous}

---

`;
  }

  // Il capitolo da scrivere
  prompt += `# QUESTO CAPITOLO DA SCRIVERE

**Capitolo ${currentChapterInfo.number}: ${currentChapterInfo.title}**

**Descrizione/Obiettivo:**
${currentChapterInfo.description}

**Punti chiave da trattare:**
${currentChapterInfo.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

**Fase Hero's Journey:** ${currentChapterInfo.heroJourneyPhase}

**Lunghezza target:** 2,000-3,000 parole

---

# ISTRUZIONI DI SCRITTURA

## ⚠️ EVITA RIPETIZIONI NEGLI INIZI! 

**PATTERN GIÀ USATI NEI CAPITOLI PRECEDENTI** (NON RIPETERE):
${chapters.previous ? `- Capitolo ${currentChapterInfo.number - 1}: "${chapters.previous.substring(0, 50).split('.')[0]}..."` : ''}
${chapters.beforePrevious ? `- Capitolo ${currentChapterInfo.number - 2}: "${chapters.beforePrevious.substring(0, 50).split('.')[0]}..."` : ''}

**STILE OBBLIGATORIO PER QUESTO CAPITOLO** (Capitolo ${currentChapterInfo.number}):
${getChapterOpeningStyle(currentChapterInfo.number)}

**ESEMPI DI APERTURE DIVERSE:**
- **Azione**: "Stavo cercando di aprire quella dannata presentazione quando..."
- **Dialogo**: "'Non funzionerà mai', mi disse il mio collega..."
- **Riflessione**: "Fu in quel momento che capii qualcosa di fondamentale..."
- **Scena**: "L'ufficio era silenzioso, erano le 6 del mattino..."
- **Contrasto**: "A differenza dei miei primi tentativi fallimentari..."
- **Dato**: "Il 73% delle startup fallisce per lo stesso motivo che..."

---

## 🎯 EQUILIBRIO NARRAZIONE/METODO: 80% / 20%

**REGOLA D'ORO**: Questo è un libro che si legge come una storia, non come un manuale.

### ✅ PRIORITÀ ASSOLUTA: NARRAZIONE (80% del capitolo)

1. **Scene estese e immersive** (non frammenti)
   - Dedica almeno 400-600 parole a una singola scena importante
   - Includi dialoghi completi (non solo battute isolate)
   - Descrivi luoghi, momenti, sensazioni fisiche
   - Mostra l'evoluzione emotiva attraverso azioni concrete

2. **Dettagli sensoriali e concreti**
   - Come suonava quella voce al telefono
   - L'odore dell'ufficio quella mattina
   - La sensazione fisica della stanchezza/eccitazione
   - Oggetti specifici, orari precisi, nomi reali

3. **Progressione narrativa fluida**
   - Ogni paragrafo nasce dal precedente
   - Le transizioni sono naturali, mai meccaniche
   - Il lettore deve dimenticarsi di stare "imparando qualcosa"
   - La storia procede con un suo ritmo interno

4. **Dialoghi veri e completi**
   - Non: «Mi disse di provare»
   - Sì: «"Ascolta," mi disse appoggiandosi allo schienale, "so che hai paura di fallire di nuovo. Ma se non provi adesso, tra un anno sarai ancora qui a farti le stesse domande."»

5. **Conflitto e tensione**
   - Mostra i dubbi, gli errori, le resistenze
   - Non nascondere i momenti di difficoltà
   - Il lettore deve sentire il peso delle decisioni

### ⚙️ ELEMENTI PRATICI: Massimo 20% del capitolo

**LIMITE RIGIDO**: Massimo 1-2 elenchi puntati per capitolo, max 5-6 punti ciascuno.

**Usa gli elenchi SOLO per:**
- Un framework/metodo chiave (UNA VOLTA nel capitolo)
- Un riassunto operativo alla fine di una lunga sezione narrativa
- Mai per sostituire una scena o spiegazione narrativa

**COME integrare il pratico senza rompere il flusso:**

❌ **SBAGLIATO** (stile manuale):
\`\`\`
Per costruire un team efficace, ho seguito questi passaggi:
- Identificare i talenti chiave
- Creare una cultura condivisa
- Stabilire obiettivi misurabili
- Implementare feedback continui
\`\`\`

✅ **GIUSTO** (narrativo con metodo incorporato):
\`\`\`
Seduto nella sala riunioni vuota, con il marker in mano e la lavagna davanti, 
ho iniziato a scrivere. Non era un piano strategico, era più simile a una 
confessione. "Chi voglio davvero nel mio team?" La prima risposta fu istintiva: 
Laura, perché quando parla tutti ascoltano. Marco, perché vede problemi che 
io ignoro. Poi venne la domanda più difficile: "Cosa voglio che ci tenga insieme?"

Nel giro di un'ora avevo riempito quella lavagna. Non lo sapevo ancora, ma 
stavo creando quello che poi avrei chiamato il "Framework delle 4C": Competenza, 
Chimica, Commitment, Comunicazione. Ma quella mattina erano solo nomi, frecce, 
e una sensazione che finalmente stavo guardando nella direzione giusta.
\`\`\`

**STRUTTURA NARRATIVA (non schema rigido):**

Il capitolo deve **fluire come una storia**, con questi momenti intrecciati naturalmente:

1. **Apertura narrativa forte** (200-400 parole)
   - Scena concreta, dialogo, momento specifico
   - Nessuna introduzione generica o teorica

2. **Corpo principale: narrazione con insight incorporati** (1500-2000 parole)
   - Racconti estesi di situazioni vissute
   - Insegnamenti emergono dalle storie, non le interrompono
   - Eventuale framework presentato come scoperta personale
   - UN SOLO elenco puntato, se strettamente necessario

3. **Chiusura riflessiva** (300-400 parole)
   - Ritorno alla scena iniziale O apertura verso il futuro
   - Domanda o riflessione per il lettore
   - Transizione naturale al capitolo successivo

---

## 📝 REGOLE DI SCRITTURA

1. **Scrivi in PRIMA PERSONA** (come se fossi ${project.authorName})

2. **Mostra, non dire**
   - Non: "Ero nervoso"
   - Sì: "Le mani mi tremavano mentre aprivo la mail"

3. **Scene lunghe > frammenti brevi**
   - Dedica spazio alle scene importanti
   - 500-800 parole per una scena chiave non è troppo

4. **Evita frammentazione**
   - Non spezzare il racconto con box/citazioni ogni 200 parole
   - Lascia respirare la narrazione

5. **Mantieni il tono dello style guide**
   - Coerenza stilistica con i capitoli precedenti

6. **Crea continuità narrativa**
   - Riferimenti al capitolo precedente
   - Evoluzione dei personaggi/situazioni

7. **Usa sottosezioni (H2/H3) con parsimonia**
   - Solo quando cambia naturalmente la scena/momento
   - Non per spezzare artificialmente il testo

## 🚨 CONTROLLO FINALE ANTI-RIPETIZIONE

**PRIMA DI SCRIVERE**, verifica che il tuo inizio NON contenga:
- La parola "Quando" come prima parola
- Pattern temporali generici ("In quel momento", "Allora", "Poi")
- Strutture identiche ai capitoli precedenti

**INVECE**, usa lo stile obbligatorio assegnato sopra per rendere questo capitolo UNICO.

---

# OUTPUT FORMAT

Rispondi con un JSON nel seguente formato:

\`\`\`json
{
  "chapter": "CONTENUTO COMPLETO DEL CAPITOLO IN MARKDOWN",
  "metadata": {
    "newCharacters": ["Lista di nuovi personaggi/figure introdotti in questo capitolo"],
    "newTerms": {
      "termine1": "definizione breve",
      "termine2": "definizione breve"
    },
    "keyNumbers": {
      "metrica1": "valore",
      "metrica2": "valore"
    }
  },
  "summary": "Summary del capitolo in 300-500 parole che cattura i punti principali e la narrativa",
  "keyPoints": [
    "Punto chiave 1",
    "Punto chiave 2",
    "Punto chiave 3"
  ]
}
\`\`\`

**IMPORTANTE:**
- Il campo "chapter" deve contenere il CONTENUTO COMPLETO in Markdown
- **Usa # SOLO per il titolo del capitolo** (esempio: "# Il Mondo dei Rifiuti", NON "# Capitolo 1: Il Mondo dei Rifiuti")
- **NON scrivere "Capitolo X:" nel titolo** - sarà aggiunto automaticamente dal sistema
- Usa ## per le sottosezioni principali
- Usa ### per le sotto-sottosezioni
- Usa > per le citazioni/callout
- Usa **grassetto** per concetti chiave
- Usa liste puntate/numerate quando appropriato
- Il JSON deve essere valido e parsabile

---

Inizia ora a scrivere il Capitolo ${currentChapterInfo.number}: "${currentChapterInfo.title}"`;

  return prompt;
}

/**
 * Genera prompt per estrarre lo Style Guide dai primi capitoli
 */
export function generateStyleGuidePrompt(chapters: string[]): string {
  return `Analizza questi capitoli e crea uno Style Guide dettagliato che catturi lo stile di scrittura dell'autore.

${chapters.map((content, idx) => `
===========================================
CAPITOLO ${idx + 1}
===========================================

${content}

`).join('\n')}

---

# TASK

Analizza i capitoli sopra ed estrai:

1. **Tono emotivo prevalente** (es: "ispirazionale ma pragmatico", "riflessivo e intimo")
2. **POV e tempo verbale** (es: "Prima persona singolare, presente e passato prossimo")
3. **Struttura narrativa** (come inizia/sviluppa/chiude i capitoli)
4. **Lunghezza media frasi e paragrafi**
5. **Vocabolario e registro linguistico** (formale? colloquiale? tecnico?)
6. **Uso di domande retoriche, metafore, esempi**
7. **Pattern ricorrenti** (aperture, transizioni, chiusure)
8. **Call-to-action style**

---

# OUTPUT FORMAT

Rispondi con un JSON valido nel seguente formato:

\`\`\`json
{
  "tone": "descrizione del tono (1 frase)",
  "pov": "punto di vista e tempo verbale usati",
  "tense": "tempi verbali usati",
  "sentenceLength": "descrizione lunghezza frasi",
  "paragraphStructure": "descrizione struttura paragrafi",
  "vocabularyLevel": "descrizione del vocabolario",
  "storytelling": [
    "Pattern narrativo 1",
    "Pattern narrativo 2",
    "Pattern narrativo 3"
  ],
  "recurringPhrases": [
    "Frase ricorrente 1",
    "Frase ricorrente 2",
    "Frase ricorrente 3"
  ],
  "metaphors": [
    "Metafora/analogia 1",
    "Metafora/analogia 2"
  ]
}
\`\`\`

Analizza attentamente e sii preciso. Questo style guide verrà usato per mantenere coerenza in tutti i capitoli successivi.`;
}
