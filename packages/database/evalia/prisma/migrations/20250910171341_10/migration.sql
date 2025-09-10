/*
  Warnings:

  - You are about to drop the column `role` on the `OrganizationMembership` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."OrganizationMembership_organizationId_role_createdAt_idx";

-- DropIndex
DROP INDEX "public"."OrganizationMembership_organizationId_role_idx";

-- AlterTable
ALTER TABLE "public"."OrganizationMembership" DROP COLUMN "role",
ADD COLUMN     "roles" "public"."OrgRole"[] DEFAULT ARRAY['MEMBER']::"public"."OrgRole"[];
