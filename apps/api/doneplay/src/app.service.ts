import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async dbPing(): Promise<'OK'> {
    await this.prisma.$queryRaw`SELECT 1`;
    return 'OK';
  }
}
