"use client";
import * as React from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { SessionAssignmentsPanel } from "@/assessment/components/sessions";

export default function SessionsAssignmentsPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = Number(activeOrganizationId || 0);

  return (
    <div className="flex flex-col gap-4">
      <SessionAssignmentsPanel organizationId={orgId} sessionId={null} />
    </div>
  );
}
