-- CreateEnum
CREATE TYPE "public"."OrganizationCapability" AS ENUM ('MASTER', 'BILLING_PROVIDER', 'ANALYTICS_HUB');

-- CreateEnum
CREATE TYPE "public"."OrganizationRelationshipType" AS ENUM ('PARENT_CHILD', 'FRANCHISE', 'MANAGED', 'BRAND_ALIAS');

-- CreateTable
CREATE TABLE "public"."OrganizationCapabilityAssignment" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "capability" "public"."OrganizationCapability" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationCapabilityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationRelationship" (
    "id" SERIAL NOT NULL,
    "parentOrganizationId" INTEGER NOT NULL,
    "childOrganizationId" INTEGER NOT NULL,
    "relationshipType" "public"."OrganizationRelationshipType" NOT NULL DEFAULT 'PARENT_CHILD',
    "cascadeResources" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationCapabilityAssignment_capability_idx" ON "public"."OrganizationCapabilityAssignment"("capability");

-- CreateIndex
CREATE INDEX "OrganizationCapabilityAssignment_active_idx" ON "public"."OrganizationCapabilityAssignment"("active");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationCapabilityAssignment_organizationId_capability_key" ON "public"."OrganizationCapabilityAssignment"("organizationId", "capability");

-- CreateIndex
CREATE INDEX "OrganizationRelationship_childOrganizationId_idx" ON "public"."OrganizationRelationship"("childOrganizationId");

-- CreateIndex
CREATE INDEX "OrganizationRelationship_relationshipType_idx" ON "public"."OrganizationRelationship"("relationshipType");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRelationship_parentOrganizationId_childOrganiza_key" ON "public"."OrganizationRelationship"("parentOrganizationId", "childOrganizationId");

-- AddForeignKey
ALTER TABLE "public"."OrganizationCapabilityAssignment" ADD CONSTRAINT "OrganizationCapabilityAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationRelationship" ADD CONSTRAINT "OrganizationRelationship_parentOrganizationId_fkey" FOREIGN KEY ("parentOrganizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationRelationship" ADD CONSTRAINT "OrganizationRelationship_childOrganizationId_fkey" FOREIGN KEY ("childOrganizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
