import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import type { OrgRole } from '@prisma/client';
import {
  ORG_CONTEXT_OPTIONS,
  type OrgContextOptions,
} from './org-context.decorator';

// Metadata key (optional future use for allowing endpoints without org)
export const ORG_OPTIONAL_KEY = 'org_optional';

/**
 * OrgContextGuard
 *
 * Responsibilities:
 *  - Resolve organization id (orgId) from request (param/query/body/header)
 *  - Optionally infer from JWT or DB fallbacks (sessions/templates)
 *  - Attach req.orgId for downstream use (@OrgId decorator)
 *  - Validate user membership in that organization (unless optional)
 *  - Optionally require specific org roles for access (OWNER/MANAGER/...)
 *
 * Usage examples:
 *  - Default behavior with fallbacks:
 *      @UseGuards(OrgContextGuard)
 *  - Custom keys (query 'organizationId'):
 *      @OrgContext({ sources: { queryKey: 'organizationId' } })
 *      @UseGuards(OrgContextGuard)
 *  - Strict body key only:
 *      @OrgContext({ sources: { bodyKey: 'orgId', strict: true } })
 *  - Optional (no error if org missing, skip membership checks):
 *      @OrgContext({ optional: true })
 *  - Require org roles (any of):
 *      @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
 *  - Require org roles (all):
 *      @OrgContext({ requireOrgRoles: ['OWNER','MANAGER'], requireMode: 'all' })
 */

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Route-level options
    const options = (this.reflector.getAllAndOverride<
      OrgContextOptions | undefined
    >(ORG_CONTEXT_OPTIONS, [context.getHandler(), context.getClass()]) ||
      {}) as OrgContextOptions;
    const optionalMeta = this.reflector.getAllAndOverride<boolean>(
      ORG_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );
    const optional = options.optional ?? optionalMeta ?? false;

    const raw = this.resolveOrgIdFromRequest(req, options);
    let orgId: number | null = this.normalizeOrgId(raw);
    if (!raw) {
      orgId = await this.inferOrgId(req, options);
    }
    if (!orgId) {
      if (optional) return true;
      throw new BadRequestException(
        'Missing organization identifier (param/query/body/header or inferable membership)',
      );
    }
    // Attach to request
    req.orgId = orgId;

    // Membership validation via JWT (if user + roles present)
    const user = req.user;
    if (!user) return true; // Typically JwtAuthGuard populates; allow through if absent
    const roles = user.roles || { global: [], org: [] };
    // SUPER_ADMIN bypass
    if (Array.isArray(roles.global) && roles.global.includes('SUPER_ADMIN'))
      return true;

    // org memberships can be legacy {orgId, role} or new {orgId, roles: []}
    const orgMemberships: any[] = Array.isArray(roles.org) ? roles.org : [];
    const membership = this.findOrgMembership(orgMemberships, orgId);
    if (!membership) {
      if (optional) return true;
      throw new ForbiddenException('You are not a member of this organization');
    }

    // If specific org roles required, validate
    if (options.requireOrgRoles && options.requireOrgRoles.length > 0) {
      const reqRoles = options.requireOrgRoles as OrgRole[];
      const mode = options.requireMode || 'any';
      const has = this.hasRequiredOrgRoles(membership, reqRoles, mode);
      if (!has) {
        throw new ForbiddenException(
          'Insufficient organization role for this operation',
        );
      }
    }
    return true;
  }

  // -------- Helpers --------
  private resolveOrgIdFromRequest(req: any, options: OrgContextOptions) {
    const s = options.sources || {};
    const tryRead = (val: any) => (Array.isArray(val) ? val[0] : val);
    // Custom keys first (if provided)
    if (s.paramKey && req.params) {
      const v = tryRead(req.params[s.paramKey]);
      if (v != null) return v;
    }
    if (s.queryKey && req.query) {
      const v = tryRead(req.query[s.queryKey]);
      if (v != null) return v;
    }
    if (s.bodyKey && req.body) {
      const v = tryRead(req.body[s.bodyKey]);
      if (v != null) return v;
    }
    if (s.headerKey && req.headers) {
      const v = tryRead(req.headers[s.headerKey.toLowerCase()]);
      if (v != null) return v;
    }
    if (s.strict) return null;
    // Default fallbacks (previous behavior)
    const fallback =
      req.params?.orgId ||
      req.params?.organizationId ||
      req.query?.orgId ||
      (req.query?.organizationId as any) ||
      req.body?.orgId ||
      req.body?.organizationId ||
      req.headers?.['x-org-id'];
    return tryRead(fallback);
  }

  private normalizeOrgId(raw: any): number | null {
    if (raw == null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      throw new BadRequestException('Invalid organization id');
    }
    return n;
  }

  private async inferOrgId(
    req: any,
    options: OrgContextOptions,
  ): Promise<number | null> {
    // Infer from JWT memberships
    const user = req.user;
    if (user) {
      if (user.activeOrgId) return this.normalizeOrgId(user.activeOrgId);
      const orgMemberships: any[] = Array.isArray(user.roles?.org)
        ? user.roles.org
        : [];
      if (orgMemberships.length === 1 && orgMemberships[0]?.orgId) {
        return this.normalizeOrgId(orgMemberships[0].orgId);
      }
    }
    // Infer from DB via resource id in path
    const idParam = req.params?.id;
    const idNum = idParam ? Number(idParam) : undefined;
    if (idNum && Number.isFinite(idNum)) {
      try {
        const base: string = req.baseUrl || '';
        if (base.includes('/sessions')) {
          const s = await this.prisma.assessmentSession.findUnique({
            where: { id: idNum },
            select: { organizationId: true },
          });
          if (s) return this.normalizeOrgId(s.organizationId);
        } else if (base.includes('/templates')) {
          const t = await this.prisma.assessmentTemplate.findUnique({
            where: { id: idNum },
            select: { createdByOrganizationId: true },
          });
          if (t?.createdByOrganizationId)
            return this.normalizeOrgId(t.createdByOrganizationId);
        }
      } catch (_) {
        // ignore fallback errors
      }
    }
    return null;
  }

  private findOrgMembership(memberships: any[], orgId: number) {
    for (const m of memberships) {
      if (!m) continue;
      let oid: any = undefined;
      if (typeof m === 'number' || typeof m === 'string') oid = m;
      else if (m.orgId !== undefined) oid = m.orgId;
      else if (m.organizationId !== undefined) oid = m.organizationId;
      else if (m.org?.id !== undefined) oid = m.org.id;
      else if (m.organization?.id !== undefined) oid = m.organization.id;
      const num = Number(oid);
      if (Number.isFinite(num) && num === orgId) return m;
    }
    return null;
  }

  private hasRequiredOrgRoles(
    membership: any,
    required: OrgRole[],
    mode: 'any' | 'all' = 'any',
  ): boolean {
    // membership shapes: { roles: OrgRole[] } | { role: OrgRole } | {}
    const roles: OrgRole[] = Array.isArray(membership?.roles)
      ? membership.roles
      : membership?.role
        ? [membership.role]
        : [];
    if (required.length === 0) return true;
    const have = new Set(roles as OrgRole[]);
    if (mode === 'all') return required.every((r) => have.has(r));
    return required.some((r) => have.has(r));
  }
}
