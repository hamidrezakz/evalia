-- CreateTable
CREATE TABLE "SessionInviteLink" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "autoJoinOrg" BOOLEAN NOT NULL DEFAULT true,
    "autoAssignSelf" BOOLEAN NOT NULL DEFAULT true,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionInviteLinkUse" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "SessionInviteLinkUse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionInviteLink_token_key" ON "SessionInviteLink"("token");

-- CreateIndex
CREATE INDEX "SessionInviteLink_organizationId_sessionId_idx" ON "SessionInviteLink"("organizationId", "sessionId");

-- CreateIndex
CREATE INDEX "SessionInviteLinkUse_linkId_usedAt_idx" ON "SessionInviteLinkUse"("linkId", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInviteLinkUse_linkId_userId_key" ON "SessionInviteLinkUse"("linkId", "userId");

-- AddForeignKey
ALTER TABLE "SessionInviteLink" ADD CONSTRAINT "SessionInviteLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInviteLink" ADD CONSTRAINT "SessionInviteLink_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInviteLink" ADD CONSTRAINT "SessionInviteLink_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInviteLinkUse" ADD CONSTRAINT "SessionInviteLinkUse_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SessionInviteLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInviteLinkUse" ADD CONSTRAINT "SessionInviteLinkUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
