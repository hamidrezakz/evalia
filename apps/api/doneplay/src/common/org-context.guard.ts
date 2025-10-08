import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';

// Metadata key (optional future use for allowing endpoints without org)
export const ORG_OPTIONAL_KEY = 'org_optional';

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Source priority:
    // 1) Explicit :orgId / :organizationId route params
    // 2) Query string ?orgId=
    // 3) Derive from JWT active organization membership if single / explicitly flagged
    // (header x-org-id intentionally omitted for simplicity)
    let raw =
      // Explicit route params
      req.params?.orgId ||
      req.params?.organizationId ||
      // Query params
      req.query?.orgId ||
      (req.query?.organizationId as any) ||
      // Body (create / update workflows)
      req.body?.orgId ||
      req.body?.organizationId ||
      // Custom header (front-end can send x-org-id)
      req.headers['x-org-id'];

    if (Array.isArray(raw)) raw = raw[0];
    const optional = this.reflector.getAllAndOverride<boolean>(
      ORG_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!raw) {
      // Try to infer from JWT memberships if only one org or an 'activeOrgId' claim exists
      const user = req.user;
      if (user) {
        const roles = user.roles || { org: [] };
        const orgMemberships: any[] = Array.isArray(roles.org) ? roles.org : [];
        // Support tokens that carry an activeOrgId claim directly
        if (user.activeOrgId) {
          raw = user.activeOrgId;
        } else if (orgMemberships.length === 1 && orgMemberships[0]?.orgId) {
          raw = orgMemberships[0].orgId;
        }
      }
      if (!raw) {
        // Fallback: if route has an :id for a resource we can resolve organizationId from DB (sessions/templates)
        const idParam = req.params?.id;
        const idNum = idParam ? Number(idParam) : undefined;
        if (idNum && Number.isFinite(idNum)) {
          try {
            // Determine resource type from baseUrl
            const base: string = req.baseUrl || '';
            if (base.includes('/sessions')) {
              const s = await this.prisma.assessmentSession.findUnique({
                where: { id: idNum },
                select: { organizationId: true },
              });
              if (s) raw = s.organizationId;
            } else if (base.includes('/templates')) {
              const t = await this.prisma.assessmentTemplate.findUnique({
                where: { id: idNum },
                select: { createdByOrganizationId: true },
              });
              if (t?.createdByOrganizationId) raw = t.createdByOrganizationId;
            }
          } catch (_) {
            // swallow - fallback only
          }
        }
        if (!raw) {
          if (optional) return true;
          throw new BadRequestException(
            'Missing organization identifier (?orgId=, ?organizationId=, body.organizationId or inferable membership)',
          );
        }
      }
    }
    const parsed = Number(raw);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid organization id');
    }
    // Attach to request for downstream decorators / services
    req.orgId = parsed;

    // Membership validation via JWT (if user + roles present)
    const user = req.user;
    if (!user) return true; // JwtAuthGuard should normally populate; if not, let other guards decide
    const roles = user.roles || { global: [], org: [] };
    // SUPER_ADMIN bypass
    if (Array.isArray(roles.global) && roles.global.includes('SUPER_ADMIN'))
      return true;

    // org memberships can be legacy {orgId, role} or new {orgId, roles: []}
    const orgMemberships: any[] = Array.isArray(roles.org) ? roles.org : [];
    const hasOrg = orgMemberships.some((m) => {
      if (!m) return false;
      // Supported shapes:
      // { orgId }
      // { organizationId }
      // { org: { id } }
      // { organization: { id } }
      // primitive id (rare)
      let oid: any = undefined;
      if (typeof m === 'number' || typeof m === 'string') oid = m;
      else if (m.orgId !== undefined) oid = m.orgId;
      else if (m.organizationId !== undefined) oid = m.organizationId;
      else if (m.org?.id !== undefined) oid = m.org.id;
      else if (m.organization?.id !== undefined) oid = m.organization.id;
      if (oid === undefined) return false;
      const num = Number(oid);
      return Number.isFinite(num) && num === parsed;
    });
    if (!hasOrg) {
      if (optional) return true; // allow optional endpoints to proceed silently
      throw new ForbiddenException('You are not a member of this organization');
    }
    return true;
  }
}
