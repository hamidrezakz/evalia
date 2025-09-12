-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "optionSetId" INTEGER;

-- CreateTable
CREATE TABLE "public"."OptionSet" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OptionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptionSetOption" (
    "id" SERIAL NOT NULL,
    "optionSetId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionSetOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptionSet_code_key" ON "public"."OptionSet"("code");

-- CreateIndex
CREATE INDEX "OptionSet_organizationId_idx" ON "public"."OptionSet"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OptionSet_organizationId_name_key" ON "public"."OptionSet"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OptionSetOption_optionSetId_idx" ON "public"."OptionSetOption"("optionSetId");

-- CreateIndex
CREATE INDEX "OptionSetOption_value_idx" ON "public"."OptionSetOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "OptionSetOption_optionSetId_value_key" ON "public"."OptionSetOption"("optionSetId", "value");

-- CreateIndex
CREATE INDEX "Question_optionSetId_idx" ON "public"."Question"("optionSetId");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "public"."OptionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionSet" ADD CONSTRAINT "OptionSet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionSetOption" ADD CONSTRAINT "OptionSetOption_optionSetId_fkey" FOREIGN KEY ("optionSetId") REFERENCES "public"."OptionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
