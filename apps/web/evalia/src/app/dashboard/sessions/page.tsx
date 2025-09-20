"use client";
import * as React from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { SessionManager } from "@/assessment/components/sessions";

export default function SessionsPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = Number(activeOrganizationId || 0);
  return <SessionManager organizationId={orgId} />;
}
