import { listUserOrganizations } from "@/app/organizations/organization/api/organization.api";
import type { Organization } from "@/app/organizations/organization/types/organization.types";

export async function fetchUserOrganizations(): Promise<Organization[]> {
  const res = await listUserOrganizations();
  return (res as any) || [];
}
