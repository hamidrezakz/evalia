import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionBankAccessLevel } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class QuestionBankService {
  constructor(private readonly prisma: PrismaService) {}

  private levelRank(level: QuestionBankAccessLevel): number {
    switch (level) {
      case 'USE':
        return 1;
      case 'EDIT':
        return 2;
      case 'ADMIN':
        return 3;
      default:
        return 0;
    }
  }

  private async getAccessibleBankOrThrow(
    id: number,
    orgId: number,
    minLevel: QuestionBankAccessLevel = 'USE',
  ) {
    const bank = await this.prisma.questionBank.findFirst({
      where: { id, deletedAt: null },
      include: {
        orgLinks: { where: { organizationId: orgId } },
      },
    });
    if (!bank) throw new NotFoundException('QuestionBank not found');
    // Owner org always ADMIN
    if (bank.createdByOrganizationId === orgId) return bank;
    const link = bank.orgLinks[0];
    if (!link)
      throw new ForbiddenException('Resource not in this organization');
    if (this.levelRank(link.accessLevel) < this.levelRank(minLevel)) {
      throw new ForbiddenException('Insufficient access level');
    }
    return bank;
  }

  async create(dto: any, orgId: number, _actorUserId?: number) {
    const bank = await this.prisma.questionBank.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        isSystem: !!dto.isSystem,
        createdByOrganizationId: orgId,
        orgLinks: {
          create: {
            organizationId: orgId,
            accessLevel: 'ADMIN',
          },
        },
      },
    });
    return bank;
  }

  async list(query: any, orgId: number, _actorUserId?: number) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const orgScope: any = {
      OR: [
        { createdByOrganizationId: orgId },
        { orgLinks: { some: { organizationId: orgId } } },
      ],
    };
    const searchCond = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const where: any = {
      deletedAt: null,
      AND: [orgScope, ...(searchCond ? [searchCond] : [])],
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.questionBank.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.questionBank.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number, orgId: number, _actorUserId?: number) {
    return this.getAccessibleBankOrThrow(id, orgId, 'USE');
  }

  async update(id: number, dto: any, orgId: number, _actorUserId?: number) {
    await this.getAccessibleBankOrThrow(id, orgId, 'EDIT');
    return this.prisma.questionBank.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: dto.isSystem,
      },
    });
  }

  async softDelete(id: number, orgId: number, _actorUserId?: number) {
    await this.getAccessibleBankOrThrow(id, orgId, 'ADMIN');
    return this.prisma.questionBank.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countQuestions(bankId: number, orgId: number, _actorUserId?: number) {
    await this.getAccessibleBankOrThrow(bankId, orgId, 'USE');

    const questionsCount = await this.prisma.question.count({
      where: { bankId, deletedAt: null },
    });

    return { bankId, questionsCount };
  }
}
