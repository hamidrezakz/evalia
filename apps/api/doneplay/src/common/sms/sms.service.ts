import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import https = require('https');

// We use dynamic import to avoid hard dependency if package missing in some environments.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private enabled: boolean;
  private apiToken: string | undefined; // token part used in URL path
  private sharedBodyId: string | undefined; // bodyId for shared template mode

  constructor(private readonly cfg: ConfigService) {
    this.apiToken = this.cfg.get<string>('SMS_API_TOKEN');
    this.sharedBodyId = this.cfg.get<string>('SMS_SHARED_BODY_ID');
    this.enabled = !!this.apiToken;
    if (!this.enabled) {
      this.logger.warn('SMS disabled: set SMS_API_TOKEN');
    } else {
      this.logger.log('SMS token mode active');
    }
  }

  // Slimmed: removed unused direct provider OTP endpoint logic

  /** Token API shared template send: POST /api/send/shared/{token} { bodyId,to,args } -> { recId, status } */
  async sendSharedTemplate(
    phone: string,
    args: string[],
    bodyId?: string,
  ): Promise<{ recId?: number; status?: string }> {
    if (!this.enabled) return { status: 'disabled' };
    const bId = bodyId || this.sharedBodyId;
    if (!bId) throw new Error('Missing shared bodyId');
    const normalized = this.normalizeForProvider(phone);
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        bodyId: Number(bId),
        to: normalized,
        args,
      });
      const options: https.RequestOptions = {
        hostname: 'console.melipayamak.com',
        port: 443,
        path: `/api/send/shared/${this.apiToken}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (d) => chunks.push(d as Buffer));
        res.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8');
            const parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (e) {
            resolve({ status: 'parse_error' });
          }
        });
      });
      req.on('error', (e) => reject(e));
      req.write(payload);
      req.end();
    });
  }

  /** Convenience: send OTP via shared template using one variable (the code) */
  async sendSharedOtp(
    phone: string,
    code: string,
    bodyId?: string,
  ): Promise<{ ok: boolean; status?: string; recId?: number }> {
    const res = await this.sendSharedTemplate(phone, [code], bodyId);
    if (res.recId) {
      this.logger.log(
        `Shared template OTP sent to ${phone} recId=${res.recId} status=${res.status || 'OK'}`,
      );
      return { ok: true, status: res.status, recId: res.recId };
    }
    this.logger.error(
      `Shared template OTP failure to ${phone} status=${res.status}`,
    );
    return { ok: false, status: res.status };
  }

  /** Convert incoming +989xxxxxxxxx or 989xxxxxxxxx to 09xxxxxxxxx as required by provider */
  private normalizeForProvider(raw: string): string {
    let p = raw.trim();
    // remove spaces & dashes
    p = p.replace(/[-_\s]/g, '');
    if (p.startsWith('+98')) {
      p = '0' + p.substring(3); // +98 930... -> 0930...
    } else if (/^98\d{10}$/.test(p)) {
      p = '0' + p.substring(2); // 98930... -> 0930...
    }
    return p;
  }

  // Legacy interpretResult removed (token API returns JSON)
}
