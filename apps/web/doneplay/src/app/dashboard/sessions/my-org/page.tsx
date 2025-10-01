"use client";
import * as React from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { SessionManager } from "@/assessment/components/sessions";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import {
  OrganizationStatusBadge,
  OrgPlanBadge,
} from "@/components/status-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";

export default function MyOrgSessionsPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = activeOrganizationId ?? null;
  const { data: org, isLoading } = useOrganization(orgId, !!orgId);

  return (
    <div className="space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b flex flex-wrap gap-2 items-center">
          <PanelTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> جلسات سازمان
          </PanelTitle>
          {orgId &&
            (isLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : org?.name ? (
              <span className="text-sm font-medium text-foreground/80">
                «{org.name}»
              </span>
            ) : null)}
          {orgId &&
            (isLoading ? (
              <Skeleton className="h-5 w-16 rounded" />
            ) : org?.status ? (
              <OrganizationStatusBadge
                status={org.status as any}
                tone="soft"
                size="xs"
              />
            ) : null)}
          {orgId &&
            (isLoading ? (
              <Skeleton className="h-5 w-20 rounded" />
            ) : org?.plan ? (
              <OrgPlanBadge plan={org.plan as any} tone="soft" size="xs" />
            ) : null)}
          <PanelDescription className="basis-full">
            نمایش و مدیریت جلسات اختصاصی سازمان فعال. ایجاد، ویرایش و بررسی
            وضعیت و تحلیل.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="block p-1 md:p-2">
          {orgId ? (
            <SessionManager organizationId={orgId} />
          ) : (
            <div className="text-sm text-muted-foreground p-2">
              ابتدا یک سازمان فعال انتخاب کنید.
            </div>
          )}
        </PanelContent>
      </Panel>
    </div>
  );
}
