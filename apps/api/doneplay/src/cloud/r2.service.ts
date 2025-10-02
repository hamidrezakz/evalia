import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, r2IsConfigured } from './r2.client';
import * as crypto from 'crypto';

export interface R2UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly bucket = process.env.R2_BUCKET || '';
  private readonly publicBase = (process.env.R2_PUBLIC_BASE || '').replace(
    /\/$/,
    '',
  );

  isActive() {
    return r2IsConfigured();
  }

  /**
   * Upload (or overwrite) an avatar. If userId provided we use deterministic key: avatars/<userId>.<ext>
   * Otherwise we generate a random UUID-based key.
   */
  async uploadAvatar(
    buffer: Buffer,
    opts: { userId?: number; mimeType: string; extHint?: string },
  ): Promise<R2UploadResult> {
    if (!this.isActive()) throw new Error('R2 not configured');
    const { userId, mimeType } = opts;
    const ext = this.pickExt(opts.extHint, mimeType);
    const key = userId
      ? `avatars/${userId}.${ext}`
      : `avatars/${crypto.randomUUID()}.${ext}`;
    try {
      // با داشتن query param نسخه (?v=hash) در URL می‌توانیم کش طولانی و immutable استفاده کنیم
      // هر آپدیت آواتار => hash جدید => URL جدید => کش قبلی معتبر ولی دیگر استفاده نمی‌شود.
      await getR2Client().send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch (e: any) {
      this.logger.error(
        `R2 PutObject failed: bucket=${this.bucket} key=${key} code=${e?.name || e?.code} msg=${e?.message}`,
      );
      throw e;
    }

    const url = `${this.publicBase}/${key}`;
    return { key, url, size: buffer.length, contentType: mimeType };
  }

  private pickExt(extHint: string | undefined, mimeType: string): string {
    if (extHint)
      return extHint.replace(/[^a-zA-Z0-9.]/g, '').replace(/^\.+/, '');
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/gif':
        return 'gif';
      default:
        return 'bin';
    }
  }
}
