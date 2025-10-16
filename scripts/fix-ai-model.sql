-- Fix AI Model: Update from non-existent gpt-5-mini-2025-08-07 to gpt-4o-mini
-- This fixes the issue where chapters were generating empty because the model didn't exist

UPDATE "ProjectAIConfig"
SET 
  model = 'gpt-4o-mini'
WHERE 
  model = 'gpt-5-mini-2025-08-07';

-- Verify the update
SELECT 
  id,
  "projectId",
  model,
  temperature,
  "maxTokens"
FROM "ProjectAIConfig"
ORDER BY "createdAt" DESC;
