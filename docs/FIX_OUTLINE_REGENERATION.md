# Fix: Rigenerazione Outline ✅

**Data**: 10 Ottobre 2025  
**Problema**: Errore "Unique constraint failed on projectId" durante rigenerazione outline

---

## ❌ Problema Originale

Quando si cliccava "Rigenera" sul tab Outline, l'applicazione tentava di **creare** un nuovo outline con `prisma.outline.create()`, ma falliva perché:

```
Unique constraint failed on the fields: (`projectId`)
```

Il database ha un constraint `@unique` su `projectId` nella tabella `Outline`, quindi non può esistere più di un outline per progetto.

---

## ✅ Soluzione Implementata

### Prima (❌ Non Funzionava)

```typescript
const outline = await prisma.outline.create({
    data: {
        projectId,
        structure: generatedOutline,
        // ...
    },
});
```

**Problema**: Tentava sempre di creare, falliva se esisteva già.

### Dopo (✅ Funziona)

```typescript
const outline = await prisma.outline.upsert({
    where: { projectId },
    create: {
        projectId,
        structure: generatedOutline,
        totalChapters: generatedOutline.chapters.length,
        estimatedWords: generatedOutline.chapters.length * 2000,
        aiModel: DEFAULT_CONFIG.model,
    },
    update: {
        structure: generatedOutline,
        totalChapters: generatedOutline.chapters.length,
        estimatedWords: generatedOutline.chapters.length * 2000,
        aiModel: DEFAULT_CONFIG.model,
        generatedAt: new Date(), // Aggiorna timestamp
    },
});
```

**Vantaggi**:
- ✅ **Prima generazione**: Crea nuovo outline (usa `create`)
- ✅ **Rigenerazioni successive**: Aggiorna outline esistente (usa `update`)
- ✅ Usa sempre i dati più recenti del progetto
- ✅ Nessun errore di constraint
- ✅ Mantiene stesso ID outline
- ✅ Aggiorna timestamp `generatedAt`
- ✅ Numero illimitato di rigenerazioni

---

## 🔄 Comportamento

### Scenario 1: Prima Generazione

1. User clicca "Genera Outline con AI"
2. API chiama OpenAI
3. `upsert` non trova outline esistente per questo `projectId`
4. **Esegue `create`**: Crea nuovo outline
5. Salva nel database
6. Mostra outline nel tab

### Scenario 2: Qualsiasi Rigenerazione Successiva

1. User clicca "Rigenera" (per qualsiasi motivo: dati modificati, outline da migliorare, etc.)
2. API chiama OpenAI con i dati **attuali** del progetto
3. `upsert` trova outline esistente con stesso `projectId`
4. **Esegue `update`**: Sovrascrive l'outline esistente con quello nuovo
5. Mantiene stesso ID, aggiorna contenuto e timestamp `generatedAt`
6. Mostra nuovo outline nel tab

**Nota**: Non importa se hai modificato i dati del progetto o no, la rigenerazione usa **sempre** i dati più recenti.

---

## 🧪 Test

### Test 1: Prima Generazione
1. Crea un nuovo progetto
2. Vai al tab "Outline"
3. Clicca "Genera Outline con AI"
4. ✅ Outline viene creato con successo

### Test 2: Rigenerazione Semplice
1. Con un progetto che ha già un outline
2. Clicca "Rigenera" (senza modificare nulla)
3. ✅ Genera un nuovo outline (l'AI può dare risultati diversi)
4. ✅ Nessun errore di constraint

### Test 3: Modifica Dati + Rigenerazione
1. Clicca "Modifica" sul progetto
2. Cambia alcuni dati (es. "Sfida Affrontata", "Obiettivi Business")
3. Salva le modifiche
4. Vai al tab "Outline"
5. Clicca "Rigenera"
6. ✅ Nuovo outline riflette i dati aggiornati
7. ✅ Nessun errore di constraint

### Test 4: Rigenerazioni Multiple
1. Clicca "Rigenera" 5-10 volte di seguito
2. ✅ Ogni rigenerazione funziona senza errori
3. ✅ Ogni volta ottieni un outline potenzialmente diverso (l'AI può variare)

### Test 5: Verifica Database
```sql
-- Controlla che esista UN SOLO outline per progetto
SELECT projectId, COUNT(*) as count
FROM Outline
GROUP BY projectId
HAVING COUNT(*) > 1;

-- Dovrebbe essere vuoto (nessun duplicato)
```

---

## 📝 File Modificato

**File**: `app/api/projects/[id]/generate-outline/route.ts`

**Modifica**: 
- Cambiato da `prisma.outline.create()` a `prisma.outline.upsert()`
- Aggiunta logica `create` e `update`
- Aggiornamento timestamp `generatedAt` in update

---

## 💡 Best Practice

### Upsert Pattern

Usa `upsert` quando:
- ✅ Hai un constraint unique sul campo
- ✅ Vuoi creare O aggiornare in base all'esistenza
- ✅ Non vuoi gestire manualmente check + create/update

### Alternative (Non Usate)

#### Opzione A: Check + Create/Update
```typescript
// ❌ Più verboso
const existing = await prisma.outline.findUnique({ where: { projectId } });
if (existing) {
    await prisma.outline.update({ where: { projectId }, data: {...} });
} else {
    await prisma.outline.create({ data: {...} });
}
```

#### Opzione B: Delete + Create
```typescript
// ❌ Perde ID e timestamp originali
await prisma.outline.delete({ where: { projectId } }).catch(() => {});
await prisma.outline.create({ data: {...} });
```

**Upsert è la soluzione migliore** ✅

---

## 🎯 Risultato

Ora l'utente può:
1. ✅ Generare outline la prima volta
2. ✅ Rigenerare outline tutte le volte che vuole (nessun limite)
3. ✅ Modificare i dati del progetto e rigenerare per riflettere le modifiche
4. ✅ L'outline usa sempre i dati più recenti del progetto
5. ✅ Nessun errore di database constraint

**Feature completa e funzionante!** 🚀

---

## 🔮 Future Enhancements

### Versioning degli Outline
Se in futuro si vuole mantenere storico:

```typescript
model OutlineVersion {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  version     Int
  structure   Json
  generatedAt DateTime @default(now())
  
  @@unique([projectId, version])
}
```

Permetterebbe:
- Confronto tra versioni diverse
- Rollback a versioni precedenti
- A/B testing outline
- History tracking

Ma per MVP, upsert è perfetto! ✅
