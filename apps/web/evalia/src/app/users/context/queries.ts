import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserById } from "./api";
import type { AuthUser } from "./types";

export function useUserData(userId: number | null, enabled: boolean) {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "user", userId],
    queryFn: () => (userId ? fetchUserById(userId) : Promise.resolve(null)),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60, // 1 min
    gcTime: 1000 * 60 * 5,
  });
}

export function useInvalidateUser(userId: number | null) {
  const qc = useQueryClient();
  return () => {
    if (userId) qc.invalidateQueries({ queryKey: ["auth", "user", userId] });
  };
}
