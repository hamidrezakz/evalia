// Central place for auth-related React Query keys to avoid typos and enable structured invalidation.
// Pattern: arrays so partial matching & hierarchical invalidation work.

export const authKeys = {
  all: ["auth"] as const,
  user: (id: number | null) => ["auth", "user", id] as const,
  organizations: () => ["auth", "organizations"] as const,
  navigation: () => ["navigation"] as const, // existing usage placeholder
};
