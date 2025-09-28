import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OptionSetOptionService {
  constructor(private readonly prisma: PrismaService) {}

  async list(optionSetId: number) {
    const exists = await this.prisma.optionSet.findFirst({
      where: { id: optionSetId, deletedAt: null },
    });
    if (!exists) throw new NotFoundException('OptionSet not found');
    const options = await this.prisma.optionSetOption.findMany({
      where: { optionSetId },
      orderBy: { order: 'asc' },
    });
    return options;
  }

  async bulkReplace(optionSetId: number, dto: any) {
    await this.list(optionSetId); // ensures existence
    await this.prisma.optionSetOption.deleteMany({ where: { optionSetId } });
    if (Array.isArray(dto.options)) {
      await this.prisma.$transaction(
        dto.options.map((o: any, idx: number) =>
          this.prisma.optionSetOption.create({
            data: {
              optionSetId,
              value: o.value,
              label: o.label,
              order: o.order ?? idx,
              meta: o.meta || {},
            },
          }),
        ),
      );
    }
    return this.list(optionSetId);
  }

  async update(id: number, dto: any) {
    const existing = await this.prisma.optionSetOption.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('OptionSetOption not found');
    return this.prisma.optionSetOption.update({
      where: { id },
      data: {
        value: dto.value ?? existing.value,
        label: dto.label ?? existing.label,
        order: dto.order ?? existing.order,
        meta: dto.meta ?? existing.meta,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.optionSetOption.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('OptionSetOption not found');
    await this.prisma.optionSetOption.delete({ where: { id } });
    return { id };
  }
}
