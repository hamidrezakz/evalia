import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

const SESSION_STATE_FLOW: Record<string, string[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ANALYZING', 'COMPLETED', 'CANCELLED'],
  ANALYZING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTemplate(id: number) {
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tpl) throw new BadRequestException('Invalid templateId');
    if (tpl.state !== 'ACTIVE')
      throw new BadRequestException('Template must be ACTIVE');
    return tpl;
  }

  private async ensureOrg(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });
    if (!org) throw new BadRequestException('Invalid organizationId');
    return org;
  }

  private async ensureTeam(id?: number | null) {
    if (!id) return null;
    const team = await this.prisma.team.findFirst({
      where: { id, deletedAt: null },
    });
    if (!team) throw new BadRequestException('Invalid teamScopeId');
    return team;
  }

  async create(dto: any) {
    await this.ensureOrg(dto.organizationId);
    await this.ensureTemplate(dto.templateId);
    await this.ensureTeam(dto.teamScopeId);
    if (new Date(dto.endAt) <= new Date(dto.startAt))
      throw new BadRequestException('endAt must be after startAt');
    return this.prisma.assessmentSession.create({
      data: {
        organizationId: dto.organizationId,
        templateId: dto.templateId,
        teamScopeId: dto.teamScopeId ?? null,
        name: dto.name,
        description: dto.description || null,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        meta: dto.meta || {},
      },
    });
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.organizationId)
      where.organizationId = Number(query.organizationId);
    if (query.templateId) where.templateId = Number(query.templateId);
    if (query.state) where.state = query.state;
    if (query.search)
      where.name = { contains: query.search, mode: 'insensitive' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.assessmentSession.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startAt: 'desc' },
      }),
      this.prisma.assessmentSession.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number) {
    const s = await this.prisma.assessmentSession.findFirst({
      where: { id, deletedAt: null },
    });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async getFull(id: number) {
    await this.getById(id);
    return this.prisma.assessmentSession.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    question: {
                      include: {
                        options: true,
                        optionSet: { include: { options: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        assignments: true,
      },
    });
  }

  async update(id: number, dto: any) {
    const existing = await this.getById(id);
    if (
      dto.startAt &&
      dto.endAt &&
      new Date(dto.endAt) <= new Date(dto.startAt)
    ) {
      throw new BadRequestException('endAt must be after startAt');
    }
    if (dto.state && dto.state !== existing.state) {
      const allowed = SESSION_STATE_FLOW[existing.state] || [];
      if (!allowed.includes(dto.state))
        throw new BadRequestException(
          `Illegal state transition ${existing.state} -> ${dto.state}`,
        );
    }
    return this.prisma.assessmentSession.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description:
          dto.description !== undefined
            ? dto.description
            : existing.description,
        state: dto.state ?? existing.state,
        startAt: dto.startAt ? new Date(dto.startAt) : existing.startAt,
        endAt: dto.endAt ? new Date(dto.endAt) : existing.endAt,
        teamScopeId:
          dto.teamScopeId !== undefined
            ? dto.teamScopeId
            : existing.teamScopeId,
        meta: dto.meta !== undefined ? dto.meta : existing.meta,
      },
    });
  }

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.assessmentSession.update({
      where: { id },
      data: { deletedAt: new Date(), state: 'CANCELLED' },
    });
  }
}
