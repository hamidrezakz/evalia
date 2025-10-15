import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  mixin,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type OrgIdSource = { source: 'param' | 'body'; key: string };

/**
 * Guard factory to enforce that a specific organization (from params/body)
 * has one of the required capabilities before allowing the request.
 *
 * Usage:
 *  @UseGuards(OrgCapabilityGuardFor('MASTER', { source: 'body', key: 'parentOrganizationId' }))
 *  @UseGuards(OrgCapabilityGuardFor(['MASTER','ANOTHER'], { source: 'param', key: 'id' }))
 */
export function OrgCapabilityGuardFor(
  capabilities: string[] | string,
  orgId: OrgIdSource,
): Type<CanActivate> {
  const required = Array.isArray(capabilities) ? capabilities : [capabilities];

  @Injectable()
  class CapabilityGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const raw =
        orgId.source === 'param'
          ? req.params?.[orgId.key]
          : req.body?.[orgId.key];
      const organizationId = Number(raw);
      if (!organizationId || Number.isNaN(organizationId)) {
        throw new ForbiddenException('Invalid organization id');
      }
      const has = await this.prisma.organizationCapabilityAssignment.findFirst({
        where: {
          organizationId,
          capability: { in: required as any },
          active: true,
        },
        select: { id: true },
      });
      if (!has) {
        throw new ForbiddenException('Organization lacks required capability');
      }
      return true;
    }
  }

  return mixin(CapabilityGuard);
}
