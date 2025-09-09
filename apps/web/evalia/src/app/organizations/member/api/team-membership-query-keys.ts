// React Query hierarchical keys for team membership domain
// Scope: per organization and per team to avoid cross-org/team collisions.

export const teamMembershipKeys = {
  all: (orgId: number) => ["organizations", orgId, "teams"] as const,
  team: (orgId: number, teamId: number) =>
    [...teamMembershipKeys.all(orgId), teamId] as const,
  lists: (orgId: number, teamId: number) =>
    [...teamMembershipKeys.team(orgId, teamId), "members", "list"] as const,
  list: (
    orgId: number,
    teamId: number,
    params: { page?: number; pageSize?: number } | undefined
  ) =>
    [
      ...teamMembershipKeys.lists(orgId, teamId),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((acc: any, k) => {
                (acc as any)[k] = (params as any)[k];
                return acc;
              }, {})
          )
        : "all",
    ] as const,
  detail: (orgId: number, teamId: number) =>
    [...teamMembershipKeys.team(orgId, teamId), "members", "detail"] as const,
  byId: (orgId: number, teamId: number, membershipId: number) =>
    [...teamMembershipKeys.detail(orgId, teamId), membershipId] as const,
};

export type TeamMembershipKeyFactory = typeof teamMembershipKeys;
