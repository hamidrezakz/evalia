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
}): Promise<NavigationItemTree[]> {
  const qs = buildNavigationQuery({
    platformRole: opts.platformRole,
    orgRole: opts.orgRole,
    includeInactive: opts.includeInactive,
  });
  const res = await apiRequest(
    "/navigation/tree" + qs,
    null,
    navigationTreeResponseSchema
  );
  // اعتبارسنجی قبلاً در apiRequest انجام شده و اگر خطا باشد throw می‌شود
  return res.data;
}