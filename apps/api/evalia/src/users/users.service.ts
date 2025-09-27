import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PasswordService } from '../auth/password.service';
import { ListUsersDto } from './dto/list-users.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private password: PasswordService,
  ) {}

  async list(dto: ListUsersDto) {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (dto.id) where.id = dto.id;
    if (dto.status) where.status = dto.status;
    if (dto.statuses && dto.statuses.length)
      where.status = { in: dto.statuses } as any;
    if (dto.q) {
      const q = dto.q.trim();
      // If the query looks like a phone fragment (mostly digits / + / spaces), build an additional normalized phone search
      const digitFragment = q.replace(/[^0-9+]/g, '');
      const phoneVariants: Prisma.UserWhereInput[] = [];
      if (digitFragment.length >= 4) {
        // Support searching with or without +98 leading zeros:
        // If user types 0912..., also search +98912...; if they type 98912 search +98912
        const normalizedCandidate =
          this.tryNormalizePhoneFragment(digitFragment);
        if (normalizedCandidate) {
          phoneVariants.push({
            phoneNormalized: { contains: normalizedCandidate },
          });
          // Also allow raw digits contains (fallback)
          if (
            normalizedCandidate.startsWith('+98') &&
            digitFragment.startsWith('0')
          ) {
            const alt = '+98' + digitFragment.substring(1);
            phoneVariants.push({ phoneNormalized: { contains: alt } });
          }
        } else {
          phoneVariants.push({ phoneNormalized: { contains: digitFragment } });
        }
      }
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        ...phoneVariants,
      ];
    }
    if (dto.orgId) {
      where.memberships = {
        some: { organizationId: dto.orgId, deletedAt: null },
      };
    }
    if (dto.platformRoles && dto.platformRoles.length) {
      // Filter users whose globalRoles has any of the requested roles
      where.globalRoles = { hasSome: dto.platformRoles as any } as any;
    }
    if (dto.teamName) {
      where.teams = {
        some: {
          team: { name: { contains: dto.teamName, mode: 'insensitive' } },
        },
      } as any;
    }

    // Date range filters
    if (dto.createdAtFrom || dto.createdAtTo) {
      where.createdAt = {} as any;
      if (dto.createdAtFrom)
        (where.createdAt as any).gte = new Date(dto.createdAtFrom);
      if (dto.createdAtTo)
        (where.createdAt as any).lte = new Date(dto.createdAtTo);
    }

    // Sorting
    let orderBy: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput> = {
      createdAt: 'desc',
    };
    if (dto.sort) {
      const parts = dto.sort
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const parsed: Prisma.UserOrderByWithRelationInput[] = [];
      for (const p of parts) {
        const [fieldRaw, dirRaw] = p.split(':');
        const field = fieldRaw as keyof Prisma.UserOrderByWithRelationInput;
        if (!field) continue;
        const dir = dirRaw && dirRaw.toLowerCase() === 'asc' ? 'asc' : 'desc';
        // allowlist fields
        if (['createdAt', 'fullName', 'status', 'id'].includes(field)) {
          parsed.push({ [field]: dir } as any);
        }
      }
      if (parsed.length) orderBy = parsed;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNormalized: true,
          status: true,
          globalRoles: true,
          createdAt: true,
          avatarAsset: { select: { url: true } },
          memberships: {
            where: { deletedAt: null },
            select: { organizationId: true, roles: true },
          },
          teams: {
            where: { deletedAt: null },
            select: {
              team: { select: { id: true, name: true, organizationId: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phoneNormalized,
        status: u.status,
        globalRoles: u.globalRoles,
        avatarUrl: u.avatarAsset?.url ?? null,
        organizations: u.memberships.map((m) => ({
          orgId: m.organizationId,
          roles: m.roles,
        })),
        teams: u.teams.map((t) => t.team),
        createdAt: u.createdAt,
      })),
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
  }

  async detail(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNormalized: true,
        status: true,
        globalRoles: true,
        avatarAsset: { select: { url: true } },
        createdAt: true,
        memberships: {
          where: { deletedAt: null },
          select: {
            id: true,
            organizationId: true,
            roles: true,
            createdAt: true,
          },
        },
        teams: {
          where: { deletedAt: null },
          select: {
            team: { select: { id: true, name: true, organizationId: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarAsset?.url ?? null,
      phone: user.phoneNormalized,
      status: user.status,
      globalRoles: user.globalRoles,
      createdAt: user.createdAt,
      organizations: user.memberships.map((m) => ({
        membershipId: m.id,
        orgId: m.organizationId,
        roles: m.roles,
        joinedAt: m.createdAt,
      })),
      teams: user.teams.map((t) => t.team),
    };
  }

  async update(id: number, body: any) {
    // Allow only a safe subset of fields
    const data: any = {};
    if (body.fullName !== undefined)
      data.fullName = String(body.fullName || '');
    if (body.status !== undefined) data.status = body.status;
    if (Array.isArray(body.globalRoles)) {
      // accept string[]; coerce unique & non-empty; optional validation against known roles
      const roles = (body.globalRoles as string[])
        .map((r) => String(r).trim())
        .filter(Boolean);
      // Optional: whitelist known platform roles
      const allowed = new Set([
        'MEMBER',
        'SUPER_ADMIN',
        'ANALYSIS_MANAGER',
        'FACILITATOR',
        'SUPPORT',
        'SALES',
      ]);
      const filtered = Array.from(new Set(roles)).filter((r) =>
        allowed.has(r as any),
      );
      data.globalRoles = filtered;
    }
    if (body.phone !== undefined || body.phoneNormalized !== undefined) {
      const norm = this.normalizePhone(
        body.phone ?? body.phoneNormalized ?? '',
      );
      // ensure uniqueness
      const exists = await this.prisma.user.findFirst({
        where: { phoneNormalized: norm, NOT: { id } },
        select: { id: true },
      });
      if (exists) throw new BadRequestException('Phone already in use');
      data.phoneNormalized = norm;
    }
    if (body.avatarAssetId !== undefined) {
      const n = Number(body.avatarAssetId);
      if (!Number.isInteger(n) || n <= 0)
        throw new NotFoundException('Invalid avatarAssetId');
      // ensure asset exists
      const asset = await this.prisma.asset.findFirst({
        where: { id: n, deletedAt: null },
      });
      if (!asset) throw new NotFoundException('Asset not found');
      // Ensure single, canonical avatar per user: rename file to <userId>.<ext>, update asset
      // and remove any previous avatar asset + its file.
      const userCurrent = await this.prisma.user.findUnique({
        where: { id },
        select: { avatarAssetId: true },
      });

      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      const currentFilename =
        asset.filename || (asset.url ? asset.url.split('/').pop()! : null);
      const currentExt = currentFilename ? extname(currentFilename) : '';
      const targetFilename = `${id}${currentExt || ''}`;
      const srcPath = currentFilename
        ? path.join(uploadsDir, currentFilename)
        : null;
      const destPath = path.join(uploadsDir, targetFilename);

      // Make uploads directory if missing
      try {
        if (!fs.existsSync(uploadsDir))
          fs.mkdirSync(uploadsDir, { recursive: true });
      } catch {}

      // If the new asset file name is not canonical, rename it
      if (srcPath && currentFilename && currentFilename !== targetFilename) {
        try {
          if (fs.existsSync(srcPath)) {
            // If a previous file with target name exists, remove it before rename
            if (fs.existsSync(destPath)) {
              try {
                fs.unlinkSync(destPath);
              } catch {}
            }
            fs.renameSync(srcPath, destPath);
          }
        } catch (e) {
          // If rename fails, we continue but keep the asset as-is; however we still set avatar below
        }
      }

      // Hard-delete strategy with ordered DB updates
      const oldAssetId = userCurrent?.avatarAssetId;
      let oldFilename: string | null = null;

      // Apply DB changes in a transaction to avoid FK issues
      const updatedUser = await this.prisma.$transaction(async (tx) => {
        // 1) Update the new asset record to canonical name/url
        await tx.asset.update({
          where: { id: asset.id },
          data: {
            type: 'AVATAR' as any,
            filename: targetFilename,
            url: `/uploads/${targetFilename}`,
          },
        });

        // 2) Update user to point to the new asset and apply other field updates
        const user = await tx.user.update({
          where: { id },
          data: { ...data, avatarAssetId: asset.id },
        });

        // 3) Hard-delete old asset if different from new one
        if (oldAssetId && oldAssetId !== asset.id) {
          try {
            const prev = await tx.asset.findUnique({
              where: { id: oldAssetId },
            });
            if (prev) {
              oldFilename =
                prev.filename || (prev.url ? prev.url.split('/').pop()! : null);
            }
          } catch {}
          try {
            await tx.asset.delete({ where: { id: oldAssetId } });
          } catch {}
        }
        return user;
      });

      // Remove the old physical file if present and not the same as the new canonical name
      if (oldFilename && oldFilename !== targetFilename) {
        const oldPath = path.join(uploadsDir, oldFilename);
        try {
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch {}
      }

      // Best-effort cleanup: if a file with old random name still exists (when different), it's already removed before rename or by earlier block.
      return this.detail(updatedUser.id);
    }
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.detail(updated.id);
  }

  private normalizePhone(raw: string): string {
    const trimmed = (raw || '').trim();
    if (!trimmed) throw new BadRequestException('Phone is required');
    let digits = trimmed.replace(/[^0-9+]/g, '');
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '+98' + digits.substring(1);
    }
    if (!digits.startsWith('+'))
      throw new BadRequestException('Phone must start with + or 0');
    if (digits.length < 10) throw new BadRequestException('Invalid phone');
    return digits;
  }

  /**
   * Attempt to normalize a partial phone fragment for searching.
   * Returns null if fragment too short or invalid to transform.
   */
  private tryNormalizePhoneFragment(fragment: string): string | null {
    if (!fragment) return null;
    let f = fragment.replace(/[^0-9+]/g, '');
    // If starts with 0 and at least 5 digits, convert to +98 pattern (Iran) like normalizePhone does.
    if (f.startsWith('0') && f.length >= 5) {
      f = '+98' + f.substring(1);
    }
    if (!f.startsWith('+')) return f.length >= 4 ? f : null;
    return f.length >= 4 ? f : null;
  }

  async create(body: any) {
    const phoneNormalized = this.normalizePhone(
      body.phone || body.phoneNormalized || '',
    );
    const exists = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (exists) throw new BadRequestException('User already exists');
    const passwordHash = body.password
      ? await this.password.hash(String(body.password))
      : null;
    const status = body.status || 'INVITED';
    const fullName = body.fullName ? String(body.fullName) : '';
    const user = await this.prisma.user.create({
      data: {
        phoneNormalized,
        fullName,
        firstName: '',
        lastName: '',
        status,
        passwordHash,
      },
    });
    return this.detail(user.id);
  }

  async remove(id: number) {
    // Soft delete user and cascade-soft-delete related memberships/teams where applicable
    const exists = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('User not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.organizationMembership.updateMany({
        where: { userId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      } as any);
      await tx.teamMembership.updateMany({
        where: { userId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      } as any);
      await tx.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'DELETED' as any },
      });
    });
    return { success: true };
  }
}
