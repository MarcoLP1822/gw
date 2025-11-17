# Scripts Directory - Analysis and Maintenance Guide

**Last Updated:** November 17, 2025

## 📊 Script Analysis Summary

### ✅ Scripts da MANTENERE (Utili e Rilevanti)

#### Testing & Development
- `seed-test-data.ts` - Crea dati di test per sviluppo
- `test-crawling.ts` - Test funzionalità web crawling
- `test-db-connection.ts` - Verifica connessione database
- `test-error-handling.ts` - Test sistema gestione errori
- `test-ai-config.ts` - Test configurazione AI generica

#### Deployment & Verification
- `verify-deployment-ready.js` - Verifica prerequisiti deployment
- `update-changelog.js` - Aggiorna changelog automaticamente

### ❌ Scripts OBSOLETI (Da Rimuovere o Ignorare)

#### Scripts Specifici per Progetti Singoli
Questi script contengono project ID hardcoded (es. `cmgnslzeu0001fnyg48ifcnxs`) e sono specifici per progetti di test:

- `apply-mario-style-guide.ts` - Applicava style guide per progetto specifico
- `check-both-style-guides.ts` - Verificava style guide progetto specifico
- `check-chapters.ts` - Verificava capitoli progetto specifico
- `check-system-prompt.ts` - Verificava prompt progetto specifico
- `clear-wrong-style-guide.ts` - Pulizia style guide progetto specifico
- `show-style-guide.ts` - Mostrava style guide progetto specifico
- `read-consistency-report.js` - Leggeva report progetto specifico
- `test-api-endpoint.ts` - Testava endpoint con project ID hardcoded

**Motivo:** Questi erano script di debug/fix per situazioni specifiche che non si ripeteranno.

#### Scripts per Modelli AI Obsoleti
Questi gestivano la migrazione tra modelli AI che non sono più rilevanti:

- `fix-ai-model.sql` - Fix da gpt-5-mini-2025-08-07 a gpt-4o-mini
- `fix-model-to-gpt5-mini.sql` - Update a gpt-5-mini
- `migrate-to-gpt5.sql` - Migrazione a GPT-5
- `update-ai-model.sql` - Update a gpt-5-mini-2025-08-07
- `update-ai-configs.js` - Aggiornamento configurazioni a modello vecchio
- `verify-ai-model.js` - Verifica modello gpt-5-mini-2025-08-07
- `verify-ai-model-fix.js` - Verifica fix modello
- `verify-gpt5-mini.js` - Verifica gpt-5-mini
- `verify-gpt5-models.ts` - Info sui modelli GPT-5

**Motivo:** I modelli AI cambiano, questi fix erano per migrazioni già completate.

#### Scripts per Configurazioni Una-Tantum
Scripts che modificavano parametri in modo massivo (già eseguiti):

- `update-max-tokens.sql` - Aggiornava maxTokens a 16000
- `update-max-tokens.ts` - Aggiornava maxTokens a 16000
- `update-max-tokens-20k.ts` - Aggiornava maxTokens a 20000
- `update-max-tokens-to-20k.sql` - Aggiornava maxTokens a 20000
- `update-reasoning-effort-to-low.ts` - Cambiava reasoning effort
- `update-target-words-5000.ts` - Aggiornava target words

**Motivo:** Erano operazioni una-tantum già eseguite. Se servono di nuovo, meglio riscriverli.

#### Scripts di Fix UI Temporanei
- `fix-chapter-references.js` - Fixava references nel codice (già fatto)
- `fix-spacing.js` - Fixava spacing nel codice (già fatto)
- `fix-style-guide-conflicts.ts` - Risolveva conflitti (già fatto)
- `fix-project-status.ts` - Correggeva status progetti (già fatto)

**Motivo:** Fix one-time per problemi specifici già risolti.

## 🛠️ Raccomandazioni

### Azioni Immediate
1. ✅ **Aggiunto al `.gitignore`** - Gli script obsoleti sono ora ignorati da Git
2. 📝 **Non eliminare fisicamente** - Tenerli localmente come riferimento storico
3. 🔄 **Se serve rifarli** - È meglio riscrivere da zero con le esigenze attuali

### Best Practices Future

#### ✅ Script da Creare e Mantenere
- Script di test generici (non legati a project ID specifici)
- Script di utility riutilizzabili
- Script di deployment verification
- Script di seed data per test

#### ❌ Script da Evitare di Committare
- Script con project ID hardcoded
- Script di fix temporanei
- Script per configurazioni una-tantum
- Script di migrazione già eseguiti

### Come Scrivere Script Mantenibili

#### ✅ BENE
```typescript
// Chiede l'input o usa variabile ambiente
const projectId = process.env.PROJECT_ID || process.argv[2];
if (!projectId) {
  console.error('Usage: npm run script -- <project-id>');
  process.exit(1);
}
```

#### ❌ MALE
```typescript
// ID hardcoded
const projectId = 'cmgnslzeu0001fnyg48ifcnxs';
```

## 📋 Checklist Manutenzione Script

- [ ] Script ha nome descrittivo?
- [ ] Script è generico o specifico per un progetto?
- [ ] Script è ancora rilevante per il codice attuale?
- [ ] Script contiene ID o dati hardcoded?
- [ ] Script è documentato con commenti?
- [ ] Script gestisce errori correttamente?

## 🔍 Come Verificare se uno Script è Obsoleto

1. **Contiene project ID specifici?** → Probabilmente obsoleto
2. **Si riferisce a codice/modelli/feature non più presenti?** → Obsoleto
3. **È un fix one-time già applicato?** → Obsoleto
4. **È stato usato negli ultimi 3 mesi?** → Se no, probabilmente obsoleto
5. **Potrebbe essere riscritto in 10 minuti se servisse di nuovo?** → Obsoleto

---

## 📊 Statistiche

- **Totale script:** 34
- **Script utili da mantenere:** 7 (21%)
- **Script obsoleti/ignorati:** 27 (79%)

**Conclusione:** La maggior parte degli script erano fix temporanei o test specifici. Il progetto è ora più pulito con solo script generici e riutilizzabili tracciati in Git.
