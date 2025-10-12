import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserAvatarService {
  constructor(private prisma: PrismaService) {}

  async setUserAvatar(userId: number, assetId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, deletedAt: null },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarAssetId: true },
    });
    if (!current) throw new NotFoundException('User not found');
    const oldAssetId = current.avatarAssetId;
    await this.prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id: asset.id },
        data: { type: 'AVATAR' as any },
      });
      await tx.user.update({
        where: { id: userId },
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
