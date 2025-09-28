import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { VerificationService } from './verification.service';
import { PasswordService } from './password.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from '../common/roles.guard';
import { TokenVersionGuard } from '../common/token-version.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtGuard } from '../common/optional-jwt.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_change_me',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    VerificationService,
    PasswordService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    TokenVersionGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
