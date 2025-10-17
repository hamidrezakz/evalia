"use client";
import * as React from "react";
import { SessionManager } from "@/assessment/components/sessions";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrganizationStatusBadge,
  OrgPlanBadge,
} from "@/components/status-badges";
import { CalendarRange } from "lucide-react";

export default function SessionsPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = activeOrganizationId ?? null;
  const { data: org, isLoading } = useOrganization(orgId, !!orgId);
  return (
    <div className="space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="">
          <PanelTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4 text-primary" /> جلسات ارزیابی
          </PanelTitle>
          <PanelDescription>
            نمایش و مدیریت جلسات سازمان فعال. برای تغییر، سازمان فعال را از
            بالای سیستم عوض کنید.
          </PanelDescription>
          {isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : org ? (
            <div className="flex items-center gap-2 text-sm mr-auto">
              <span className="font-semibold truncate max-w-[40vw]">
                {org.name}
              </span>
              <span className="text-muted-foreground">/ {org.slug}</span>
              <OrganizationStatusBadge status={org.status as any} />
              <OrgPlanBadge plan={org.plan as any} />
            </div>
          ) : null}
        </PanelHeader>
        <PanelContent className="block p-1 md:p-2">
          <SessionManager />
        </PanelContent>
      </Panel>
    </div>
  );
}
