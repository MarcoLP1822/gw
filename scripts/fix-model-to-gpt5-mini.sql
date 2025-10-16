-- Fix AI Model: Update to correct model name gpt-5-mini
-- The issue was using gpt-5-mini-2025-08-07 instead of just gpt-5-mini

UPDATE "ProjectAIConfig"
SET 
  model = 'gpt-5-mini'
WHERE 
  model IN ('gpt-5-mini-2025-08-07', 'gpt-4o-mini');

-- Verify the update
SELECT 
  id,
  "projectId",
  model,
  temperature,
  "maxTokens"
FROM "ProjectAIConfig"
ORDER BY "createdAt" DESC;
