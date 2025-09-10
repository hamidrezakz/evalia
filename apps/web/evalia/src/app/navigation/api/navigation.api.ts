import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import {
  navigationTreeResponseSchema,
  buildNavigationQuery,
  type NavigationItemTree,
  type PlatformRole,
  type OrgRole,
} from "../types/navigation.types";

/**
 * Get navigation tree for a specific role (platformRole OR orgRole chosen by backend parameter).
 */
export async function getNavigationTreeForRole(opts: {
  platformRole?: PlatformRole;
  orgRole?: OrgRole;
  includeInactive?: boolean;
  flat?: boolean;
}): Promise<NavigationItemTree[]> {
  const qs = buildNavigationQuery({
    platformRole: opts.platformRole,
    orgRole: opts.orgRole,
    includeInactive: opts.includeInactive,
    flat: opts.flat,
  });
  const res = await apiRequest(
    "/navigation/tree" + qs,
    null,
    navigationTreeResponseSchema
  );
  const validated = navigationTreeResponseSchema.safeParse(res.data);
  if (!validated.success) throw new Error("Navigation tree validation failed");
  return validated.data.data;
}
