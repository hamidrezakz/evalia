// React Query key factories for organization domain. Keep hierarchical for broad invalidation.
// Usage: queryClient.invalidateQueries(orgKeys.lists());

export const orgKeys = {
  all: ["organizations"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [...orgKeys.lists(), params ? JSON.stringify(params) : "all"] as const,
  detail: () => [...orgKeys.all, "detail"] as const,
  byId: (id: number) => [...orgKeys.detail(), id] as const,
  userMembership: () => [...orgKeys.all, "user-membership"] as const,
};
