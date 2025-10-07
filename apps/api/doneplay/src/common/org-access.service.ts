import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrgAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ensure user is member of org or has SUPER_ADMIN global role */
  async ensureMemberOrSuperAdmin(userId: number | undefined, orgId: number) {
    if (!userId) throw new ForbiddenException('unauthorized');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { globalRoles: true },
    });
    if (user?.globalRoles?.includes('SUPER_ADMIN')) return;
    const m = await this.prisma.organizationMembership.findFirst({
      where: { userId, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });
    if (!m) throw new ForbiddenException('Not a member of this organization');
  }
}
