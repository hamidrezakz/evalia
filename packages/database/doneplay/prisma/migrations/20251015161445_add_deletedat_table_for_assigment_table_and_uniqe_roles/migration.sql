/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,userId,subjectUserId,perspective]` on the table `AssessmentAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AssessmentAssignment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAssignment_sessionId_userId_subjectUserId_perspec_key" ON "AssessmentAssignment"("sessionId", "userId", "subjectUserId", "perspective");
