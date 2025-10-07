/*
  Warnings:

  - A unique constraint covering the columns `[avatarAssetId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "avatarAssetId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_avatarAssetId_key" ON "public"."Organization"("avatarAssetId");

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_avatarAssetId_fkey" FOREIGN KEY ("avatarAssetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
