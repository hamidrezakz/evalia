/*
  Warnings:

  - A unique constraint covering the columns `[phoneNormalized]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."VerificationIdentifierType" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "public"."VerificationPurpose" AS ENUM ('LOGIN', 'PASSWORD_RESET', 'MFA', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'SENSITIVE_ACTION');

-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "invitedPhone" VARCHAR(32),
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phoneCountry" CHAR(2),
ADD COLUMN     "phoneNormalized" VARCHAR(32),
ADD COLUMN     "phoneNumber" VARCHAR(32),
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."VerificationCode" (
    "id" TEXT NOT NULL,
    "identifierType" "public"."VerificationIdentifierType" NOT NULL,
    "purpose" "public"."VerificationPurpose" NOT NULL,
    "identifier" TEXT NOT NULL,
    "codeHash" VARCHAR(128) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationCode_identifierType_identifier_idx" ON "public"."VerificationCode"("identifierType", "identifier");

-- CreateIndex
CREATE INDEX "VerificationCode_purpose_idx" ON "public"."VerificationCode"("purpose");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "public"."VerificationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationCode_consumedAt_idx" ON "public"."VerificationCode"("consumedAt");

-- CreateIndex
CREATE INDEX "VerificationCode_identifier_purpose_expiresAt_idx" ON "public"."VerificationCode"("identifier", "purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "Invitation_organizationId_invitedPhone_idx" ON "public"."Invitation"("organizationId", "invitedPhone");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNormalized_key" ON "public"."User"("phoneNormalized");

-- CreateIndex
CREATE INDEX "User_phoneNormalized_idx" ON "public"."User"("phoneNormalized");
