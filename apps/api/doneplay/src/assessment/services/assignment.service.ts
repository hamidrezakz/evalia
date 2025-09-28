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
    const respondentUserId = dto.respondentUserId ?? dto.userId;
    if (!respondentUserId)
      throw new BadRequestException('respondentUserId required');
    await this.ensureUser(respondentUserId);
    const perspective = this.validatePerspective(dto.perspective);
    // Default subject = respondent for SELF if not provided
    const subjectUserId =
      dto.subjectUserId ??
      (perspective === 'SELF' ? respondentUserId : undefined);
    if (perspective !== 'SELF' && !subjectUserId)
      throw new BadRequestException('subjectUserId required for non-SELF');
    if (subjectUserId) await this.ensureUser(subjectUserId);
    return this.prisma.assessmentAssignment.create({
      data: {
        sessionId: dto.sessionId,
        respondentUserId,
        subjectUserId: subjectUserId ?? null,
        perspective,
      },
    });
  }

  async bulkAssign(dto: any) {
    await this.ensureSession(dto.sessionId);
    const perspective = this.validatePerspective(dto.perspective);

    // Mode A (new): one respondent -> many subjects
    if (dto.respondentUserId && Array.isArray(dto.subjectUserIds)) {
      const respondentUserId = Number(dto.respondentUserId);
      await this.ensureUser(respondentUserId);
      if (perspective === 'SELF')
        throw new BadRequestException('Use userIds for SELF bulk');
      const subjectIds: number[] = Array.from(
        new Set(
          (dto.subjectUserIds as any[])
            .map((n: any) => Number(n))
            .filter((v: any) => Number.isFinite(v)),
        ),
      ) as number[];
      if (!subjectIds.length)
        throw new BadRequestException('subjectUserIds required');
      await Promise.all(subjectIds.map((id: number) => this.ensureUser(id)));
      const existing = await this.prisma.assessmentAssignment.findMany({
        where: { sessionId: dto.sessionId, respondentUserId, perspective },
        select: { subjectUserId: true },
      });
      const existingSet = new Set<number>(
        existing.map((e) => (e.subjectUserId as number) || 0),
      );
      const toCreate: number[] = subjectIds.filter(
        (sid: number) => !existingSet.has(sid),
      );
      if (!toCreate.length) return { created: 0 };
      await this.prisma.$transaction(
        toCreate.map((subjectUserId: number) =>
          this.prisma.assessmentAssignment.create({
            data: {
              sessionId: dto.sessionId,
              respondentUserId,
              subjectUserId,
              perspective,
            },
          }),
        ),
      );
      return { created: toCreate.length };
    }

    // Mode B (legacy / SELF bulk): many respondents -> perspective
    if (!Array.isArray(dto.userIds))
      throw new BadRequestException('userIds required');
    const userIds: number[] = Array.from(
      new Set(
        (dto.userIds as any[])
          .map((n: any) => Number(n))
          .filter((v: any) => Number.isFinite(v)),
      ),
    ) as number[];
    await Promise.all(userIds.map((id: number) => this.ensureUser(id)));
    const existing = await this.prisma.assessmentAssignment.findMany({
      where: { sessionId: dto.sessionId, perspective },
      select: { respondentUserId: true, subjectUserId: true },
    });
    const existingKey = new Set(
      existing.map(
        (e) =>
          `${e.respondentUserId}:${e.subjectUserId ?? e.respondentUserId}:${perspective}`,
      ),
    );
    const toCreate = userIds.filter(
      (rid) => !existingKey.has(`${rid}:${rid}:${perspective}`),
    );
    if (!toCreate.length) return { created: 0 };
    await this.prisma.$transaction(
      toCreate.map((respondentUserId: number) =>
        this.prisma.assessmentAssignment.create({
          data: {
            sessionId: dto.sessionId,
            respondentUserId,
            subjectUserId: perspective === 'SELF' ? respondentUserId : null,
            perspective,
          },
        }),
      ),
    );
    return { created: toCreate.length };
  }

  async list(sessionId: number) {
    await this.ensureSession(sessionId);
    return this.prisma.assessmentAssignment.findMany({
      where: { sessionId },
      include: {
        respondent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNormalized: true,
          },
        },
        subject: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNormalized: true,
          },
        },
      },
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
        subjectUserId:
          dto.subjectUserId !== undefined
            ? dto.subjectUserId
            : existing.subjectUserId,
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
