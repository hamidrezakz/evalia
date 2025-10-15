import {
  BadRequestException,
  Controller,
  Optional,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { R2Service } from '../cloud/r2.service';
import { AssetsService } from '../assets/assets.service';
import { OrgAvatarService } from './org-avatar.service';
import { OrgContext } from '../common/org-context.decorator';
import { OrgContextGuard } from '../common/org-context.guard';

@Controller('avatars/organizations')
export class OrgAvatarController {
  constructor(
    private prisma: PrismaService,
    private assets: AssetsService,
    private orgAvatars: OrgAvatarService,
    @Optional() private r2?: R2Service,
  ) {}

  @Post(':id')
  @UseGuards(OrgContextGuard)
  @OrgContext({
    sources: { paramKey: 'id' },
    requireOrgRoles: ['OWNER', 'MANAGER'],
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 150 * 1024 },
    }),
  )
  async uploadOrgAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('هیچ فایلی ارسال نشده است');
    if (!this.r2?.isActive())
      throw new BadRequestException('ذخیره‌ساز آواتار پیکربندی نشده است');
    const orgId = Number(id);
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        slug: true,
        avatarAssetId: true,
        avatarAsset: { select: { url: true } },
      },
    });
    if (!org) throw new BadRequestException('سازمان یافت نشد');
    const buffer: Buffer | undefined = file.buffer as Buffer | undefined;
    if (!buffer) throw new BadRequestException('محتوای فایل خالی است');
    const original = file.originalname || `${org.slug}.jpg`;
    const ext = (
      original.match(/\.([a-zA-Z0-9]+)$/)?.[1] || 'jpg'
    ).toLowerCase();
    const uploaded = await this.r2.uploadOrgAvatar(buffer, {
      slug: org.slug,
      mimeType: file.mimetype || 'image/' + ext,
      extHint: ext,
    });
    const checksumFull = crypto.createHash('sha1').update(buffer).digest('hex');
    const version = checksumFull.slice(0, 12);
    const versionedUrl = `/${uploaded.key}?v=${version}`;
    const asset = await this.assets.createAsset({
      type: 'AVATAR',
      filename: uploaded.key.split('/').pop() || `${org.slug}.${ext}`,
      mimeType: file.mimetype || 'image/' + ext,
      sizeBytes: buffer.length,
      url: versionedUrl,
      checksum: checksumFull,
    });
    const oldUrl = org.avatarAsset?.url || null;
    const updated = await this.orgAvatars.setOrgAvatar(orgId, asset.id);
    // Clean old object in storage if key changed
    if (oldUrl) {
      try {
        const path = String(oldUrl).replace(/^\//, '');
        const oldKey = path.split('?')[0];
        if (oldKey && oldKey !== uploaded.key)
          await this.r2.deleteObject(oldKey);
      } catch {}
    }
    return { data: updated, message: 'آواتار سازمان بروزرسانی شد' } as any;
  }
}
