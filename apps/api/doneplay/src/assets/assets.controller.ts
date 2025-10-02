import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  Optional,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as crypto from 'crypto';
import { AssetsService } from './assets.service';
import { UsersService } from '../users/users.service';
import { R2Service } from '../cloud/r2.service';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assets: AssetsService,
    private readonly users: UsersService,
    @Optional() private readonly r2?: R2Service,
  ) {}

  // Backward compatibility: accept both POST /assets and POST /assets/upload
  @Post()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type?: string,
    @Body('userId') userIdRaw?: string,
    @Req() req?: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const assetType = (type as any) || 'AVATAR';
    if (assetType !== 'AVATAR') {
      throw new BadRequestException('Unsupported asset type');
    }
    if (!this.r2?.isActive()) {
      throw new BadRequestException('Avatar remote storage not configured');
    }
    const buffer: Buffer | undefined = file.buffer as Buffer | undefined;
    if (!buffer) throw new BadRequestException('Empty upload buffer');

    const original = file.originalname || 'avatar.jpg';
    const ext = (
      original.match(/\.([a-zA-Z0-9]+)$/)?.[1] || 'jpg'
    ).toLowerCase();
    const authUserId = Number(req?.user?.userId ?? req?.user?.id) || undefined;
    try {
      const uploaded = await this.r2.uploadAvatar(buffer, {
        userId: authUserId,
        mimeType: file.mimetype || 'image/' + ext,
        extHint: ext,
      });
      // Cache buster via checksum so avatar refreshes immediately
      const checksumFull = crypto
        .createHash('sha1')
        .update(buffer)
        .digest('hex');
      const version = checksumFull.slice(0, 12);
      // Store relative path (no domain) for portability; absolute built at read time
      const versionedUrl = `/${uploaded.key}?v=${version}`;
      const asset = await this.assets.createAsset({
        type: 'AVATAR',
        filename:
          uploaded.key.split('/').pop() || `${authUserId || 'avatar'}.${ext}`,
        mimeType: file.mimetype || 'image/' + ext,
        sizeBytes: buffer.length,
        url: versionedUrl,
        checksum: checksumFull,
      });
      if (authUserId) {
        try {
          const requestedUserId =
            userIdRaw && /^\d+$/.test(String(userIdRaw))
              ? Number(userIdRaw)
              : authUserId;
          if (requestedUserId === authUserId) {
            await this.users.setAvatarSelf(authUserId, asset.id);
          }
        } catch {}
      }
      return asset;
    } catch (e: any) {
      const code = e?.code || e?.name || 'ERR';
      const msg = e?.message || 'UNKNOWN';
      throw new BadRequestException(
        `Failed to upload avatar: [${code}] ${msg}`,
      );
    }
  }
}
