"use client";
import * as React from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { SessionManager } from "@/assessment/components/sessions";

export default function MyOrgSessionsPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = activeOrganizationId ?? null;
  // If no active org, render a friendly message
  if (!orgId) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        ابتدا یک سازمان فعال انتخاب کنید.
      </div>
    );
  }
  return <SessionManager organizationId={orgId} />;
}
