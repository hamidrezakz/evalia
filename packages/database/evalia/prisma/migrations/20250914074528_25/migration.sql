/*
  Warnings:

  - You are about to drop the column `value` on the `AssessmentResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AssessmentResponse" DROP COLUMN "value",
ADD COLUMN     "optionValue" TEXT,
ADD COLUMN     "optionValues" TEXT[],
ADD COLUMN     "scaleValue" INTEGER,
ADD COLUMN     "textValue" TEXT;
