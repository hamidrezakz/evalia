// Generate a placeholder email from phone (for systems that require unique email)
function phoneToEmail(phone: string): string {
  // Remove + and non-digits for email local part
  const digits = phone.replace(/[^0-9]/g, '');
  return `user${digits}@phone.local`;
}
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { VerificationService } from './verification.service';
import { CheckIdentifierDto } from './dto/check-identifier.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// Phone normalization: expect E.164 or local starting 0 -> convert to +98 etc (extend later)
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  // keep only digits and +
  let digits = trimmed.replace(/[^0-9+]/g, '');
  // Example heuristic: if starts with 0 and length 11 assume Iran mobile 09********* -> +98**********
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '+98' + digits.substring(1);
  }
  if (!digits.startsWith('+'))
    throw new BadRequestException('شماره باید با + یا 0 شروع شود');
  if (digits.length < 10) throw new BadRequestException('شماره معتبر نیست');
  return digits;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly password: PasswordService,
    private readonly verification: VerificationService,
  ) {}

  // Only phone used in initial onboarding phase
  async checkIdentifier(dto: CheckIdentifierDto) {
    const phoneNormalized = normalizePhone(dto.phone);
    const user = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    return { exists: !!user };
  }

  // Complete registration after OTP verified for a NEW phone (signupToken from verifyOtp)
  async completeRegistration(dto: CompleteRegistrationDto) {
    let payload: any;
    try {
      payload = this.jwt.verify(dto.signupToken);
    } catch {
      throw new BadRequestException('Invalid signup token');
    }
    if (payload.type !== 'signup' || !payload.phoneNormalized) {
      throw new BadRequestException('Signup token is not valid');
    }
    const phoneNormalized = payload.phoneNormalized as string;
    const exists = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (exists) throw new BadRequestException('User already exists');
    const passwordHash = dto.password
      ? await this.password.hash(dto.password)
      : null;
    const user = await this.prisma.user.create({
      data: {
        phoneNormalized,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        fullName: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
        passwordHash,
      },
    });
    return {
      user: this.toPublicUser(user),
      tokens: await this.issueTokens(user.id),
    };
  }

  async loginPassword(dto: LoginPasswordDto) {
    const phoneNormalized = normalizePhone(dto.phone);
    const user = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.passwordHash)
      throw new BadRequestException('Password not set for this user');
    const ok = await this.password.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Incorrect password');
    return {
      user: this.toPublicUser(user),
      tokens: await this.issueTokens(user.id),
    };
  }

  // Separate email login for users who later added email to their profile
  async loginEmail(dto: LoginEmailDto) {
    const norm = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { email: norm } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.passwordHash)
      throw new BadRequestException('Password not set for this user');
    const ok = await this.password.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Incorrect password');
    return {
      user: this.toPublicUser(user),
      tokens: await this.issueTokens(user.id),
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const phoneNormalized = normalizePhone(dto.phone);
    await this.verification.createAndSend({
      identifier: phoneNormalized,
      identifierType: 'PHONE',
      purpose: dto.purpose,
    });
    return { ok: true };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phoneNormalized = normalizePhone(dto.phone);
    const verified = await this.verification.verify({
      identifier: phoneNormalized,
      identifierType: 'PHONE',
      code: dto.code,
      purpose: dto.purpose,
    });
    if (!verified.ok)
      throw new BadRequestException('Code is invalid or expired');
    const user = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (user) {
      // existing user -> direct login
      return {
        user: this.toPublicUser(user),
        tokens: await this.issueTokens(user.id),
        mode: 'LOGIN',
      };
    }
    // new phone -> return signupToken to continue registration
    const signupToken = this.jwt.sign(
      { type: 'signup', phoneNormalized },
      { expiresIn: '10m' },
    );
    return { signupToken, mode: 'SIGNUP' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const phoneNormalized = normalizePhone(dto.phone);
    const user = await this.prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (!user) throw new BadRequestException('User not found');
    const v = await this.verification.verify({
      identifier: phoneNormalized,
      identifierType: 'PHONE',
      code: dto.code,
      purpose: 'PASSWORD_RESET',
    });
    if (!v.ok) throw new BadRequestException('Code is invalid');
    const passwordHash = await this.password.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return { ok: true };
  }

  private async gatherRoles(userId: number) {
    const numericId = userId;
    const user = await this.prisma.user.findUnique({
      where: { id: numericId as any },
      select: {
        globalRoles: true,
        memberships: { select: { organizationId: true, roles: true } },
      },
    });
    return {
      global: user?.globalRoles || [],
      org: (user?.memberships || []).map((m) => ({
        orgId: m.organizationId,
        roles: m.roles || [],
      })),
    };
  }

  private async issueTokens(userId: number) {
    const roles = await this.gatherRoles(userId);
    // Fetch tokenVersion to embed in JWT (for selective invalidation)
    const userTokenMeta = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    });
    const tokenVersion = userTokenMeta?.tokenVersion ?? 1;
    const accessToken = this.jwt.sign({
      sub: userId,
      type: 'access',
      roles,
      tokenVersion,
    });
    const refreshToken = this.jwt.sign(
      { sub: userId, type: 'refresh', tokenVersion },
      { expiresIn: '21d' },
    );
    return { accessToken, refreshToken, roles };
  }

  private toPublicUser(user: any) {
    const { id, email, phoneNormalized, fullName, firstName, lastName } = user;
    return { id, email, phone: phoneNormalized, fullName, firstName, lastName };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    let payload: any;
    try {
      payload = this.jwt.verify(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }
    if (payload.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Refresh token is not valid');
    }
    const userId = payload.sub;
    // Check user existence and tokenVersion
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const tokenVersionFromToken = payload.tokenVersion ?? 1;
    const currentVersion = user.tokenVersion ?? 1;
    if (tokenVersionFromToken !== currentVersion) {
      throw new UnauthorizedException('Token has expired, please login again');
    }
    const tokens = await this.issueTokens(userId);
    return { user: this.toPublicUser(user), tokens };
  }

  /**
   * Checks access token validity and tokenVersion for a given token.
   * Returns { valid: boolean, reason?: string, tokenVersion?: number, currentVersion?: number }
   */
  async checkAccessToken(token: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      return { valid: false, reason: 'Access token is invalid' };
    }
    if (payload.type !== 'access' || !payload.sub) {
      return { valid: false, reason: 'Token is not a valid access token' };
    }
    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { valid: false, reason: 'User not found' };
    const tokenVersionFromToken = payload.tokenVersion ?? 1;
    const currentVersion = user.tokenVersion ?? 1;
    if (tokenVersionFromToken !== currentVersion) {
      return {
        valid: false,
        reason: 'Token version mismatch',
        tokenVersion: tokenVersionFromToken,
        currentVersion,
      };
    }
    return {
      valid: true,
      tokenVersion: tokenVersionFromToken,
      currentVersion,
    };
  }
}
