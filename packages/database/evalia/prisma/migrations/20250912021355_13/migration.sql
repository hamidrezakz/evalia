/*
  Warnings:

  - Changed the type of `kind` on the `AIAnalysisResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."AIAnalysisKind" AS ENUM ('SUMMARY', 'THEME', 'SENTIMENT', 'RISK');

-- AlterTable
ALTER TABLE "public"."AIAnalysisResult" DROP COLUMN "kind",
ADD COLUMN     "kind" "public"."AIAnalysisKind" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysisResult_jobId_kind_key" ON "public"."AIAnalysisResult"("jobId", "kind");
