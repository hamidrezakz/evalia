// Centralized auth-related TypeScript types to keep AuthContext clean and focused.
// If backend token payload shape changes, update here only.

export interface OrgRoleEntry {
  orgId: number;
  role: string; // e.g., 'ADMIN', 'MEMBER'
}

export interface AccessTokenPayload {
  sub: number | string; // user id (jwt subject)
  type: "access";
  roles: {
    global: string[]; // platform-level roles
    org: OrgRoleEntry[]; // per-organization roles (one entry per membership)
  };
  tokenVersion: number; // used for invalidation
  exp?: number; // standard jwt exp (seconds epoch)
  iat?: number; // issued at
  [key: string]: any; // forward compatibility for future claims
}

export interface ActiveSelection {
  organizationId: number | null;
  platformRole: string | null;
  orgRole: string | null; // org-scoped role currently in use
}

// Minimal user shape (extend when backend adds more fields)
export interface AuthUser {
  id: number;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  [key: string]: any;
}

export interface AuthContextValue {
  accessToken: string | null;
  refreshToken: string | null;
  decoded: AccessTokenPayload | null;
  userId: number | null;
  user: AuthUser | null;
  organizations: any[]; // Replace with concrete Organization type when available
  active: ActiveSelection;
  loading: boolean;
  error: string | null;
  platformRoles: string[];
  organizationRoles: Record<number, string[]>; // orgId -> roles[]
  setActiveOrganization: (orgId: number | null) => void;
  setActivePlatformRole: (role: string | null) => void;
  setActiveOrgRole: (role: string | null) => void;
  refetchAll: () => Promise<void>;
  signOut: () => void;
  isTokenExpired: () => boolean;
}
