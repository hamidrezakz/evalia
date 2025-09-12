/*
  Warnings:

  - You are about to drop the `PermissionOnMembership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PermissionOnMembership" DROP CONSTRAINT "PermissionOnMembership_membershipId_fkey";

-- DropTable
DROP TABLE "public"."PermissionOnMembership";

-- DropEnum
DROP TYPE "public"."PermissionCode";
