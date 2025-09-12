/*
  Warnings:

  - You are about to drop the column `organizationId` on the `OptionSet` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationAssessmentTemplateLink` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `OptionSet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `QuestionBank` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."OptionSet" DROP CONSTRAINT "OptionSet_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrganizationAssessmentTemplateLink" DROP CONSTRAINT "OrganizationAssessmentTemplateLink_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrganizationAssessmentTemplateLink" DROP CONSTRAINT "OrganizationAssessmentTemplateLink_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionBank" DROP CONSTRAINT "QuestionBank_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."OptionSet_organizationId_idx";

-- DropIndex
DROP INDEX "public"."OptionSet_organizationId_name_key";

-- DropIndex
DROP INDEX "public"."QuestionBank_organizationId_idx";

-- DropIndex
DROP INDEX "public"."QuestionBank_organizationId_name_key";

-- AlterTable
ALTER TABLE "public"."OptionSet" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "public"."QuestionBank" DROP COLUMN "organizationId";

-- DropTable
DROP TABLE "public"."OrganizationAssessmentTemplateLink";

-- CreateIndex
CREATE UNIQUE INDEX "OptionSet_name_key" ON "public"."OptionSet"("name");

-- CreateIndex
CREATE INDEX "OptionSet_name_idx" ON "public"."OptionSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_name_key" ON "public"."QuestionBank"("name");

-- CreateIndex
CREATE INDEX "QuestionBank_name_idx" ON "public"."QuestionBank"("name");
