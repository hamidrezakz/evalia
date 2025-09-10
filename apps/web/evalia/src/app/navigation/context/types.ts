import type {
  NavigationItemTree,
  PlatformRole,
  OrgRole,
} from "../types/navigation.types";

export interface NavigationContextValue {
  loading: boolean;
  error: string | null;
  items: NavigationItemTree[];
  activeRole: string | null; // unified role value from OrgContext
  activeRoleSource: "platform" | "organization" | null;
  refetch: () => Promise<void>;
  hasPath: (path: string) => boolean;
  findByPath: (path: string) => NavigationItemTree | undefined;
  flatten: () => NavigationItemTree[];
}
