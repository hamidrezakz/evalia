-- DropIndex
DROP INDEX "public"."AssessmentAssignment_sessionId_userId_perspective_key";

-- AlterTable
ALTER TABLE "public"."AssessmentAssignment" ADD COLUMN     "subjectUserId" INTEGER;

-- CreateIndex
CREATE INDEX "AssessmentAssignment_subjectUserId_idx" ON "public"."AssessmentAssignment"("subjectUserId");

-- AddForeignKey
ALTER TABLE "public"."AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
