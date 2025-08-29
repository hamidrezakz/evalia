-- CreateEnum
CREATE TYPE "public"."Locale" AS ENUM ('FA', 'EN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('PASSWORD', 'GOOGLE', 'GITHUB', 'MICROSOFT', 'APPLE', 'AZURE_AD');

-- CreateEnum
CREATE TYPE "public"."OrgPlan" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."OrgRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."PermissionCode" AS ENUM ('ORG_MANAGE', 'USER_INVITE', 'TEAM_MANAGE', 'DASHBOARD_CONFIGURE', 'ASSESSMENT_TEMPLATE_MANAGE', 'ASSESSMENT_SESSION_MANAGE', 'ASSESSMENT_RESPONSE_VIEW', 'ASSESSMENT_AI_ANALYZE', 'BILLING_VIEW', 'BILLING_MANAGE', 'REPORT_VIEW', 'REPORT_EXPORT', 'NOTIFICATION_MANAGE');

-- CreateEnum
CREATE TYPE "public"."AssessmentState" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SessionState" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'ANALYZING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ResponsePerspective" AS ENUM ('SELF', 'FACILITATOR', 'PEER', 'MANAGER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('SCALE', 'TEXT', 'MULTI_CHOICE', 'SINGLE_CHOICE', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "public"."AIJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'PERMISSION_CHANGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('AVATAR', 'DOCUMENT', 'SPREADSHEET', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."WidgetKind" AS ENUM ('KPI', 'CHART', 'TABLE', 'TEXT_BLOCK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."PlatformRole" AS ENUM ('SUPER_ADMIN', 'ANALYSIS_MANAGER', 'FACILITATOR', 'SUPPORT', 'SALES');

-- CreateEnum
CREATE TYPE "public"."OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "provider" "public"."AuthProvider" NOT NULL DEFAULT 'PASSWORD',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "locale" "public"."Locale" NOT NULL DEFAULT 'FA',
    "gender" "public"."Gender",
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatarAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "globalRoles" "public"."PlatformRole"[] DEFAULT ARRAY[]::"public"."PlatformRole"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "public"."OrgPlan" NOT NULL DEFAULT 'FREE',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tehran',
    "locale" "public"."Locale" NOT NULL DEFAULT 'FA',
    "primaryOwnerId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "trialEndsAt" TIMESTAMP(3),
    "billingEmail" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationServiceAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."PlatformRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PermissionOnMembership" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "code" "public"."PermissionCode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionOnMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NavigationItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "path" TEXT,
    "externalUrl" TEXT,
    "iconName" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WidgetDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "public"."WidgetKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "configSchema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WidgetDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardConfig" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardWidget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "widgetDefinitionId" TEXT NOT NULL,
    "title" TEXT,
    "position" JSONB NOT NULL DEFAULT '{}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionBank" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "code" TEXT,
    "text" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "minScale" INTEGER,
    "maxScale" INTEGER,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" "public"."AssessmentState" NOT NULL DEFAULT 'DRAFT',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentTemplateSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentTemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentTemplateQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "perspectives" "public"."ResponsePerspective"[],
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentTemplateQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentSession" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "teamScopeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" "public"."SessionState" NOT NULL DEFAULT 'SCHEDULED',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAssignment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "perspective" "public"."ResponsePerspective" NOT NULL DEFAULT 'SELF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentResponse" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "templateQuestionId" TEXT NOT NULL,
    "scaleValue" INTEGER,
    "optionValue" TEXT,
    "optionValues" TEXT[],
    "textValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAggregateScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "perspective" "public"."ResponsePerspective" NOT NULL,
    "avgScale" DOUBLE PRECISION,
    "distribution" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAggregateScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIAnalysisJob" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" "public"."AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "inputSpec" JSONB NOT NULL DEFAULT '{}',
    "outputSpec" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AIAnalysisJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIAnalysisResult" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "channel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "actionType" "public"."AuditActionType" NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" "public"."AssetType" NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarAssetId_key" ON "public"."User"("avatarAssetId");

-- CreateIndex
CREATE INDEX "User_fullName_idx" ON "public"."User"("fullName");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "public"."Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_plan_idx" ON "public"."Organization"("plan");

-- CreateIndex
CREATE INDEX "Organization_locale_idx" ON "public"."Organization"("locale");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "public"."Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationServiceAssignment_userId_role_idx" ON "public"."OrganizationServiceAssignment"("userId", "role");

-- CreateIndex
CREATE INDEX "OrganizationServiceAssignment_organizationId_active_idx" ON "public"."OrganizationServiceAssignment"("organizationId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationServiceAssignment_organizationId_userId_role_key" ON "public"."OrganizationServiceAssignment"("organizationId", "userId", "role");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_idx" ON "public"."OrganizationMembership"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_userId_organizationId_key" ON "public"."OrganizationMembership"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "PermissionOnMembership_code_idx" ON "public"."PermissionOnMembership"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionOnMembership_membershipId_code_key" ON "public"."PermissionOnMembership"("membershipId", "code");

-- CreateIndex
CREATE INDEX "Team_organizationId_name_idx" ON "public"."Team"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_slug_key" ON "public"."Team"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "TeamMembership_userId_idx" ON "public"."TeamMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_userId_key" ON "public"."TeamMembership"("teamId", "userId");

-- CreateIndex
CREATE INDEX "NavigationItem_organizationId_role_idx" ON "public"."NavigationItem"("organizationId", "role");

-- CreateIndex
CREATE INDEX "NavigationItem_parentId_idx" ON "public"."NavigationItem"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItem_organizationId_role_label_parentId_key" ON "public"."NavigationItem"("organizationId", "role", "label", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetDefinition_key_key" ON "public"."WidgetDefinition"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardConfig_organizationId_role_key" ON "public"."DashboardConfig"("organizationId", "role");

-- CreateIndex
CREATE INDEX "QuestionBank_organizationId_idx" ON "public"."QuestionBank"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_organizationId_name_key" ON "public"."QuestionBank"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Question_bankId_idx" ON "public"."Question"("bankId");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "public"."QuestionOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_value_key" ON "public"."QuestionOption"("questionId", "value");

-- CreateIndex
CREATE INDEX "AssessmentTemplate_organizationId_state_idx" ON "public"."AssessmentTemplate"("organizationId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplate_organizationId_name_key" ON "public"."AssessmentTemplate"("organizationId", "name");

-- CreateIndex
CREATE INDEX "AssessmentTemplateSection_templateId_idx" ON "public"."AssessmentTemplateSection"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplateSection_templateId_title_key" ON "public"."AssessmentTemplateSection"("templateId", "title");

-- CreateIndex
CREATE INDEX "AssessmentTemplateQuestion_questionId_idx" ON "public"."AssessmentTemplateQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplateQuestion_sectionId_questionId_key" ON "public"."AssessmentTemplateQuestion"("sectionId", "questionId");

-- CreateIndex
CREATE INDEX "AssessmentSession_organizationId_state_idx" ON "public"."AssessmentSession"("organizationId", "state");

-- CreateIndex
CREATE INDEX "AssessmentSession_templateId_idx" ON "public"."AssessmentSession"("templateId");

-- CreateIndex
CREATE INDEX "AssessmentSession_teamScopeId_idx" ON "public"."AssessmentSession"("teamScopeId");

-- CreateIndex
CREATE INDEX "AssessmentAssignment_userId_idx" ON "public"."AssessmentAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAssignment_sessionId_userId_perspective_key" ON "public"."AssessmentAssignment"("sessionId", "userId", "perspective");

-- CreateIndex
CREATE INDEX "AssessmentResponse_templateQuestionId_idx" ON "public"."AssessmentResponse"("templateQuestionId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_assignmentId_idx" ON "public"."AssessmentResponse"("assignmentId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_sessionId_idx" ON "public"."AssessmentResponse"("sessionId");

-- CreateIndex
CREATE INDEX "AssessmentAggregateScore_questionId_idx" ON "public"."AssessmentAggregateScore"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAggregateScore_sessionId_questionId_perspective_key" ON "public"."AssessmentAggregateScore"("sessionId", "questionId", "perspective");

-- CreateIndex
CREATE INDEX "AIAnalysisJob_sessionId_status_idx" ON "public"."AIAnalysisJob"("sessionId", "status");

-- CreateIndex
CREATE INDEX "AIAnalysisResult_jobId_idx" ON "public"."AIAnalysisResult"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysisResult_jobId_kind_key" ON "public"."AIAnalysisResult"("jobId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "public"."Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_organizationId_email_idx" ON "public"."Invitation"("organizationId", "email");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "public"."Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "public"."AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "public"."AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "Asset_organizationId_type_idx" ON "public"."Asset"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Asset_filename_idx" ON "public"."Asset"("filename");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_avatarAssetId_fkey" FOREIGN KEY ("avatarAssetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_primaryOwnerId_fkey" FOREIGN KEY ("primaryOwnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationServiceAssignment" ADD CONSTRAINT "OrganizationServiceAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationServiceAssignment" ADD CONSTRAINT "OrganizationServiceAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PermissionOnMembership" ADD CONSTRAINT "PermissionOnMembership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "public"."OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NavigationItem" ADD CONSTRAINT "NavigationItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NavigationItem" ADD CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."NavigationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardConfig" ADD CONSTRAINT "DashboardConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "public"."DashboardConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardWidget" ADD CONSTRAINT "DashboardWidget_widgetDefinitionId_fkey" FOREIGN KEY ("widgetDefinitionId") REFERENCES "public"."WidgetDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBank" ADD CONSTRAINT "QuestionBank_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."QuestionBank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplate" ADD CONSTRAINT "AssessmentTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplateSection" ADD CONSTRAINT "AssessmentTemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AssessmentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplateQuestion" ADD CONSTRAINT "AssessmentTemplateQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."AssessmentTemplateSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentTemplateQuestion" ADD CONSTRAINT "AssessmentTemplateQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentSession" ADD CONSTRAINT "AssessmentSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentSession" ADD CONSTRAINT "AssessmentSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AssessmentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentSession" ADD CONSTRAINT "AssessmentSession_teamScopeId_fkey" FOREIGN KEY ("teamScopeId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."AssessmentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_templateQuestionId_fkey" FOREIGN KEY ("templateQuestionId") REFERENCES "public"."AssessmentTemplateQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAggregateScore" ADD CONSTRAINT "AssessmentAggregateScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAggregateScore" ADD CONSTRAINT "AssessmentAggregateScore_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIAnalysisJob" ADD CONSTRAINT "AIAnalysisJob_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AssessmentSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIAnalysisJob" ADD CONSTRAINT "AIAnalysisJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIAnalysisResult" ADD CONSTRAINT "AIAnalysisResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."AIAnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
