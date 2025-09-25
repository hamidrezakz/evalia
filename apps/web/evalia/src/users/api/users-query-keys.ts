function stableStringify(obj: Record<string, unknown>) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc: Record<string, unknown>, k: string) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );
}

export const usersKeys = {
  all: ["users"] as const,
  lists: () => ["users", "list"] as const,
  list: (params?: Record<string, unknown>) =>
    ["users", "list", params ? stableStringify(params) : "all"] as const,
  detail: () => ["users", "detail"] as const,
  byId: (id: number) => ["users", "detail", id] as const,
  avatar: (id: number) => ["users", "avatar", id] as const,
  avatarImage: (absUrl: string) => ["users", "avatar-image", absUrl] as const,
  infinite: (base?: Record<string, unknown>, pageSize: number = 20) =>
    [
      "users",
      "infinite",
      base ? stableStringify(base) : "base",
      pageSize,
    ] as const,
};

export type UsersKeyFactory = typeof usersKeys;
