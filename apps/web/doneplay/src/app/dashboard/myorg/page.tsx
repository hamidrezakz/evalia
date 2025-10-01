"use client";
import * as React from "react";
import ActiveOrgMembers from "@/organizations/organization/components/ActiveOrgMembers";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import {
  OrganizationStatusBadge,
  OrgPlanBadge,
} from "@/components/status-badges";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Users as UsersIcon } from "lucide-react";

export default function MyOrgPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = activeOrganizationId ?? null;
  const { data: org, isLoading } = useOrganization(orgId, !!orgId);

  return (
    <div className="space-y-4" dir="rtl">
      <Panel>
        <PanelHeader className="border-b flex flex-wrap gap-2">
          <PanelTitle className="text-base flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" /> اعضای سازمان من
          </PanelTitle>
          <PanelDescription className="col-span-full">
            فهرست اعضای سازمان فعال. امکان فیلتر و مدیریت نقش‌ها.
          </PanelDescription>
          {isLoading ? (
            <Skeleton className="h-4 w-28" />
          ) : org?.name ? (
            <span className="text-sm font-medium text-foreground/80">
              «{org.name}»
            </span>
          ) : null}
          {isLoading ? (
            <Skeleton className="h-5 w-16 rounded" />
          ) : org?.status ? (
            <OrganizationStatusBadge
              status={org.status as any}
              tone="soft"
              size="xs"
            />
          ) : null}
          {isLoading ? (
            <Skeleton className="h-5 w-20 rounded" />
          ) : org?.plan ? (
            <OrgPlanBadge plan={org.plan as any} tone="soft" size="xs" />
          ) : null}
        </PanelHeader>
        <PanelContent className="block">
          <ActiveOrgMembers />
        </PanelContent>
      </Panel>
    </div>
  );
}
