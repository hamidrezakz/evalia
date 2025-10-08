/**
 * Append organization id using the canonical query param `organizationId`.
 * For backward compatibility we ALSO include the legacy `orgId` param until
 * the backend permanently drops support for it. This avoids 400 validation
 * errors on DTOs expecting `organizationId` while still satisfying any
 * endpoints that (temporarily) only parse `orgId`.
 *
 * Rules:
 * - If orgId is falsy (null/undefined/0) return the original path unchanged.
 * - If path already contains either organizationId= or orgId= we do not duplicate.
 * - Otherwise we append both organizationId=<id>&orgId=<id> (organizationId first).
 */
export function appendOrgId(path: string, orgId?: number | null): string {
  if (!orgId) return path;
  const hasCanonical = /[?&]organizationId=/.test(path);
  const hasLegacy = /[?&]orgId=/.test(path);
  let out = path;
  if (!hasCanonical) {
    out += out.includes("?")
      ? `&organizationId=${orgId}`
      : `?organizationId=${orgId}`;
  }
  if (!hasLegacy) {
    out += out.includes("?") ? `&orgId=${orgId}` : `?orgId=${orgId}`;
  }
  return out;
}
