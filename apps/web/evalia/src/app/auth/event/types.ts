// Inline AccessTokenPayload type for independence
export interface OrgRoleEntry {
  orgId: number;
  roles: string[];
}

export interface AccessTokenPayload {
  sub: number | string;
  exp: number;
  roles: {
    global: string[];
    org: OrgRoleEntry[];
  };
  [key: string]: any;
}

export interface AuthSessionValue {
  accessToken: string | null;
  refreshToken: string | null;
  decoded: AccessTokenPayload | null;
  userId: number | null;
  isTokenExpired: () => boolean;
  signOut: () => void;
  attemptRefresh: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}
