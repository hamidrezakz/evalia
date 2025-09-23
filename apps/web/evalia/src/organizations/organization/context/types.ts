import type { Organization } from "@/organizations/organization/types/organization.types";
import type { PlatformRole, OrgRole } from "@/lib/enums";

export interface OrgStateValue {
  organizations: Organization[];
  organizationRoles: Record<number, OrgRole[]>; // from token payload (injected)
  platformRoles: PlatformRole[]; // from token payload (injected)
  activeOrganizationId: number | null;
  // Unified active role (either a platform role OR an org role)
  activeRole: PlatformRole | OrgRole | null;
  // Indicates where the activeRole came from: 'platform' | 'organization' | null
  activeRoleSource: "platform" | "organization" | null;
  loading: boolean;
  error: string | null;
  setActiveOrganization: (orgId: number | null) => void;
  // Set a platform role as active (clears org role context)
  setPlatformActiveRole: (role: PlatformRole | null) => void;
  // Set an organization role as active (and optionally ensure organizationId set)
  setOrganizationActiveRole: (
    role: OrgRole | null,
    orgId?: number | null
  ) => void;
  refreshOrganizations: () => Promise<void>;
}
