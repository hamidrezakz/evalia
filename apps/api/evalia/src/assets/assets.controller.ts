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
  _req: Request,
  file: any,
  cb: (error: Error | null, filename: string) => void,
) {
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
  async upload(@UploadedFile() file: any, @Body('type') type?: string) {
    if (!file) throw new BadRequestException('No file uploaded');
    const asset = await this.assets.createAsset({
      type: (type as any) || 'AVATAR',
      filename: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
    });
    return asset;
  }
}
