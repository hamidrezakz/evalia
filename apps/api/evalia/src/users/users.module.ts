import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { PasswordService } from '../auth/password.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
