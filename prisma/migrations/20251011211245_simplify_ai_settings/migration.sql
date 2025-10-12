/*
  Warnings:

  - You are about to drop the column `audienceAge` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `audienceExpertise` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `audienceType` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `bookGoal` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `chapterLength` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `customAudience` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `isAdvancedMode` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `narrativeStyle` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `paragraphLength` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `sentenceComplexity` on the `ProjectAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `toneSlider` on the `ProjectAIConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "keyNumbers" JSONB,
ADD COLUMN     "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "newCharacters" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "newTerms" JSONB,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "systemPrompt" TEXT,
ADD COLUMN     "userPrompt" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "masterContext" JSONB,
ADD COLUMN     "styleGuide" JSONB;

-- AlterTable
ALTER TABLE "ProjectAIConfig" DROP COLUMN "audienceAge",
DROP COLUMN "audienceExpertise",
DROP COLUMN "audienceType",
DROP COLUMN "bookGoal",
DROP COLUMN "chapterLength",
DROP COLUMN "customAudience",
DROP COLUMN "isAdvancedMode",
DROP COLUMN "narrativeStyle",
DROP COLUMN "paragraphLength",
DROP COLUMN "sentenceComplexity",
DROP COLUMN "toneSlider";

-- CreateTable
CREATE TABLE "ConsistencyReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsistencyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsistencyReport_projectId_idx" ON "ConsistencyReport"("projectId");

-- CreateIndex
CREATE INDEX "ConsistencyReport_createdAt_idx" ON "ConsistencyReport"("createdAt");

-- AddForeignKey
ALTER TABLE "ConsistencyReport" ADD CONSTRAINT "ConsistencyReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
