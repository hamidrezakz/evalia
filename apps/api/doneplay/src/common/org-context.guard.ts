import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Metadata key (optional future use for allowing endpoints without org)
export const ORG_OPTIONAL_KEY = 'org_optional';

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Source priority: explicit orgId/organizationId in route params, then query ?orgId=
    // (header form x-org-id removed per simplified design)
    let raw =
      req.params?.orgId || req.params?.organizationId || req.query?.orgId;

    if (Array.isArray(raw)) raw = raw[0];
    const optional = this.reflector.getAllAndOverride<boolean>(
      ORG_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!raw) {
      if (optional) return true;
      throw new BadRequestException(
        'Missing organization identifier (?orgId= or :orgId param)',
      );
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
      if (typeof m.orgId === 'number') return m.orgId === parsed; // numeric form
      if (typeof m.orgId === 'string') return Number(m.orgId) === parsed; // string form
      return false;
    });
    if (!hasOrg) {
      if (optional) return true; // allow optional endpoints to proceed silently
      throw new ForbiddenException('You are not a member of this organization');
    }
    return true;
  }
}
