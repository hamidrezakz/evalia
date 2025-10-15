-- AlterTable
ALTER TABLE "public"."AssessmentTemplateQuestion" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AssessmentTemplateQuestion_sectionId_questionId_deletedAt_idx" ON "public"."AssessmentTemplateQuestion"("sectionId", "questionId", "deletedAt");
