// Hierarchical query keys for Teams (scoped by org)
export const teamKeys = {
  all: (orgId: number) => ["organizations", orgId, "teams"] as const,
  lists: (orgId: number) => [...teamKeys.all(orgId), "list"] as const,
  list: (
    orgId: number,
    params:
      | {
          page?: number;
          pageSize?: number;
          q?: string;
          includeDeleted?: boolean;
        }
      | undefined
  ) =>
    [
      ...teamKeys.lists(orgId),
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
  detail: (orgId: number) => [...teamKeys.all(orgId), "detail"] as const,
  byId: (orgId: number, teamId: number) =>
    [...teamKeys.detail(orgId), teamId] as const,
};

export type TeamKeyFactory = typeof teamKeys;
