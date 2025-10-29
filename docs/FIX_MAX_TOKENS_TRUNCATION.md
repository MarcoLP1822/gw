# Fix: Troncamento Capitoli GPT-5

## Problema
GPT-5 stava generando capitoli troppo lunghi che venivano troncati a causa di `maxOutputTokens` insufficienti. Questo causava:
- Errori "Unterminated string in JSON at position X"
- Status "incomplete" con reason "max_output_tokens"
- Timeout di Vercel dopo 300 secondi per retry multipli

## Soluzione Implementata

### 1. Aumentato Default MaxTokens
- **Vecchio default**: 4000 tokens
- **Nuovo default**: 20000 tokens

### 2. File Modificati

#### `prisma/schema.prisma`
- Cambiato default `maxTokens` da 4000 a 20000

#### `lib/ai/responses-api.ts`
- Default `maxOutputTokens` aumentato a 20000
- Retry incremento cambiato da x1.5 a x2 (più aggressivo)
- Limite massimo aumentato da 32k a **128k** (limite reale GPT-5)
- Numero di retry aumentato da 2 a 3

#### `lib/ai/services/chapter-generation.ts`
- Default fallback aumentato a 20000
- Tutti i riferimenti aggiornati

#### `lib/ai/config/defaults.ts`
- `DEFAULT_AI_CONFIG.maxTokens` aumentato a 20000

#### `components/AISettingsTab.tsx`
- Limite massimo UI: 16000 → **128000**
- Step incremento: 500 → 1000
- Default visualizzato: 4000 → 20000

### 3. Script di Migrazione
Creati due script per aggiornare i progetti esistenti:
- `scripts/update-max-tokens-20k.ts` (TypeScript)
- `scripts/update-max-tokens-to-20k.sql` (SQL)

Eseguito con successo su 3 progetti esistenti.

## Strategia di Retry

Con le nuove impostazioni:
1. **Primo tentativo**: 20000 tokens
2. **Secondo tentativo** (se troncato): 40000 tokens (x2)
3. **Terzo tentativo** (se troncato): 80000 tokens (x2)
4. **Quarto tentativo** (se troncato): 128000 tokens (x2, limite massimo GPT-5)

## Limiti Rimanenti

### Timeout Vercel
Il timeout di 300 secondi (5 minuti) di Vercel rimane un vincolo:
- **Free tier**: 300s (5 minuti)
- **Pro tier**: 900s (15 minuti)

Se una generazione supera questo limite, fallirà comunque. In tal caso:
- Ridurre la complessità del prompt
- Ridurre la lunghezza target del capitolo
- Considerare upgrade a Vercel Pro

## Test
✅ Aggiornati 3 progetti esistenti con successo
✅ Tutti i progetti ora hanno `maxTokens: 20000`
✅ UI aggiornata per accettare valori fino a **128000**

## Note Tecniche

### Perché 20000 tokens?
- Un capitolo tipico di 2000-3000 parole richiede circa 12000-16000 tokens
- 20000 tokens offre un margine di sicurezza
- Permette anche generazione di metadata e summary senza troncamenti

### Perché limite di 128000?
- È il limite massimo di output per GPT-5 secondo la [documentazione ufficiale](https://platform.openai.com/docs/models/gpt-5)
- Oltre non è possibile andare con l'API attuale

### Costo Tokens
Con reasoning tokens, un capitolo può usare:
- Input: ~16000 tokens (contesto)
- Output: ~15000 tokens (capitolo)
- Reasoning: ~1500 tokens (GPT-5 medium)
- **Totale**: ~32500 tokens per capitolo

Il costo rimane gestibile dato che sono ~$0.65 per capitolo con GPT-5.
