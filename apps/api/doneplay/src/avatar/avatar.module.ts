import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AssetsModule } from '../assets/assets.module';
import { R2Service } from '../cloud/r2.service';
import { UserAvatarController } from './user-avatar.controller';
import { OrgAvatarController } from './org-avatar.controller';
import { UserAvatarService } from './user-avatar.service';
import { OrgAvatarService } from './org-avatar.service';

@Module({
  imports: [AssetsModule],
  controllers: [UserAvatarController, OrgAvatarController],
  providers: [PrismaService, R2Service, UserAvatarService, OrgAvatarService],
  exports: [UserAvatarService, OrgAvatarService],
})
export class AvatarModule {}
