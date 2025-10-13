-- Script SQL per aggiornare il modello AI in tutti i progetti
-- Esegui questo in Prisma Studio o tramite query diretta al database

-- 1. Aggiorna tutte le configurazioni AI dei progetti
UPDATE "ProjectAIConfig" 
SET 
  model = 'gpt-5-mini-2025-08-07',
  "updatedAt" = NOW()
WHERE 
  model != 'gpt-5-mini-2025-08-07';

-- 2. Verifica le modifiche
SELECT 
  id,
  "projectId",
  model,
  temperature,
  "maxTokens",
  "updatedAt"
FROM "ProjectAIConfig"
ORDER BY "updatedAt" DESC;

-- 3. Opzionale: Vedi quanti progetti sono stati aggiornati
SELECT 
  model,
  COUNT(*) as count
FROM "ProjectAIConfig"
GROUP BY model;
