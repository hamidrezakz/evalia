import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { NavigationModule } from './navigation/navigation.module';
import { UsersModule } from './users/users.module';
import { AssessmentModule } from './assessment/assessment.module';
import { AssetsModule } from './assets/assets.module';
import { HealthModule } from './health/health.module';
import { AvatarModule } from './avatar/avatar.module';

@Module({
  imports: [
    // Serve static uploaded files under /uploads
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    OrganizationModule,
    NavigationModule,
    UsersModule,
    AssessmentModule,
    AssetsModule,
    HealthModule,
    AvatarModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
