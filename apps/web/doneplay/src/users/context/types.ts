export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  // Add any other fields your getUser endpoint returns
  [key: string]: unknown;
}

export interface UserDataContextValue {
  user: AuthUser | null;
  userId: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
