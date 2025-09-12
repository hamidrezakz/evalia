import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id: dto.templateId, deletedAt: null },
    });
    if (!tpl) throw new BadRequestException('Invalid templateId');
    const order =
      dto.order ??
      (await this.prisma.assessmentTemplateSection.count({
        where: { templateId: dto.templateId },
      }));
    return this.prisma.assessmentTemplateSection.create({
      data: { templateId: dto.templateId, title: dto.title, order },
    });
  }

  async list(templateId: number) {
    const items = await this.prisma.assessmentTemplateSection.findMany({
      where: { templateId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
    return items;
  }

  async update(id: number, dto: any) {
    const existing = await this.prisma.assessmentTemplateSection.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Section not found');
    return this.prisma.assessmentTemplateSection.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        order: dto.order ?? existing.order,
      },
    });
  }

  async reorder(templateId: number, sectionIds: number[]) {
    const existing = await this.prisma.assessmentTemplateSection.findMany({
      where: { templateId, deletedAt: null },
    });
    const existingIds = new Set(existing.map((s) => s.id));
    if (
      existing.length !== sectionIds.length ||
      sectionIds.some((id) => !existingIds.has(id))
    ) {
      throw new BadRequestException('sectionIds mismatch');
    }
    await this.prisma.$transaction(
      sectionIds.map((id, idx) =>
        this.prisma.assessmentTemplateSection.update({
          where: { id },
          data: { order: idx },
        }),
      ),
    );
    return this.list(templateId);
  }

  async softDelete(id: number) {
    const existing = await this.prisma.assessmentTemplateSection.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Section not found');
    return this.prisma.assessmentTemplateSection.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
