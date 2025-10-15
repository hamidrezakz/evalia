import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrgAvatarService {
  constructor(private prisma: PrismaService) {}

  async setOrgAvatar(organizationId: number, assetId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, deletedAt: null },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    const current = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { avatarAssetId: true },
    });
    if (!current) throw new NotFoundException('Organization not found');
    const oldAssetId = current.avatarAssetId;
    await this.prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id: asset.id },
        data: { type: 'AVATAR' as any },
      });
      await tx.organization.update({
        where: { id: organizationId },
        data: { avatarAssetId: asset.id },
      });
      if (oldAssetId && oldAssetId !== asset.id) {
        try {
          await tx.asset.delete({ where: { id: oldAssetId } });
        } catch {}
      }
    });
    return this.prisma.asset.findUnique({ where: { id: asset.id } });
  }
}
