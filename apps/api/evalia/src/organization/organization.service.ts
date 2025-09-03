import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  OrgPlan,
  OrganizationStatus,
  OrgRole,
  PlatformRole,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.dto';
import { ChangeOrganizationStatusDto } from './dto/change-org-status.dto';
import { PaginationResult } from './types/pagination-result.type';
import { generateUniqueSlug } from './slug.util';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, actorUserId?: number) {
    const slug =
      dto.slug ||
      (await generateUniqueSlug(dto.name, (existing) =>
        this.slugExists(existing),
      ));
    try {
      const created = await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug,
          plan: dto.plan ?? 'FREE',
          locale: dto.locale ?? 'FA',
          timezone: dto.timezone ?? 'Asia/Tehran',
          createdById: actorUserId,
        },
      });
      // ...existing code...
      return created;
    } catch (e: any) {
      if (this.isUniqueViolation(e, 'Organization_slug_key')) {
        throw new BadRequestException({
          message: 'Duplicate slug',
          code: 'DUPLICATE_ORG_SLUG',
        });
      }
      throw e;
    }
  }

  async slugExists(slug: string) {
    const c = await this.prisma.organization.count({ where: { slug } });
    return c > 0;
  }

  async list(query: ListOrganizationsQueryDto): Promise<PaginationResult<any>> {
    const { page, pageSize, q, status, plan, orderBy, orderDir } = query;
    const where: Prisma.OrganizationWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // ...existing code...
    const total = await this.prisma.organization.count({ where });
    const items = await this.prisma.organization.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderBy || 'createdAt']: orderDir || 'desc' },
    });

    const result = {
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
    // ...existing code...
    return result;
  }

  async findById(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND',
      });
    return org;
  }

  async update(id: number, dto: UpdateOrganizationDto) {
    await this.findById(id);
    try {
      return await this.prisma.organization.update({
        where: { id },
        data: { ...dto },
      });
    } catch (e: any) {
      if (this.isUniqueViolation(e, 'Organization_slug_key')) {
        throw new BadRequestException({
          message: 'Duplicate slug',
          code: 'DUPLICATE_ORG_SLUG',
        });
      }
      throw e;
    }
  }

  async softDelete(id: number) {
    await this.findById(id);
    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    // ...existing code...
    return { success: true };
  }

  async restore(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not deleted or not found',
        code: 'ORG_NOT_FOUND',
      });
    const restored = await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: null },
    });
    // ...existing code...
    return restored;
  }

  async changeStatus(id: number, dto: ChangeOrganizationStatusDto) {
    await this.findById(id);
    const updated = await this.prisma.organization.update({
      where: { id },
      data: { status: dto.status },
    });
    // ...existing code...
    return updated;
  }

  private isUniqueViolation(e: any, indexName: string) {
    return (
      e?.code === 'P2002' &&
      Array.isArray(e.meta?.target) &&
      e.meta?.target.includes(indexName)
    );
  }
}
