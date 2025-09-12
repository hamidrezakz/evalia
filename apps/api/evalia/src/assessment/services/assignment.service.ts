import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ResponsePerspective } from '@prisma/client';

const PERSPECTIVES: ResponsePerspective[] = [
  'SELF',
  'FACILITATOR',
  'PEER',
  'MANAGER',
  'SYSTEM',
];

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSession(sessionId: number) {
    const s = await this.prisma.assessmentSession.findFirst({
      where: { id: sessionId, deletedAt: null },
    });
    if (!s) throw new BadRequestException('Invalid sessionId');
    return s;
  }

  private async ensureUser(userId: number) {
    const u = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!u) throw new BadRequestException('Invalid userId');
    return u;
  }

  private validatePerspective(p?: string): ResponsePerspective {
    if (!p) return 'SELF';
    if (!PERSPECTIVES.includes(p as ResponsePerspective))
      throw new BadRequestException('Invalid perspective');
    return p as ResponsePerspective;
  }

  async add(dto: any) {
    await this.ensureSession(dto.sessionId);
    await this.ensureUser(dto.userId);
    return this.prisma.assessmentAssignment.create({
      data: {
        sessionId: dto.sessionId,
        userId: dto.userId,
        perspective: this.validatePerspective(dto.perspective),
      },
    });
  }

  async bulkAssign(dto: any) {
    await this.ensureSession(dto.sessionId);
    const perspective = this.validatePerspective(dto.perspective);
    const existing = await this.prisma.assessmentAssignment.findMany({
      where: { sessionId: dto.sessionId },
    });
    const existingKey = new Set(
      existing.map((e) => e.userId + ':' + e.perspective),
    );
    const toCreate = dto.userIds.filter(
      (uid: number) => !existingKey.has(uid + ':' + perspective),
    );
    if (!toCreate.length) return { created: 0 };
    await this.prisma.$transaction(
      toCreate.map((userId: number) =>
        this.prisma.assessmentAssignment.create({
          data: { sessionId: dto.sessionId, userId, perspective },
        }),
      ),
    );
    return { created: toCreate.length };
  }

  async list(sessionId: number) {
    await this.ensureSession(sessionId);
    return this.prisma.assessmentAssignment.findMany({
      where: { sessionId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async update(id: number, dto: any) {
    const existing = await this.prisma.assessmentAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Assignment not found');
    if (dto.perspective) this.validatePerspective(dto.perspective); // validates
    return this.prisma.assessmentAssignment.update({
      where: { id },
      data: {
        perspective:
          (dto.perspective as ResponsePerspective) ?? existing.perspective,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.assessmentAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Assignment not found');
    await this.prisma.assessmentAssignment.delete({ where: { id } });
    return { id };
  }
}
