import { SetMetadata } from '@nestjs/common';
import type { OrgRole } from '@prisma/client';

export const ORG_CONTEXT_OPTIONS = 'org_context_options';

export interface OrgContextSources {
  /** Read org id from route params by this key (e.g., 'orgId' or 'organizationId') */
  paramKey?: string;
  /** Read org id from query string by this key */
  queryKey?: string;
  /** Read org id from request body by this key */
  bodyKey?: string;
  /** Read org id from a specific header (e.g., 'x-org-id') */
  headerKey?: string;
  /** When true, only use the provided keys and skip default fallbacks */
  strict?: boolean;
}

export interface OrgContextOptions {
  /** Make org resolution/membership optional for this route */
  optional?: boolean;
  /** Custom sources for resolving organization id */
  sources?: OrgContextSources;
  /** Require that the user has these org roles in the resolved organization */
  requireOrgRoles?: OrgRole[];
  /** Role matching mode: any (default) or all */
  requireMode?: 'any' | 'all';
}

/**
 * Configure OrgContextGuard behavior per-route.
 *
 * Examples:
 *  - Basic (use defaults):
 *    @UseGuards(OrgContextGuard)
 *
 *  - Custom source keys (query 'organizationId'):
 *    @OrgContext({ sources: { queryKey: 'organizationId' } })
 *
 *  - Strict custom sources (no heuristics fallback):
 *    @OrgContext({ sources: { bodyKey: 'orgId', strict: true } })
 *
 *  - Optional org (do not error when org is missing and skip membership checks):
 *    @OrgContext({ optional: true })
 *
 *  - Require org roles (OWNER or MANAGER allowed):
 *    @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
 */
export function OrgContext(options: OrgContextOptions) {
  return SetMetadata(ORG_CONTEXT_OPTIONS, options);
}
