export const organizationMembershipKeys = {
  all: ["org-memberships"] as const,
  lists: (orgId: number) =>
    [...organizationMembershipKeys.all, orgId, "list"] as const,
  list: (orgId: number, params?: Record<string, any>) =>
    [...organizationMembershipKeys.lists(orgId), params || {}] as const,
  detail: (orgId: number, membershipId: number) =>
    [...organizationMembershipKeys.all, orgId, "detail", membershipId] as const,
};
