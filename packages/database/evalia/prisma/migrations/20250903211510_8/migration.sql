/*
  Warnings:

  - You are about to drop the column `organizationId` on the `NavigationItem` table. All the data in the column will be lost.
  - You are about to drop the column `platformRole` on the `NavigationItem` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `NavigationItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label,parentId]` on the table `NavigationItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."NavigationItem" DROP CONSTRAINT "NavigationItem_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."NavigationItem_organizationId_idx";

-- DropIndex
DROP INDEX "public"."NavigationItem_organizationId_role_platformRole_label_paren_key";

-- DropIndex
DROP INDEX "public"."NavigationItem_platformRole_idx";

-- DropIndex
DROP INDEX "public"."NavigationItem_role_idx";

-- AlterTable
ALTER TABLE "public"."NavigationItem" DROP COLUMN "organizationId",
DROP COLUMN "platformRole",
DROP COLUMN "role",
ADD COLUMN     "orgRoles" "public"."OrgRole"[],
ADD COLUMN     "platformRoles" "public"."PlatformRole"[];

-- CreateIndex
CREATE INDEX "NavigationItem_order_idx" ON "public"."NavigationItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItem_label_parentId_key" ON "public"."NavigationItem"("label", "parentId");
