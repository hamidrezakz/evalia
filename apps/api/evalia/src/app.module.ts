import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [AuthModule, OrganizationModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
