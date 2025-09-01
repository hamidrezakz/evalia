/*
  Warnings:

  - You are about to drop the `DashboardConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DashboardWidget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WidgetDefinition` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,role,platformRole,label,parentId]` on the table `NavigationItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."DashboardConfig" DROP CONSTRAINT "DashboardConfig_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DashboardWidget" DROP CONSTRAINT "DashboardWidget_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DashboardWidget" DROP CONSTRAINT "DashboardWidget_widgetDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NavigationItem" DROP CONSTRAINT "NavigationItem_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."NavigationItem_organizationId_role_idx";

-- DropIndex
DROP INDEX "public"."NavigationItem_organizationId_role_label_parentId_key";

-- AlterTable
ALTER TABLE "public"."NavigationItem" ADD COLUMN     "platformRole" "public"."PlatformRole",
ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."DashboardConfig";

-- DropTable
DROP TABLE "public"."DashboardWidget";

-- DropTable
DROP TABLE "public"."WidgetDefinition";

-- CreateIndex
CREATE INDEX "NavigationItem_organizationId_idx" ON "public"."NavigationItem"("organizationId");

-- CreateIndex
CREATE INDEX "NavigationItem_role_idx" ON "public"."NavigationItem"("role");

-- CreateIndex
CREATE INDEX "NavigationItem_platformRole_idx" ON "public"."NavigationItem"("platformRole");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItem_organizationId_role_platformRole_label_paren_key" ON "public"."NavigationItem"("organizationId", "role", "platformRole", "label", "parentId");

-- AddForeignKey
ALTER TABLE "public"."NavigationItem" ADD CONSTRAINT "NavigationItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
