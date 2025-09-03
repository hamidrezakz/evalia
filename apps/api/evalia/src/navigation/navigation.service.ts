import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { ReorderNavigationDto } from './dto/reorder-navigation.dto';
import { ListNavigationItemsDto } from './dto/list-navigation-items.dto';
import { OrgRole, PlatformRole } from '@prisma/client';

interface BuildMenuOptions {
  organizationId?: number | null;
  userOrgRole?: OrgRole | null;
  platformRoles: PlatformRole[];
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

  private precedenceScore(item: any): number {
    if (item.organizationId && item.role) return 400;
    if (item.organizationId && !item.role) return 300;
    if (!item.organizationId && item.platformRole) return 200;
    return 100; // global generic
  }

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

  async buildResolvedMenu(opts: BuildMenuOptions): Promise<NavigationNode[]> {
    const { organizationId, userOrgRole, platformRoles } = opts;

    const candidates = await this.prisma.navigationItem.findMany({
      where: {
        deletedAt: null,
        OR: [
          ...(organizationId && userOrgRole
            ? [{ organizationId, role: userOrgRole }]
            : []),
          ...(organizationId ? [{ organizationId, role: null }] : []),
          ...(platformRoles.length
            ? [{ organizationId: null, platformRole: { in: platformRoles } }]
            : []),
          { organizationId: null, platformRole: null },
        ],
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { label: 'asc' }],
    });

    const map = new Map<string, any>();
    for (const item of candidates) {
      const key = `${item.parentId || 'root'}::${item.label}`;
      const score = this.precedenceScore(item);
      const existing = map.get(key);
      if (!existing || existing.score < score) {
        map.set(key, { item, score });
      }
    }

    // collect final items
    const finalItems = Array.from(map.values()).map((v) => v.item);
    // build tree
    return this.buildTree(finalItems.filter((i) => i.isActive));
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
    // validation: path XOR externalUrl already enforced by DTO; ensure not both
    if (dto.path && dto.externalUrl) {
      throw new BadRequestException(
        'Provide either path or externalUrl, not both',
      );
    }
    await this.validateParentAndUniqueness(
      dto.parentId ?? null,
      dto.label,
      dto.organizationId ?? null,
      dto.role ?? null,
      dto.platformRole ?? null,
    );
    try {
      return await this.prisma.navigationItem.create({
        data: {
          organizationId: dto.organizationId ?? null,
          role: dto.role ?? null,
          platformRole: dto.platformRole ?? null,
          parentId: dto.parentId ?? null,
          label: dto.label,
          path: dto.path,
          externalUrl: dto.externalUrl,
          iconName: dto.iconName,
          order: dto.order ?? 0,
          isActive: dto.isActive ?? true,
          meta: dto.meta ?? {},
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002')
        throw new ConflictException('Duplicate navigation item constraint');
      throw e;
    }
  }

  async findRawByOrg(orgId: number | null) {
    return this.prisma.navigationItem.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });
  }

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
      if (dto.organizationId !== undefined)
        data.organizationId = dto.organizationId ?? null;
      if (dto.role !== undefined) data.role = dto.role ?? null;
      if (dto.platformRole !== undefined)
        data.platformRole = dto.platformRole ?? null;
      if (dto.parentId !== undefined) data.parentId = dto.parentId ?? null;
      if (dto.label !== undefined) data.label = dto.label;
      if (dto.path !== undefined) data.path = dto.path;
      if (dto.externalUrl !== undefined) data.externalUrl = dto.externalUrl;
      if (dto.iconName !== undefined) data.iconName = dto.iconName;
      if (dto.order !== undefined) data.order = dto.order;
      if (dto.isActive !== undefined) data.isActive = dto.isActive;
      if (dto.meta !== undefined) data.meta = dto.meta;

      // Only run uniqueness / parent validations if any of related fields are being changed
      if (
        dto.label !== undefined ||
        dto.parentId !== undefined ||
        dto.organizationId !== undefined ||
        dto.role !== undefined ||
        dto.platformRole !== undefined
      ) {
        await this.validateParentAndUniqueness(
          dto.parentId !== undefined ? (dto.parentId ?? null) : undefined,
          dto.label !== undefined ? dto.label : undefined,
          dto.organizationId !== undefined
            ? (dto.organizationId ?? null)
            : undefined,
          dto.role !== undefined ? (dto.role ?? null) : undefined,
          dto.platformRole !== undefined
            ? (dto.platformRole ?? null)
            : undefined,
          id,
        );
      }

      return await this.prisma.navigationItem.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      if (e.code === 'P2002')
        throw new ConflictException('Duplicate navigation item constraint');
      throw e;
    }
  }

  async listFiltered(query: ListNavigationItemsDto) {
    return this.prisma.navigationItem.findMany({
      where: {
        deletedAt: null,
        organizationId:
          query.organizationId ??
          (query.organizationId === null ? null : undefined),
        role: query.role ?? (query.role === null ? null : undefined),
        platformRole:
          query.platformRole ??
          (query.platformRole === null ? null : undefined),
        isActive: query.isActive === undefined ? undefined : query.isActive,
        parentId:
          query.parentId ?? (query.parentId === null ? null : undefined),
      },
      skip: query.skip,
      take: query.take,
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });
  }

  private async validateParentAndUniqueness(
    parentId: number | null | undefined,
    label: string | undefined,
    organizationId: number | null | undefined,
    role: OrgRole | null | undefined,
    platformRole: PlatformRole | null | undefined,
    selfId?: number,
  ) {
    if (parentId) {
      const parent = await this.prisma.navigationItem.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.deletedAt)
        throw new BadRequestException('Parent not found');
      // scope alignment (org & roles must match layering constraints)
      if ((parent.organizationId || null) !== (organizationId || null)) {
        throw new BadRequestException('Parent organization scope mismatch');
      }
      if ((parent.role || null) !== (role || null)) {
        // allow parent to be more generic (e.g., parent without role while child has role) -> disallow for now for simplicity
        if (role && parent.role == null) {
          // permitted
        } else {
          throw new BadRequestException('Parent role scope mismatch');
        }
      }
      if ((parent.platformRole || null) !== (platformRole || null)) {
        if (platformRole && parent.platformRole == null) {
          // allow child specialized from generic
        } else {
          throw new BadRequestException('Parent platform role scope mismatch');
        }
      }
      // cycle prevention
      if (selfId && parentId === selfId)
        throw new BadRequestException('Parent cannot be self');
      if (selfId) {
        // climb up to detect cycle
        let cursor = parent.parentId;
        while (cursor) {
          if (cursor === selfId)
            throw new BadRequestException('Circular parent relation');
          const ancestor = await this.prisma.navigationItem.findUnique({
            where: { id: cursor },
          });
          if (!ancestor) break;
          cursor = ancestor.parentId;
        }
      }
    }
    if (label) {
      // uniqueness: label per same (parentId, organizationId, role, platformRole) after soft delete filter
      const exists = await this.prisma.navigationItem.findFirst({
        where: {
          deletedAt: null,
          label,
          parentId: parentId ?? null,
          organizationId: organizationId ?? null,
          role: role ?? null,
          platformRole: platformRole ?? null,
          ...(selfId ? { id: { not: selfId } } : {}),
        },
        select: { id: true },
      });
      if (exists)
        throw new ConflictException('Duplicate label at same level and scope');
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

    // Ensure all in same scope (either same orgId or all null) for safety (optional)
    const orgSet = new Set(existing.map((e) => e.organizationId || null));
    if (orgSet.size > 1)
      throw new BadRequestException(
        'Items must belong to same organization scope',
      );

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

  // Authorization helpers (simple role checks; can be expanded with permissions table later)
  assertCanManageGlobal(platformRoles: PlatformRole[]) {
    if (!platformRoles.includes(PlatformRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Not allowed to manage global navigation');
    }
  }

  assertCanManageOrg(userOrgRole?: OrgRole | null) {
    if (
      !userOrgRole ||
      (userOrgRole !== OrgRole.OWNER && userOrgRole !== OrgRole.MANAGER)
    ) {
      throw new ForbiddenException(
        'Not allowed to manage organization navigation',
      );
    }
  }
}
