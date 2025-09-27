import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AssetsService } from './assets.service';
import * as fs from 'fs';
import type { Request } from 'express';

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
  constructor(private readonly assets: AssetsService) {}

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
    const asset = await this.assets.createAsset({
      type: assetType,
      filename: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
    });
    return asset;
  }
}
