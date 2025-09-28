import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async createAsset(input: {
    organizationId?: number | null;
    type: 'AVATAR' | 'DOCUMENT' | 'SPREADSHEET' | 'IMAGE' | 'OTHER';
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    checksum?: string | null;
  }) {
    const asset = await this.prisma.asset.create({
      data: {
        organizationId: input.organizationId ?? null,
        type: input.type as any,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        url: input.url,
        checksum: input.checksum ?? null,
      },
    });
    return asset;
  }
}
