import { listUserOrganizations } from "@/organizations/organization/api/organization.api";
import type { Organization } from "@/organizations/organization/types/organization.types";

export async function fetchUserOrganizations(): Promise<Organization[]> {
  const res = await listUserOrganizations();
  return Array.isArray(res) ? (res as Organization[]) : [];
}
