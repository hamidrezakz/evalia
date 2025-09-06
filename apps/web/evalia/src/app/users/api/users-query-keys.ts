// Central hierarchical React Query keys for user domain.
// Pattern mirrors organization query keys for consistency.
// Usage examples:
//  queryClient.invalidateQueries(usersKeys.lists());
//  queryClient.invalidateQueries(usersKeys.detail(5));

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: Record<string, any> | undefined) =>
    [
      ...usersKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((acc: any, k) => {
                acc[k] = (params as any)[k];
                return acc;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => [...usersKeys.all, "detail"] as const,
  byId: (id: number) => [...usersKeys.detail(), id] as const,
  infinite: (base: Record<string, any> | undefined, pageSize: number) =>
    [
      ...usersKeys.all,
      "infinite",
      base
        ? JSON.stringify(
            Object.keys(base)
              .sort()
              .reduce((acc: any, k) => {
                acc[k] = (base as any)[k];
                return acc;
              }, {})
          )
        : "base",
      pageSize,
    ] as const,
};

export type UsersKeyFactory = typeof usersKeys;
