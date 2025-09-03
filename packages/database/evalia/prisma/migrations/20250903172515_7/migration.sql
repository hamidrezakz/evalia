-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_createdAt_idx" ON "public"."OrganizationMembership"("organizationId", "role", "createdAt");
