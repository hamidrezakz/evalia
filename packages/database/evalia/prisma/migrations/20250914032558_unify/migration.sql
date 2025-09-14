/*
  Warnings:

  - You are about to drop the column `optionValue` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `optionValues` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `scaleValue` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `textValue` on the `AssessmentResponse` table. All the data in the column will be lost.
  - Added the required column `value` to the `AssessmentResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AssessmentResponse" DROP COLUMN "optionValue",
DROP COLUMN "optionValues",
DROP COLUMN "scaleValue",
DROP COLUMN "textValue",
ADD COLUMN     "value" JSONB NOT NULL;
