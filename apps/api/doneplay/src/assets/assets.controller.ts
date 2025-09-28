import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AssetsService } from './assets.service';
import * as fs from 'fs';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import sharp from 'sharp';

function filenameFactory(
  req: Request,
  file: any,
  cb: (error: Error | null, filename: string) => void,
) {
  // If a userId is provided via body, deterministically name the file as <userId>.<ext>
  const anyReq: any = req as any;
  const userIdRaw = anyReq?.body?.userId;
  if (userIdRaw && /^\d+$/.test(String(userIdRaw))) {
    const ext = extname(file.originalname) || '.jpg';
    return cb(null, `${userIdRaw}${ext}`);
  }
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, unique + extname(file.originalname));
}

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assets: AssetsService,
    private readonly users: UsersService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: Request,
          _file: any,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const dir = 'uploads';
          try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          } catch (e) {
            // ignore
          }
          cb(null, dir);
        },
        filename: filenameFactory,
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed') as any,
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Body('type') type?: string,
    @Body('userId') userIdRaw?: string,
    @Req() req?: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const assetType = (type as any) || 'AVATAR';
    // Enforce 512KB max for avatar images (stricter than general file interceptor 5MB)
    if (assetType === 'AVATAR' && file.size > 512 * 1024) {
      try {
        const p = `uploads/${file.filename}`;
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
      throw new BadRequestException('AVATAR_FILE_TOO_LARGE');
    }
    // If filename is deterministic for a user, remove any previous file with same name to ensure single image
    try {
      const dir = 'uploads';
      const full = `${dir}/${file.filename}`;
      // If the file already existed and we're overwriting, nothing to do (multer wrote it). If prior temp existed, it's gone now.
      // We don't handle DB cleanup here; user service update will soft-delete previous asset records.
    } catch {}
    // ALWAYS convert avatar to webp and do iterative quality + downscale until <=80KB (best effort)
    if (assetType === 'AVATAR') {
      const LIMIT = 80 * 1024;
      try {
        const uploadPath = `uploads/${file.filename}`;
        if (fs.existsSync(uploadPath)) {
          const input: Buffer = fs.readFileSync(uploadPath);
          // Collect candidate widths (start from original, then step down)
          let meta: sharp.Metadata | null = null;
          try {
            meta = await sharp(input, { failOn: 'none' }).metadata();
          } catch {}
          const originalWidth = meta?.width || undefined;
          const widths: number[] = [];
          if (originalWidth) {
            widths.push(originalWidth);
            for (const w of [
              1024, 800, 640, 512, 400, 320, 256, 200, 160, 128, 96, 80, 64,
            ]) {
              if (originalWidth > w) widths.push(w);
            }
          } else {
            widths.push(512, 400, 320, 256, 200, 160, 128, 96, 80, 64);
          }
          const qualities = [
            85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20,
          ];
          let best: Buffer | null = null;
          let bestSize = Number.MAX_SAFE_INTEGER;
          for (const w of widths) {
            for (const q of qualities) {
              try {
                let inst = sharp(input, { failOn: 'none' });
                if (w && originalWidth && w < originalWidth)
                  inst = inst.resize({ width: w, withoutEnlargement: true });
                const out = (await inst
                  .webp({ quality: q })
                  .toBuffer()) as Buffer;
                const size = out.length;
                if (size < bestSize) {
                  best = out;
                  bestSize = size;
                }
                if (size <= LIMIT) break; // کیفیت فعلی کافی است برای این عرض
              } catch {}
            }
            if (bestSize <= LIMIT) break; // عرض کافی پیدا شد
          }
          if (best) {
            const base = file.filename.replace(/\.[^.]+$/, '');
            const finalName = base + '.webp';
            const finalPath = `uploads/${finalName}`;
            try {
              fs.writeFileSync(finalPath, best);
            } catch {}
            if (finalPath !== uploadPath) {
              try {
                fs.unlinkSync(uploadPath);
              } catch {}
            }
            file.filename = finalName;
            file.mimetype = 'image/webp';
            file.size = best.length;
          }
        }
      } catch {}
    }
    const asset = await this.assets.createAsset({
      type: assetType,
      filename: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
    });
    // Auto attach avatar to self if: type=AVATAR and authenticated user matches provided userId or no userId provided.
    try {
      if (assetType === 'AVATAR' && (req?.user?.userId || req?.user?.id)) {
        // JwtStrategy validate() returns object with userId (not id)
        const authUserId = Number(req.user.userId ?? req.user.id);
        const requestedUserId =
          userIdRaw && /^\d+$/.test(String(userIdRaw))
            ? Number(userIdRaw)
            : authUserId;
        if (authUserId === requestedUserId) {
          const updated = await this.users.setAvatarSelf(authUserId, asset.id);
          return updated;
        }
      }
    } catch {}
    return asset;
  }
}
