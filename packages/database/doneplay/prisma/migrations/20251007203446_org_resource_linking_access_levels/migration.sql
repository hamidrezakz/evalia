-- CreateEnum
CREATE TYPE "public"."QuestionBankAccessLevel" AS ENUM ('USE', 'EDIT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TemplateAccessLevel" AS ENUM ('USE', 'EDIT', 'ADMIN', 'CLONE');

-- CreateEnum
CREATE TYPE "public"."OptionSetAccessLevel" AS ENUM ('USE', 'EDIT', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."AssessmentTemplate" ADD COLUMN     "createdByOrganizationId" INTEGER;

-- AlterTable
ALTER TABLE "public"."OptionSet" ADD COLUMN     "createdByOrganizationId" INTEGER;

-- AlterTable
ALTER TABLE "public"."QuestionBank" ADD COLUMN     "createdByOrganizationId" INTEGER;

-- CreateTable
CREATE TABLE "public"."QuestionBankOrganizationLink" (
    "id" SERIAL NOT NULL,
    "questionBankId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "accessLevel" "public"."QuestionBankAccessLevel" NOT NULL DEFAULT 'USE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBankOrganizationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentTemplateOrganizationLink" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "accessLevel" "public"."TemplateAccessLevel" NOT NULL DEFAULT 'USE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentTemplateOrganizationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptionSetOrganizationLink" (
    "id" SERIAL NOT NULL,
    "optionSetId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "accessLevel" "public"."OptionSetAccessLevel" NOT NULL DEFAULT 'USE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionSetOrganizationLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBankOrganizationLink_organizationId_idx" ON "public"."QuestionBankOrganizationLink"("organizationId");

-- CreateIndex
CREATE INDEX "QuestionBankOrganizationLink_accessLevel_idx" ON "public"."QuestionBankOrganizationLink"("accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBankOrganizationLink_questionBankId_organizationId_key" ON "public"."QuestionBankOrganizationLink"("questionBankId", "organizationId");

-- CreateIndex
CREATE INDEX "AssessmentTemplateOrganizationLink_organizationId_idx" ON "public"."AssessmentTemplateOrganizationLink"("organizationId");

-- CreateIndex
CREATE INDEX "AssessmentTemplateOrganizationLink_accessLevel_idx" ON "public"."AssessmentTemplateOrganizationLink"("accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplateOrganizationLink_templateId_organizationI_key" ON "public"."AssessmentTemplateOrganizationLink"("templateId", "organizationId");

-- CreateIndex
CREATE INDEX "OptionSetOrganizationLink_organizationId_idx" ON "public"."OptionSetOrganizationLink"("organizationId");

-- CreateIndex
CREATE INDEX "OptionSetOrganizationLink_accessLevel_idx" ON "public"."OptionSetOrganizationLink"("accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "OptionSetOrganizationLink_optionSetId_organizationId_key" ON "public"."OptionSetOrganizationLink"("optionSetId", "organizationId");

-- AddForeignKey
ALTER TABLE "public"."QuestionBank" ADD CONSTRAINT "QuestionBank_createdByOrganizationId_fkey" FOREIGN KEY ("createdByOrganizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionSet" ADD CONSTRAINT "OptionSet_createdByOrganizationId_fkey" FOREIGN KEY ("createdByOrganizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplate" ADD CONSTRAINT "AssessmentTemplate_createdByOrganizationId_fkey" FOREIGN KEY ("createdByOrganizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBankOrganizationLink" ADD CONSTRAINT "QuestionBankOrganizationLink_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "public"."QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBankOrganizationLink" ADD CONSTRAINT "QuestionBankOrganizationLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplateOrganizationLink" ADD CONSTRAINT "AssessmentTemplateOrganizationLink_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AssessmentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplateOrganizationLink" ADD CONSTRAINT "AssessmentTemplateOrganizationLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionSetOrganizationLink" ADD CONSTRAINT "OptionSetOrganizationLink_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "public"."OptionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionSetOrganizationLink" ADD CONSTRAINT "OptionSetOrganizationLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
