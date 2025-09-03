export type GlobalRole = "SUPER_ADMIN" | "USER";
export type OrgScopedRole = "OWNER" | "MANAGER" | "MEMBER";

export interface UserRoles {
  global: GlobalRole[];
  org?: { orgId: number; role: OrgScopedRole }[];
}

// Feature keys for gating UI pieces
export type FeatureKey =
  | "org.create"
  | "org.manage"
  | "team.create"
  | "team.manage"
  | "member.manage"
  | "admin.area";

// Mapping of features to allowed roles
const featureMatrix: Record<
  FeatureKey,
  { global?: GlobalRole[]; org?: OrgScopedRole[] }
> = {
  "org.create": { global: ["SUPER_ADMIN"] },
  "org.manage": { global: ["SUPER_ADMIN"] },
  "team.create": { org: ["OWNER", "MANAGER"] },
  "team.manage": { org: ["OWNER", "MANAGER"] },
  "member.manage": { org: ["OWNER", "MANAGER"] },
  "admin.area": { global: ["SUPER_ADMIN"] },
};

export function canUseFeature(
  feature: FeatureKey,
  roles: UserRoles,
  activeOrgId?: number
): boolean {
  const rule = featureMatrix[feature];
  if (!rule) return false;
  if (rule.global && rule.global.some((r) => roles.global?.includes(r)))
    return true;
  if (rule.org && activeOrgId) {
    const orgRole = roles.org?.find((o) => o.orgId === activeOrgId)?.role;
    if (orgRole && rule.org.includes(orgRole)) return true;
  }
  return false;
}
