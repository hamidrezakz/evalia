import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import { SmsService } from '../common/sms/sms.service';

interface CreateAndSendArgs {
  identifier: string;
  identifierType: 'EMAIL' | 'PHONE';
  purpose: string;
}
interface VerifyArgs {
  identifier: string;
  identifierType: 'EMAIL' | 'PHONE';
  code: string;
  purpose: string;
}

@Injectable()
export class VerificationService {
  private codeLength = 6;
  private ttlMinutes = 5;
  private resendWindowMs = 30_000; // 30s throttle
  private maxDailyPerIdentifier = 30; // daily cap per identifier & purpose
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
  ) {}
  private hash(raw: string) {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async createAndSend(args: CreateAndSendArgs) {
    const now = new Date();
    // Throttle: last unconsumed code within resend window
    const recent = await this.prisma.verificationCode.findFirst({
      where: {
        identifier: args.identifier,
        identifierType: args.identifierType as any,
        purpose: args.purpose as any,
        createdAt: { gt: new Date(Date.now() - this.resendWindowMs) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      const waitMs =
        this.resendWindowMs - (now.getTime() - recent.createdAt.getTime());
      throw new BadRequestException(
        `لطفاً ${Math.ceil(waitMs / 1000)} ثانیه دیگر تلاش کنید`,
      );
    }

    // Daily cap
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const countDay = await this.prisma.verificationCode.count({
      where: {
        identifier: args.identifier,
        identifierType: args.identifierType as any,
        purpose: args.purpose as any,
        createdAt: { gt: since },
      },
    });
    if (countDay >= this.maxDailyPerIdentifier) {
      throw new BadRequestException('حداکثر دفعات مجاز امروز مصرف شده است');
    }

    // Invalidate previous unconsumed active codes for same identifier/purpose
    await this.prisma.verificationCode.updateMany({
      where: {
        identifier: args.identifier,
        identifierType: args.identifierType as any,
        purpose: args.purpose as any,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { expiresAt: now },
    });

    // Generate OTP code locally (shared template mode)
    let code = Math.floor(Math.random() * 10 ** this.codeLength)
      .toString()
      .padStart(this.codeLength, '0');
    let codeHash = this.hash(code);
    const expiresAt = new Date(Date.now() + this.ttlMinutes * 60 * 1000);
    let providerMeta: any = {};
    if (args.identifierType === 'PHONE') {
      try {
        const sendRes = await this.sms.sendSharedOtp(args.identifier, code);
        providerMeta = {
          provider: 'melipayamak',
          status: sendRes.status,
          recId: sendRes.recId,
          sharedTemplate: true,
        };
        if (!sendRes.ok) {
          throw new BadRequestException({
            message:
              'ارسال پیامک با خطا مواجه شد (status=' + sendRes.status + ')',
            smsStatus: providerMeta,
          });
        }
      } catch (e: any) {
        if (!(e instanceof BadRequestException)) {
          throw new BadRequestException('ارسال پیامک انجام نشد');
        }
        throw e;
      }
    }

    await this.prisma.verificationCode.create({
      data: {
        identifierType: args.identifierType as any,
        purpose: args.purpose as any,
        identifier: args.identifier,
        codeHash,
        expiresAt,
        maxAttempts: 5,
        meta: providerMeta,
      },
    });
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      ok: true,
      devCode: isDev ? code : undefined,
      smsStatus: providerMeta,
    };
  }

  async verify(args: VerifyArgs) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        identifierType: args.identifierType as any,
        purpose: args.purpose as any,
        identifier: args.identifier,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return { ok: false };
    if (record.attempts >= record.maxAttempts)
      return { ok: false, reason: 'attempts_exceeded' };
    const hash = this.hash(args.code);
    const success = hash === record.codeHash;
    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: {
        attempts: { increment: 1 } as any,
        consumedAt: success ? new Date() : null,
      },
    });
    if (!success) return { ok: false };
    return { ok: true };
  }
}
