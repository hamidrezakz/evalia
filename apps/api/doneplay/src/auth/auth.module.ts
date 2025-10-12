import { Module, forwardRef } from '@nestjs/common';
import { resolveAccessSecret } from './auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
import { SmsService } from '../common/sms/sms.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    forwardRef(() => OrganizationModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Use registerAsync so that .env is loaded by ConfigModule BEFORE we read secret
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_ACCESS_SECRET') || resolveAccessSecret(),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    VerificationService,
    SmsService,
    PasswordService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    TokenVersionGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
