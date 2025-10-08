/**
 * Append organization id as ?orgId= or &orgId= to a REST path.
 * Does not mutate if orgId is null/undefined.
 */
export function appendOrgId(path: string, orgId?: number | null): string {
  if (!orgId) return path;
  return path + (path.includes("?") ? `&orgId=${orgId}` : `?orgId=${orgId}`);
}
