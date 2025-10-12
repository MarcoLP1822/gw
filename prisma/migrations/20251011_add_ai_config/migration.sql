-- CreateTable
CREATE TABLE "ProjectAIConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL DEFAULT 'professionals',
    "audienceAge" TEXT,
    "audienceExpertise" TEXT NOT NULL DEFAULT 'intermediate',
    "customAudience" TEXT,
    "bookGoal" TEXT NOT NULL DEFAULT 'personalBranding',
    "toneSlider" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "narrativeStyle" TEXT NOT NULL DEFAULT 'mixed',
    "chapterLength" TEXT NOT NULL DEFAULT 'standard',
    "targetWordsPerChapter" INTEGER NOT NULL DEFAULT 2000,
    "sentenceComplexity" TEXT NOT NULL DEFAULT 'medium',
    "paragraphLength" TEXT NOT NULL DEFAULT 'medium',
    "isAdvancedMode" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 4000,
    "topP" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "frequencyPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "presencePenalty" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "useCustomPrompts" BOOLEAN NOT NULL DEFAULT false,
    "customSystemPrompt" TEXT,
    "customOutlineInstructions" TEXT,
    "customChapterInstructions" TEXT,
    "lastTestAt" TIMESTAMP(3),
    "testOutput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAIConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAIConfig_projectId_key" ON "ProjectAIConfig"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAIConfig_projectId_idx" ON "ProjectAIConfig"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectAIConfig" ADD CONSTRAINT "ProjectAIConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
