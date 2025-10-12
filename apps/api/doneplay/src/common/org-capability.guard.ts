import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import {
  ORG_CAPABILITY_KEY,
  OrgCapabilityRequirement,
} from './require-org-capability.decorator';

@Injectable()
export class OrgCapabilityGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const meta = this.reflector.get<OrgCapabilityRequirement>(
      ORG_CAPABILITY_KEY,
      context.getHandler(),
    );
    if (!meta) return true; // no requirement
    const { capability, orgIdParam = 'id' } = meta;
    const raw = req.params?.[orgIdParam];
    const orgId = Number(raw);
    if (!orgId || Number.isNaN(orgId)) {
      throw new ForbiddenException('Invalid organization id');
    }
    const has = await this.prisma.organizationCapabilityAssignment.findFirst({
      where: {
        organizationId: orgId,
        capability: capability as any,
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
