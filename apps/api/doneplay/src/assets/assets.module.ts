import { Module } from '@nestjs/common';
import { R2Service } from '../cloud/r2.service';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AssetsController],
  imports: [UsersModule],
  providers: [AssetsService, PrismaService, R2Service],
  exports: [AssetsService],
})
export class AssetsModule {}
