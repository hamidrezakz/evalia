import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { NavigationModule } from './navigation/navigation.module';
import { UsersModule } from './users/users.module';
import { AssessmentModule } from './assessment/assessment.module';

@Module({
  imports: [
    AuthModule,
    OrganizationModule,
    NavigationModule,
    UsersModule,
    AssessmentModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
