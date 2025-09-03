import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { ReorderNavigationDto } from './dto/reorder-navigation.dto';
import { ListNavigationItemsDto } from './dto/list-navigation-items.dto';
import { OrgRole, PlatformRole } from '@prisma/client';

interface SingleRoleOptions {
  platformRole?: PlatformRole | null;
  orgRole?: OrgRole | null;
  includeInactive?: boolean;
  flat?: boolean; // if true return flat ordered array instead of tree
}

export interface NavigationNode {
  id: number;
  label: string;
  path?: string | null;
  externalUrl?: string | null;
  iconName?: string | null;
  order: number;
  isActive: boolean;
  meta: any;
  children?: NavigationNode[];
}

@Injectable()
export class NavigationService {
  constructor(private prisma: PrismaService) {}

  private toNode(item: any): NavigationNode {
    return {
      id: item.id,
      label: item.label,
      path: item.path,
      externalUrl: item.externalUrl,
      iconName: item.iconName,
      order: item.order,
      isActive: item.isActive,
      meta: item.meta || {},
    };
  }

  async getTreeForRole(opts: SingleRoleOptions): Promise<NavigationNode[] | NavigationNode[]> {
    const { platformRole, orgRole, includeInactive, flat } = opts;
    if (platformRole && orgRole) {
      throw new BadRequestException('Specify only one of platformRole or orgRole');
    }

    const baseWhere: any = { deletedAt: null };
    if (!includeInactive) baseWhere.isActive = true;

    // Public items: both role arrays empty
    const or: any[] = [
      { platformRoles: { isEmpty: true }, orgRoles: { isEmpty: true } },
    ];

    if (platformRole) {
      or.push({ platformRoles: { has: platformRole } });
    } else if (orgRole) {
      or.push({ orgRoles: { has: orgRole } });
    }

    const items = await this.prisma.navigationItem.findMany({
      where: { ...baseWhere, OR: or },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { label: 'asc' }],
    });

    if (flat) {
      return items.map((i) => this.toNode(i));
    }
    return this.buildTree(items);
  }

  private buildTree(items: any[]): NavigationNode[] {
    const byParent: Record<string, NavigationNode[]> = {};
    const nodeMap: Record<number, NavigationNode> = {};
    for (const raw of items) {
      const node = this.toNode(raw);
      nodeMap[node.id] = node;
      const bucketKey = raw.parentId ? String(raw.parentId) : 'root';
      byParent[bucketKey] = byParent[bucketKey] || [];
      byParent[bucketKey].push(node);
    }
    // sort siblings by order then label
    Object.values(byParent).forEach((arr) =>
      arr.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
    );

    // assign children
    for (const node of Object.values(nodeMap)) {
      const kids = byParent[String(node.id)];
      if (kids) node.children = kids;
    }
    return byParent['root'] || [];
  }

  async create(dto: CreateNavigationItemDto) {
    if (dto.path && dto.externalUrl) {
      throw new BadRequestException('Provide either path or externalUrl, not both');
    }
    await this.validateParentAndUniqueness(dto.parentId ?? null, dto.label);
    try {
      return await this.prisma.navigationItem.create({
        data: {
          parentId: dto.parentId ?? null,
          label: dto.label,
            path: dto.path,
            externalUrl: dto.externalUrl,
            iconName: dto.iconName,
            order: dto.order ?? 0,
            isActive: dto.isActive ?? true,
            meta: dto.meta ?? {},
            platformRoles: dto.platformRoles ?? [],
            orgRoles: dto.orgRoles ?? [],
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Duplicate navigation item constraint');
      throw e;
    }
  }

  // حذف شد: findRawByOrg فقط برای منوی سازمانی بود

  async findOne(id: number) {
    const item = await this.prisma.navigationItem.findUnique({ where: { id } });
    if (!item || item.deletedAt)
      throw new NotFoundException('Navigation item not found');
    return item;
  }

  async update(id: number, dto: UpdateNavigationItemDto) {
    await this.findOne(id);
    if (dto.path && dto.externalUrl)
      throw new BadRequestException('Cannot set both path and externalUrl');
    try {
      const data: any = {};
      if (dto.parentId !== undefined) data.parentId = dto.parentId ?? null;
      if (dto.label !== undefined) data.label = dto.label;
      if (dto.path !== undefined) data.path = dto.path;
      if (dto.externalUrl !== undefined) data.externalUrl = dto.externalUrl;
      if (dto.iconName !== undefined) data.iconName = dto.iconName;
      if (dto.order !== undefined) data.order = dto.order;
      if (dto.isActive !== undefined) data.isActive = dto.isActive;
      if (dto.meta !== undefined) data.meta = dto.meta;
      if (dto.platformRoles !== undefined) data.platformRoles = dto.platformRoles ?? [];
      if (dto.orgRoles !== undefined) data.orgRoles = dto.orgRoles ?? [];

      if (dto.label !== undefined || dto.parentId !== undefined) {
        await this.validateParentAndUniqueness(
          dto.parentId !== undefined ? (dto.parentId ?? null) : undefined,
          dto.label !== undefined ? dto.label : undefined,
          id,
        );
      }

      return await this.prisma.navigationItem.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Duplicate navigation item constraint');
      throw e;
    }
  }

  async listFiltered(query: ListNavigationItemsDto) {
    const where: any = { deletedAt: null };
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.parentId !== undefined) where.parentId = query.parentId;
    if (query.platformRoles && query.platformRoles.length) {
      where.platformRoles = { hasSome: query.platformRoles };
    }
    if (query.orgRoles && query.orgRoles.length) {
      where.orgRoles = { hasSome: query.orgRoles };
    }
    return this.prisma.navigationItem.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });
  }

  private async validateParentAndUniqueness(
    parentId: number | null | undefined,
    label: string | undefined,
    selfId?: number,
  ) {
    if (parentId) {
      const parent = await this.prisma.navigationItem.findUnique({ where: { id: parentId } });
      if (!parent || parent.deletedAt) throw new BadRequestException('Parent not found');
      if (selfId && parentId === selfId) throw new BadRequestException('Parent cannot be self');
      if (selfId) {
        let cursor = parent.parentId;
        while (cursor) {
          if (cursor === selfId) throw new BadRequestException('Circular parent relation');
          const ancestor = await this.prisma.navigationItem.findUnique({ where: { id: cursor } });
          if (!ancestor) break;
          cursor = ancestor.parentId;
        }
      }
    }
    if (label) {
      const exists = await this.prisma.navigationItem.findFirst({
        where: {
          deletedAt: null,
          label,
          parentId: parentId ?? null,
          ...(selfId ? { id: { not: selfId } } : {}),
        },
        select: { id: true },
      });
      if (exists) throw new ConflictException('Duplicate label at same level');
    }
  }

  async softDelete(id: number) {
    await this.findOne(id);
    return this.prisma.navigationItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggle(id: number, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.navigationItem.update({
      where: { id },
      data: { isActive },
    });
  }

  async reorder(dto: ReorderNavigationDto) {
    if (!dto.items.length) return { updated: 0 };
    const ids = dto.items.map((i) => i.id);
    const existing = await this.prisma.navigationItem.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    if (existing.length !== ids.length)
      throw new NotFoundException('Some items not found');

    // Apply updates transactionally
    await this.prisma.$transaction(
      dto.items.map((i) =>
        this.prisma.navigationItem.update({
          where: { id: i.id },
          data: { parentId: i.parentId ?? null, order: i.order },
        }),
      ),
    );
    return { updated: dto.items.length };
  }
}
