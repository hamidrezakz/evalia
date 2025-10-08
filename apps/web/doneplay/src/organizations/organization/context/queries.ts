import { useQuery } from "@tanstack/react-query";
import { fetchUserOrganizations } from "./api";
import type { Organization } from "@/organizations/organization/types/organization.types";

const STALE_TIME_ORGS = 2 * 60 * 1000; // 2 minutes

export function useOrganizations(enabled: boolean) {
  return useQuery<Organization[]>({
    queryKey: ["auth", "org", "list"],
    queryFn: fetchUserOrganizations,
    enabled,
    staleTime: STALE_TIME_ORGS,
    retry: (failureCount, error: any) => {
      // Avoid hammering endpoint if forbidden
      if (error?.status === 403 || error?.status === 401) return false;
      return failureCount < 2; // retry up to 2 times
    },
  });
}
