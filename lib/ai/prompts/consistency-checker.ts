/**
 * Prompt per quick consistency check (dopo ogni capitolo)
 */
export function generateQuickCheckPrompt(
    newChapter: string,
    previousChapter: string,
    chapterNumber: number
): string {
    return `Sei un editor esperto. Esegui un QUICK CHECK per verificare coerenza tra due capitoli consecutivi.

**IMPORTANTE**: Segnala SOLO errori GRAVI che richiedono rigenerazione immediata.

---

# CAPITOLO ${chapterNumber - 1} (PRECEDENTE)

${previousChapter}

---

# CAPITOLO ${chapterNumber} (NUOVO - DA VERIFICARE)

${newChapter}

---

# VERIFICA

Controlla SOLO questi aspetti critici:

1. **Contraddizioni fattuali**: Numeri, date, nomi, fatti che contraddicono il capitolo precedente
2. **Cambio drastico di tono/stile**: Il capitolo sembra scritto da una persona completamente diversa?
3. **Ripetizione identica**: Stesso aneddoto o concetto ripetuto parola per parola
4. **Incoerenza narrativa grave**: Il capitolo non si collega affatto al precedente (come se partisse da zero)

**NON segnalare**:
- Piccole variazioni stilistiche naturali
- Ripetizioni di temi (è normale ribadire concetti chiave)
- Differenze di lunghezza o struttura

---

# OUTPUT FORMAT

Rispondi con un JSON valido:

\`\`\`json
{
  "hasCriticalIssues": true/false,
  "issues": [
    {
      "type": "contradiction" | "style_shift" | "repetition" | "narrative_break",
      "severity": "high",
      "description": "Descrizione chiara del problema",
      "suggestion": "Come fixarlo"
    }
  ]
}
\`\`\`

Se non ci sono problemi gravi, ritorna:
\`\`\`json
{
  "hasCriticalIssues": false,
  "issues": []
}
\`\`\`

Sii rigoroso ma giusto. Segnala solo problemi che davvero compromettono la qualità.`;
}

/**
 * Prompt per consistency check finale (tutto il libro)
 */
export function generateFinalCheckPrompt(
    chapters: Array<{ number: number; title: string; content: string }>,
    outline: any
): string {
    return `Sei un editor esperto di libri business. Analizza questo libro completo e crea un report di consistency professionale.

---

# OUTLINE ORIGINALE

${JSON.stringify(outline, null, 2)}

---

# LIBRO COMPLETO (${chapters.length} CAPITOLI)

${chapters.map(ch => `
${'='.repeat(60)}
CAPITOLO ${ch.number}: ${ch.title}
${'='.repeat(60)}

${ch.content}

`).join('\n')}

---

# ANALISI RICHIESTA

Valuta il libro su questi aspetti:

## 1. COERENZA NARRATIVA (0-100)
- L'arco narrativo è completo e soddisfacente?
- Il viaggio dell'eroe è ben sviluppato?
- Le transizioni tra capitoli sono fluide?
- La progressione è logica e coinvolgente?

## 2. COERENZA STILISTICA (0-100)
- Il tono è uniforme in tutto il libro?
- Lo stile di scrittura è consistente?
- Il POV e i tempi verbali sono coerenti?
- Le strutture narrative si ripetono efficacemente?

## 3. COERENZA FATTUALE (0-100)
- Non ci sono contraddizioni di fatti, numeri, date?
- I personaggi e le aziende sono nominati coerentemente?
- Le metriche e i dati sono consistenti?
- Le timeline sono coerenti?

## 4. COMPLETEZZA TEMI (0-100)
- Tutti i temi promessi nell'outline sono trattati?
- I concetti chiave sono sviluppati adeguatamente?
- Non ci sono thread narrativi lasciati aperti?
- La conclusione riprende l'introduzione?

## 5. QUALITÀ GENERALE (0-100)
- Il libro raggiunge i suoi obiettivi?
- È adatto al target di lettori?
- Il messaggio dell'autore è chiaro?
- Vale la pena pubblicarlo?

---

# OUTPUT FORMAT

Rispondi con un JSON valido e dettagliato:

\`\`\`json
{
  "overallScore": 0-100,
  "narrative": {
    "score": 0-100,
    "issues": [
      {
        "type": "narrative",
        "severity": "high" | "medium" | "low",
        "chapter": numero_capitolo,
        "description": "Descrizione problema",
        "suggestion": "Come migliorare"
      }
    ]
  },
  "style": {
    "score": 0-100,
    "issues": [
      {
        "type": "style_shift" | "tone_change",
        "severity": "high" | "medium" | "low",
        "chapter": numero_capitolo,
        "description": "Descrizione problema",
        "suggestion": "Come migliorare"
      }
    ]
  },
  "consistency": {
    "score": 0-100,
    "issues": [
      {
        "type": "contradiction" | "factual_error" | "repetition",
        "severity": "high" | "medium" | "low",
        "chapter": numero_capitolo,
        "description": "Descrizione problema",
        "suggestion": "Come migliorare"
      }
    ]
  },
  "recommendations": [
    "Raccomandazione generale 1",
    "Raccomandazione generale 2",
    "Raccomandazione generale 3"
  ]
}
\`\`\`

Sii professionale, costruttivo e specifico. Questo report aiuterà l'autore a perfezionare il libro prima della pubblicazione.`;
}
