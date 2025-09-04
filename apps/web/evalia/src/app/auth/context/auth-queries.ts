import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { authKeys } from "./auth-query-keys";
import { fetchUser, fetchOrganizations } from "./auth-apis";
import { AuthUser } from "./auth-types";

// Default stale times and cache control constants
const STALE_TIME_USER = 5 * 60 * 1000; // 5 minutes
const STALE_TIME_ORGS = 2 * 60 * 1000; // 2 minutes

export function useAuthUser(userId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: authKeys.user(userId || 0),
    queryFn: async () => {
      if (!userId) throw new Error("No user id");
      return fetchUser(userId) as Promise<AuthUser>;
    },
    enabled: enabled && !!userId,
    staleTime: STALE_TIME_USER,
    retry: 1,
  });
}

export function useAuthOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: authKeys.organizations(),
    queryFn: async () => fetchOrganizations(),
    enabled,
    staleTime: STALE_TIME_ORGS,
    retry: 1,
  });
}
