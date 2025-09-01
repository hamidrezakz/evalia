import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeamMembershipService {
  constructor(private prisma: PrismaService) {}

  private async teamExists(orgId: number, teamId: number) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId: orgId, deletedAt: null },
    });
    if (!team)
      throw new NotFoundException({
        message: 'Team not found',
        code: 'TEAM_NOT_FOUND',
      });
    return team;
  }

  async list(orgId: number, teamId: number, page = 1, pageSize = 20) {
    await this.teamExists(orgId, teamId);
    const where = { teamId };
    const total = await this.prisma.teamMembership.count({ where });
    const items = await this.prisma.teamMembership.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data: items,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
  }

  async add(orgId: number, teamId: number, userId: number) {
    await this.teamExists(orgId, teamId);
    try {
      return await this.prisma.teamMembership.create({
        data: { teamId, userId },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException({
          message: 'User already in team',
          code: 'DUPLICATE_TEAM_MEMBERSHIP',
        });
      }
      throw e;
    }
  }

  async remove(orgId: number, teamId: number, membershipId: number) {
    await this.teamExists(orgId, teamId);
    const membership = await this.prisma.teamMembership.findFirst({
      where: { id: membershipId, teamId },
    });
    if (!membership)
      throw new NotFoundException({
        message: 'Team membership not found',
        code: 'TEAM_MEMBER_NOT_FOUND',
      });
    await this.prisma.teamMembership.delete({ where: { id: membershipId } });
    return { success: true };
  }
}
