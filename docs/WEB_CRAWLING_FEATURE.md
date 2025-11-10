# Web Crawling Multi-Livello

## Panoramica

La funzionalità di **Crawling Intelligente Multi-Livello** permette di estrarre automaticamente contenuti da più pagine di un sito web, seguendo i link interni fino a una profondità specificata.

## Come Funziona

### 1. Input dell'Utente
L'utente inserisce l'URL homepage del sito e attiva il crawling con questi parametri:
- **Profondità** (1-3 livelli): quanti "click" di distanza dalla homepage esplorare
- **Max Pagine** (5-50): numero massimo di pagine da analizzare

### 2. Processo di Crawling

#### Fase 1: Estrazione Link
- Analizza la homepage e estrae tutti i link interni (stesso dominio)
- Filtra automaticamente:
  - File binari (PDF, immagini, ZIP, ecc.)
  - Pagine di login/logout
  - Pagine amministrative
  - Cart/checkout
  - Link con solo hash (#)

#### Fase 2: Navigazione Multi-Livello
```
Livello 0: Homepage
    ├─ Livello 1: Link dalla homepage
    │   ├─ Livello 2: Link dalle pagine di livello 1
    │   └─ ...
    └─ ...
```

#### Fase 3: Estrazione Contenuto
Per ogni pagina visitata:
- Estrae il contenuto testuale principale
- Rimuove navigazione, footer, sidebar, ads
- Conta le parole
- Salva metadati (titolo, URL, descrizione)

#### Fase 4: Aggregazione Intelligente
- **Ordinamento per importanza**: le pagine con più contenuto sono considerate più importanti
- **Limite intelligente**: combina fino a 20.000 parole totali
- **Minimo garantito**: include sempre almeno le prime 3 pagine anche se superano il limite
- **Struttura chiara**: separa le pagine con intestazioni e divisori

### 3. Output Finale

Il contenuto aggregato viene formattato così:
```
=== Pagina 1: Chi siamo ===
URL: https://example.com/about
Parole: 856

[contenuto della pagina]

─────────────────────────────────────

=== Pagina 2: Storia ===
URL: https://example.com/storia
Parole: 642

[contenuto della pagina]
```

## Vantaggi

### vs. Solo Homepage
- ✅ **Contenuto 10-20x più ricco**: da 600 a 6000+ parole
- ✅ **Contesto completo**: storia, valori, servizi, team
- ✅ **Style guide più accurato**: analizza più esempi di scrittura
- ✅ **Metadati più completi**: più informazioni sull'azienda/autore

### vs. Multi-URL Manuale
- ✅ **Automatico**: non serve specificare ogni URL
- ✅ **Scopre pagine nascoste**: trova pagine non linkate nel menu principale
- ✅ **Più veloce**: non serve cercare manualmente gli URL giusti

## Limiti di Sicurezza

### Rispetto per i Server
- **Delay tra richieste**: 500ms di pausa tra ogni pagina
- **User-Agent identificabile**: si presenta come un bot legittimo
- **Timeout**: 15 secondi max per pagina
- **Max pagine hard-coded**: 50 pagine massimo (anche se l'utente chiede di più)

### Filtri Anti-Spam
- Esclude pagine duplicate (stesso URL)
- Esclude pagine senza contenuto (<100 caratteri)
- Esclude errori HTTP
- Esclude pagine non-HTML

### Gestione Errori
- Continua anche se alcune pagine falliscono
- Registra gli errori nel log ma non blocca il processo
- Restituisce errore solo se TUTTE le pagine falliscono

## Configurazione Consigliata

### Per Siti Piccoli (5-20 pagine)
- **Profondità**: 3 livelli
- **Max Pagine**: 20
- **Tempo stimato**: 15-30 secondi

### Per Siti Medi (20-100 pagine)
- **Profondità**: 2 livelli (consigliato)
- **Max Pagine**: 30
- **Tempo stimato**: 20-40 secondi

### Per Siti Grandi (100+ pagine)
- **Profondità**: 2 livelli
- **Max Pagine**: 50
- **Tempo stimato**: 30-60 secondi

## Esempio di Log Console

```
🕷️ Starting crawl: https://www.youcanprint.it (depth: 2, max pages: 20)
📄 Crawling [0]: https://www.youcanprint.it
🔗 Found 28 internal links at depth 0
📄 Crawling [1]: https://www.youcanprint.it/chi-siamo
📄 Crawling [1]: https://www.youcanprint.it/servizi
📄 Crawling [1]: https://www.youcanprint.it/distribuzione
🔗 Found 15 internal links at depth 1
📄 Crawling [2]: https://www.youcanprint.it/servizi/editing
📄 Crawling [2]: https://www.youcanprint.it/servizi/copertina
⚠️ Skipping https://www.youcanprint.it/login: Excluded pattern
📊 Selected 12/15 pages for analysis (18456 words)
✅ Crawl complete: 15 pages crawled, 12 pages included, 18456 total words
```

## API Endpoint

### Request
```typescript
POST /api/projects/analyze-website
{
  "url": "https://example.com",
  "crawl": true,           // Abilita crawling
  "maxDepth": 2,           // Profondità (default: 2)
  "maxPages": 20           // Max pagine (default: 20)
}
```

### Response
```typescript
{
  "success": true,
  "projectData": { ... },
  "styleGuide": "...",
  "extractionInfo": {
    "url": "https://example.com",
    "wordCount": 18456,
    "title": "...",
    // ...
  }
}
```

## Testing

### Test Manuale
1. Apri l'app e clicca "Crea Progetto da Sito Web"
2. Inserisci: `https://www.youcanprint.it`
3. Attiva "🕷️ Crawling Intelligente Multi-Livello"
4. Imposta profondità: 2, max pagine: 20
5. Clicca "Analizza Sito"
6. Attendi 30-60 secondi
7. Verifica che il form sia popolato con dati molto più ricchi

### Confronto
Prova lo stesso URL con e senza crawling per vedere la differenza:
- **Senza crawling**: ~600-800 parole dalla homepage
- **Con crawling**: ~5000-15000 parole da 10-20 pagine

## Prossimi Miglioramenti

- [ ] Sitemap.xml parsing per link prioritari
- [ ] Intelligenza per identificare pagine "importanti" (About, Team, Storia)
- [ ] Cache dei risultati per evitare di crawlare lo stesso sito più volte
- [ ] Supporto per robots.txt
- [ ] Rate limiting più sofisticato per siti grandi
- [ ] Estrazione di immagini e metadata SEO

## Troubleshooting

### "Timeout: il sito non risponde"
- Il sito è lento o ha protezione anti-bot
- Soluzione: riduci max pagine o profondità

### "Contenuto troppo breve"
- Il sito ha poco testo o usa molto JavaScript
- Soluzione: usa multi-URL manuale invece del crawling

### Ci mette troppo tempo
- Troppi livelli o troppe pagine
- Soluzione: riduci a profondità 1-2 e max 10-15 pagine

### Non trova pagine importanti
- Le pagine sono linkate in modo complesso
- Soluzione: usa multi-URL manuale per specificare pagine precise
