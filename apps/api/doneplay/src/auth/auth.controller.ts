import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/public.decorator';
import { CheckIdentifierDto } from './dto/check-identifier.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cfg: ConfigService,
  ) {}

  @Public()
  @Post('check-identifier')
  async checkIdentifier(@Body() dto: CheckIdentifierDto) {
    const res = await this.auth.checkIdentifier(dto);
    return {
      data: res,
      message: res.exists ? 'کاربر موجود است' : 'کاربر موجود نیست',
    };
  }

  @Public()
  @Post('login/password')
  async loginPassword(@Body() dto: LoginPasswordDto) {
    const res = await this.auth.loginPassword(dto);
    return {
      data: res,
      message: 'ورود با موفقیت انجام شد',
    };
  }

  @Public()
  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const res = await this.auth.requestOtp(dto);
    return {
      data: res,
      message: 'کد تایید ارسال شد',
    };
  }

  @Public()
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const res = await this.auth.verifyOtp(dto);
    return {
      data: res,
      message: res?.mode === 'LOGIN' ? 'ورود با موفقیت انجام شد' : null,
    };
  }

  @Public()
  @Post('complete-registration')
  completeRegistration(@Body() dto: CompleteRegistrationDto) {
    return this.auth.completeRegistration(dto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Public()
  @Get('health')
  health() {
    return { ok: true };
  }
  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshTokens(dto);
  }
  @Public()
  @Post('check-token')
  checkToken(@Body() body: { accessToken: string }) {
    return this.auth.checkAccessToken(body.accessToken);
  }
}
