import type { Organization } from "@/organizations/organization/types/organization.types";

export interface OrgStateValue {
  organizations: Organization[];
  organizationRoles: Record<number, string[]>; // from token payload (injected)
  platformRoles: string[]; // from token payload (injected)
  activeOrganizationId: number | null;
  // Unified active role (either a platform role OR an org role)
  activeRole: string | null;
  // Indicates where the activeRole came from: 'platform' | 'organization' | null
  activeRoleSource: "platform" | "organization" | null;
  loading: boolean;
  error: string | null;
  setActiveOrganization: (orgId: number | null) => void;
  // Set a platform role as active (clears org role context)
  setPlatformActiveRole: (role: string | null) => void;
  // Set an organization role as active (and optionally ensure organizationId set)
  setOrganizationActiveRole: (
    role: string | null,
    orgId?: number | null
  ) => void;
  refreshOrganizations: () => Promise<void>;
}
