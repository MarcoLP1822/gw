-- Aggiorna maxTokens a 16000 per tutti i progetti che usano gpt-5-mini
-- Questo risolve il problema del JSON troncato

UPDATE "AIConfig"
SET "maxTokens" = 16000
WHERE "model" LIKE 'gpt-5%'
  AND ("maxTokens" IS NULL OR "maxTokens" < 16000);

-- Verifica i risultati
SELECT 
    id, 
    "projectId", 
    model, 
    "maxTokens",
    "reasoningEffort",
    verbosity
FROM "AIConfig"
WHERE "model" LIKE 'gpt-5%';
