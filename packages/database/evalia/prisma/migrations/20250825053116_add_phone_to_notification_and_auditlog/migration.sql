/*
  Warnings:

  - The `type` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('GENERIC', 'SYSTEM', 'INVITATION', 'APPROVAL', 'FEEDBACK', 'ALERT', 'REMINDER', 'CUSTOM');

-- AlterEnum
ALTER TYPE "public"."NotificationChannel" ADD VALUE 'SMS';

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "senderPhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "phoneNumber" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."NotificationType" NOT NULL DEFAULT 'GENERIC';

-- CreateIndex
CREATE INDEX "AuditLog_senderPhoneNumber_idx" ON "public"."AuditLog"("senderPhoneNumber");

-- CreateIndex
CREATE INDEX "Notification_phoneNumber_idx" ON "public"."Notification"("phoneNumber");
