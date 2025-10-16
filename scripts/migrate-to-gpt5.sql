-- Migration: Add GPT-5 parameters (reasoningEffort, verbosity)
-- Replace old temperature-based parameters with GPT-5's reasoning controls

-- Add new GPT-5 parameters
ALTER TABLE "ProjectAIConfig"
ADD COLUMN "reasoningEffort" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN "verbosity" TEXT NOT NULL DEFAULT 'medium';

-- Make legacy parameters nullable (non usati da GPT-5)
ALTER TABLE "ProjectAIConfig"
ALTER COLUMN "temperature" DROP NOT NULL,
ALTER COLUMN "topP" DROP NOT NULL,
ALTER COLUMN "frequencyPenalty" DROP NOT NULL,
ALTER COLUMN "presencePenalty" DROP NOT NULL;

-- Update model to GPT-5
UPDATE "ProjectAIConfig"
SET 
  model = 'gpt-5',
  reasoningEffort = 'medium',
  verbosity = 'medium'
WHERE model LIKE 'gpt-%';

-- Verify changes
SELECT 
  id,
  "projectId",
  model,
  "reasoningEffort",
  verbosity,
  "maxTokens"
FROM "ProjectAIConfig"
ORDER BY "createdAt" DESC;
