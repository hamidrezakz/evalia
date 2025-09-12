/*
  Warnings:

  - You are about to drop the column `organizationId` on the `AssessmentTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `AssessmentTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `AssessmentTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AssessmentTemplate" DROP CONSTRAINT "AssessmentTemplate_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."AssessmentTemplate_organizationId_name_key";

-- DropIndex
DROP INDEX "public"."AssessmentTemplate_organizationId_state_idx";

-- AlterTable
ALTER TABLE "public"."AssessmentTemplate" DROP COLUMN "organizationId",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."OrganizationAssessmentTemplateLink" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "OrganizationAssessmentTemplateLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationAssessmentTemplateLink_organizationId_idx" ON "public"."OrganizationAssessmentTemplateLink"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationAssessmentTemplateLink_templateId_idx" ON "public"."OrganizationAssessmentTemplateLink"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAssessmentTemplateLink_organizationId_templateI_key" ON "public"."OrganizationAssessmentTemplateLink"("organizationId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplate_slug_key" ON "public"."AssessmentTemplate"("slug");

-- CreateIndex
CREATE INDEX "AssessmentTemplate_state_idx" ON "public"."AssessmentTemplate"("state");

-- CreateIndex
CREATE INDEX "AssessmentTemplate_name_idx" ON "public"."AssessmentTemplate"("name");

-- AddForeignKey
ALTER TABLE "public"."OrganizationAssessmentTemplateLink" ADD CONSTRAINT "OrganizationAssessmentTemplateLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationAssessmentTemplateLink" ADD CONSTRAINT "OrganizationAssessmentTemplateLink_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AssessmentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
