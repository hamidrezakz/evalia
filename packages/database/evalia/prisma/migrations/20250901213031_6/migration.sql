-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "globalRoles" SET DEFAULT ARRAY['MEMBER']::"public"."PlatformRole"[];
