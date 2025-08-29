import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Health check: test DB connection
  async dbPing(): Promise<string> {
    await this.prisma.$queryRaw`SELECT 1`;
    return 'DB OK';
  }
}
