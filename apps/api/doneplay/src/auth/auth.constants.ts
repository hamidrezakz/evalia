// Centralized auth-related constants to avoid secret mismatch issues.
// If JWT_ACCESS_SECRET env is not set, we fall back to this explicit development secret.
// IMPORTANT: For production always set JWT_ACCESS_SECRET in environment (.env) and do NOT rely on fallback.
export const DEFAULT_JWT_ACCESS_SECRET = 'dev_jwt_secret_change_me';

export function resolveAccessSecret(): string {
  const fromEnv = process.env.JWT_ACCESS_SECRET;
  if (!fromEnv) {
    if (process.env.NODE_ENV !== 'production') {
      // Lightweight dev-only warning (avoid noisy logs in prod)
      // eslint-disable-next-line no-console
      console.warn(
        '[auth] JWT_ACCESS_SECRET not set – using development fallback. DO NOT USE IN PRODUCTION.',
      );
    }
    return DEFAULT_JWT_ACCESS_SECRET;
  }
  return fromEnv;
}
