"use client";
import * as React from "react";
import ActiveOrgMembers from "@/organizations/organization/components/ActiveOrgMembers";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { OrganizationStatusBadge } from "@/components/status-badges";

export default function MyOrgPage() {
  const { activeOrganizationId } = useOrgState();
  const { data: org } = useOrganization(
    activeOrganizationId ?? null,
    !!activeOrganizationId
  );
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">اعضای سازمان من</h1>
          {org?.name ? (
            <span className="text-sm text-muted-foreground">«{org.name}»</span>
          ) : null}
          {org?.status ? (
            <OrganizationStatusBadge
              status={org.status as any}
              tone="soft"
              size="xs"
            />
          ) : null}
        </div>
        <p className="text-[12px] text-muted-foreground mt-1">
          فهرست اعضای سازمان فعال شما. می‌توانید بر اساس وضعیت و نقش‌ها فیلتر
          کنید و نقش‌های سازمانی را به‌صورت سریع تغییر دهید.
        </p>
      </div>
      <ActiveOrgMembers />
    </div>
  );
}
