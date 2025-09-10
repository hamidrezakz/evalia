import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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

  async getTreeForRole(
    opts: SingleRoleOptions,
  ): Promise<NavigationNode[] | NavigationNode[]> {
    const { platformRole, orgRole, includeInactive, flat } = opts;
    if (platformRole && orgRole) {
      throw new BadRequestException(
        'Specify only one of platformRole or orgRole',
      );
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

  // Removed CRUD and management operations; navigation items are managed manually in DB.
}
