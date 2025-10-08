import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

const PERSPECTIVES = ['SELF', 'FACILITATOR', 'PEER', 'MANAGER', 'SYSTEM'];

@Injectable()
export class TemplateQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePerspectives(values?: string[]) {
    if (!values) return undefined;
    const invalid = values.filter((v) => !PERSPECTIVES.includes(v));
    if (invalid.length)
      throw new BadRequestException(
        'Invalid perspectives: ' + invalid.join(','),
      );
    return values as any;
  }

  private async normalizeSectionOrders(sectionId: number) {
    const links = await this.prisma.assessmentTemplateQuestion.findMany({
      where: { sectionId, deletedAt: null } as any,
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });
    const updates = links
      .map((l, idx) => (l.order !== idx ? { id: l.id, order: idx } : null))
      .filter(Boolean) as { id: number; order: number }[];
    if (updates.length) {
      await this.prisma.$transaction(
        updates.map((u) =>
          this.prisma.assessmentTemplateQuestion.update({
            where: { id: u.id },
            data: { order: u.order },
          }),
        ),
      );
    }
  }

  async add(dto: any) {
    const section = await this.prisma.assessmentTemplateSection.findFirst({
      where: { id: dto.sectionId, deletedAt: null },
      include: { template: true },
    });
    if (!section) throw new BadRequestException('Invalid sectionId');
    const question = await this.prisma.question.findFirst({
      where: { id: dto.questionId, deletedAt: null },
    });
    if (!question) throw new BadRequestException('Invalid questionId');
    const order =
      dto.order ??
      (await this.prisma.assessmentTemplateQuestion.count({
        where: { sectionId: dto.sectionId, deletedAt: null } as any,
      }));
    return this.prisma.assessmentTemplateQuestion.create({
      data: {
        sectionId: dto.sectionId,
        questionId: dto.questionId,
        order,
        perspectives: this.validatePerspectives(dto.perspectives) || ['SELF'],
        required: dto.required ?? true,
      },
    });
  }

  async list(sectionId: number) {
    return this.prisma.assessmentTemplateQuestion.findMany({
      where: { sectionId, deletedAt: null } as any,
      orderBy: { order: 'asc' },
      include: {
        question: {
          include: { options: true, optionSet: { include: { options: true } } },
        },
      },
    });
  }

  async update(id: number, dto: any) {
    const existing = await this.prisma.assessmentTemplateQuestion.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('TemplateQuestion not found');
    return this.prisma.assessmentTemplateQuestion.update({
      where: { id },
      data: {
        order: dto.order ?? existing.order,
        perspectives: dto.perspectives
          ? this.validatePerspectives(dto.perspectives)
          : existing.perspectives,
        required: dto.required ?? existing.required,
      },
    });
  }

  async bulkSet(sectionId: number, items: any[]) {
    const section = await this.prisma.assessmentTemplateSection.findFirst({
      where: { id: sectionId, deletedAt: null },
    });
    if (!section) throw new BadRequestException('Invalid sectionId');
    await this.prisma.assessmentTemplateQuestion.deleteMany({
      where: { sectionId },
    });
    if (items?.length) {
      await this.prisma.$transaction(
        items.map((it: any, idx: number) =>
          this.prisma.assessmentTemplateQuestion.create({
            data: {
              sectionId,
              questionId: it.questionId,
              order: it.order ?? idx,
              perspectives: this.validatePerspectives(it.perspectives) || [
                'SELF',
              ],
              required: it.required ?? true,
            },
          }),
        ),
      );
    }
    return this.list(sectionId);
  }

  async remove(id: number) {
    const existing = await this.prisma.assessmentTemplateQuestion.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('TemplateQuestion not found');
    if ((existing as any).deletedAt)
      return { id, softDeleted: true, already: true } as any;

    // Use raw SQL to bypass client schema version issues
    const result = await this.prisma.$executeRawUnsafe(
      'UPDATE "AssessmentTemplateQuestion" SET "deletedAt" = NOW() WHERE id = $1 AND "deletedAt" IS NULL',
      id,
    );
    if (result === 0) {
      // Race condition or DB refused – refetch state
      const fresh = await this.prisma.assessmentTemplateQuestion.findUnique({
        where: { id },
      });
      if ((fresh as any)?.deletedAt)
        return { id, softDeleted: true, race: true } as any;
      throw new BadRequestException('Soft delete failed (no rows updated)');
    }
    try {
      await this.normalizeSectionOrders((existing as any).sectionId);
    } catch (_) {}
    return { id, softDeleted: true } as any;
  }

  async restore(id: number) {
    const existing = await this.prisma.assessmentTemplateQuestion.findFirst({
      where: { id, deletedAt: { not: null } } as any,
    });
    if (!existing) throw new NotFoundException('Soft-deleted link not found');
    await this.prisma.assessmentTemplateQuestion.update({
      where: { id },
      data: { deletedAt: null } as any,
    });
    await this.normalizeSectionOrders(existing.sectionId);
    return { id, restored: true } as any;
  }
}
