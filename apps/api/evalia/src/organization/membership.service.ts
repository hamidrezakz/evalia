import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrgRole } from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async list(
    orgId: number,
    page = 1,
    pageSize = 20,
    role?: OrgRole,
    q?: string,
  ) {
    const where: any = { organizationId: orgId, deletedAt: null };
    if (role) where.role = role;
    if (q) where.user = { fullName: { contains: q, mode: 'insensitive' } };
    const total = await this.prisma.organizationMembership.count({ where });
    const items = await this.prisma.organizationMembership.findMany({
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

  async add(orgId: number, dto: AddMemberDto) {
    // Ensure organization exists
    const org = await this.prisma.organization.findFirst({
      where: { id: orgId, deletedAt: null },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND',
      });
    try {
      return await this.prisma.organizationMembership.create({
        data: {
          organizationId: orgId,
          userId: dto.userId,
          role: dto.role,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException({
          message: 'User already member',
          code: 'DUPLICATE_ORG_MEMBERSHIP',
        });
      }
      throw e;
    }
  }

  async update(orgId: number, membershipId: number, dto: UpdateMemberRoleDto) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { id: membershipId, organizationId: orgId },
    });
    if (!membership)
      throw new NotFoundException({
        message: 'Membership not found',
        code: 'MEMBER_NOT_FOUND',
      });
    if (!dto.role) return membership;
    // (Optional) enforce at least one OWNER stays
    if (membership.role === 'OWNER' && dto.role !== 'OWNER') {
      const owners = await this.prisma.organizationMembership.count({
        where: { organizationId: orgId, role: 'OWNER' },
      });
      if (owners <= 1) {
        throw new BadRequestException({
          message: 'Last owner cannot be downgraded',
          code: 'LAST_OWNER_FORBIDDEN',
        });
      }
    }
    return this.prisma.organizationMembership.update({
      where: { id: membershipId },
      data: { role: dto.role },
    });
  }

  async remove(orgId: number, membershipId: number) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { id: membershipId, organizationId: orgId },
    });
    if (!membership)
      throw new NotFoundException({
        message: 'Membership not found',
        code: 'MEMBER_NOT_FOUND',
      });
    // Check owner constraint
    if (membership.role === 'OWNER') {
      const owners = await this.prisma.organizationMembership.count({
        where: {
          organizationId: orgId,
          role: 'OWNER',
          id: { not: membershipId },
        },
      });
      if (owners === 0) {
        throw new BadRequestException({
          message: 'Cannot remove last owner',
          code: 'LAST_OWNER_FORBIDDEN',
        });
      }
    }
    await this.prisma.organizationMembership.delete({
      where: { id: membershipId },
    });
    return { success: true };
  }
}
