import { getNavigationTreeForRole } from "../api/navigation.api";
import type {
  PlatformRole,
  OrgRole,
  NavigationItemTree,
} from "../types/navigation.types";

export async function fetchNavigationForActiveRole(
  activeRole: string | null,
  source: "platform" | "organization" | null
): Promise<NavigationItemTree[]> {
  if (!activeRole || !source) return [];
  if (source === "platform") {
    return await getNavigationTreeForRole({
      platformRole: activeRole as PlatformRole,
    });
  }
  return await getNavigationTreeForRole({ orgRole: activeRole as OrgRole });
}
