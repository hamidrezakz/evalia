// Central hierarchical React Query keys for user domain.
// Pattern mirrors organization query keys for consistency.
// Usage examples:
//  queryClient.invalidateQueries(usersKeys.lists());
//  queryClient.invalidateQueries(usersKeys.detail(5));

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...usersKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((acc: Record<string, unknown>, k: string) => {
                if (params && typeof params === "object" && k in params) {
                  acc[k] = (params as Record<string, unknown>)[k];
                }
                return acc;
                return acc;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => [...usersKeys.all, "detail"] as const,
  byId: (id: number) => [...usersKeys.detail(), id] as const,
  infinite: (base: Record<string, unknown> | undefined, pageSize: number) =>
    [
      ...usersKeys.all,
      "infinite",
      base
        ? JSON.stringify(
            Object.keys(base)
              .sort()
              .reduce((acc: Record<string, unknown>, k: string) => {
                if (base && typeof base === "object" && k in base) {
                  acc[k] = (base as Record<string, unknown>)[k];
                }
                return acc;
                return acc;
              }, {})
          )
        : "base",
      pageSize,
    ] as const,
};

export type UsersKeyFactory = typeof usersKeys;
