-- Update existing AI configs to use higher max tokens for GPT-5
-- This prevents JSON truncation issues during chapter generation

UPDATE "AIConfig"
SET "maxTokens" = 20000
WHERE "maxTokens" < 20000;

-- Verify the update
SELECT 
    id,
    "projectId",
    model,
    "maxTokens",
    "reasoningEffort",
    verbosity,
    "createdAt"
FROM "AIConfig"
ORDER BY "createdAt" DESC;
