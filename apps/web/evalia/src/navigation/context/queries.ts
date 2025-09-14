import { useQuery } from "@tanstack/react-query";
import { fetchNavigationForActiveRole } from "./api";
import type { NavigationItemTree } from "../types/navigation.types";

export function useNavigationTree(
  activeRole: string | null,
  source: "platform" | "organization" | null
) {
  return useQuery<NavigationItemTree[]>({
    queryKey: ["navigation", "tree", source, activeRole],
    queryFn: () => fetchNavigationForActiveRole(activeRole, source),
    enabled: !!activeRole && !!source,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
