import {
  BadRequestException,
  Controller,
  Optional,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as crypto from 'crypto';
import { R2Service } from '../cloud/r2.service';
import { AssetsService } from '../assets/assets.service';
import { UserAvatarService } from './user-avatar.service';

@Controller('avatars/users')
export class UserAvatarController {
  constructor(
    private readonly assets: AssetsService,
    private readonly userAvatars: UserAvatarService,
    @Optional() private readonly r2?: R2Service,
  ) {}

  @Post('me')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 150 * 1024 },
    }),
  )
  async uploadMyAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!this.r2?.isActive())
      throw new BadRequestException('Avatar remote storage not configured');
    const userId = Number(req?.user?.userId || req?.user?.id);
    if (!userId) throw new BadRequestException('User not authenticated');
    const buffer: Buffer | undefined = file.buffer as Buffer | undefined;
    if (!buffer) throw new BadRequestException('Empty upload buffer');
    const original = file.originalname || `${userId}.jpg`;
    const ext = (
      original.match(/\.([a-zA-Z0-9]+)$/)?.[1] || 'jpg'
    ).toLowerCase();
    const uploaded = await this.r2.uploadAvatar(buffer, {
      userId,
      mimeType: file.mimetype || 'image/' + ext,
      extHint: ext,
    });
    const checksumFull = crypto.createHash('sha1').update(buffer).digest('hex');
    const version = checksumFull.slice(0, 12);
    const versionedUrl = `/${uploaded.key}?v=${version}`;
    const asset = await this.assets.createAsset({
      type: 'AVATAR',
      filename: uploaded.key.split('/').pop() || `${userId}.${ext}`,
      mimeType: file.mimetype || 'image/' + ext,
      sizeBytes: buffer.length,
      url: versionedUrl,
      checksum: checksumFull,
    });
    const updated = await this.userAvatars.setUserAvatar(userId, asset.id);
    return { data: updated, message: 'آواتار کاربر بروزرسانی شد' } as any;
  }
}
