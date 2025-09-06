import { QueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth-query-keys";

// Centralized helper to refetch all auth-related queries. This keeps the logic
// in one place so components / context can just call unifiedAuthRefetch(queryClient, userId).
// Extend this file when adding new auth-scoped caches (e.g. permissions, navigation trees, etc.).

export async function unifiedAuthRefetch(
  queryClient: QueryClient,
  userId: number | null
) {
  await Promise.all([
    queryClient.refetchQueries({ queryKey: authKeys.user(userId || 0) }),
    queryClient.refetchQueries({ queryKey: authKeys.organizations() }),
    queryClient.refetchQueries({
      queryKey: authKeys.navigation(),
      type: "active",
    }),
  ]);
}

// Optionally expose an invalidate variant if needed elsewhere.
export async function invalidateAuthData(
  queryClient: QueryClient,
  userId: number | null
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: authKeys.user(userId || 0) }),
    queryClient.invalidateQueries({ queryKey: authKeys.organizations() }),
    queryClient.invalidateQueries({ queryKey: authKeys.navigation() }),
  ]);
}
