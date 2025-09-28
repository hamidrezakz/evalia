import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  resolveAccessSecret,
  DEFAULT_JWT_ACCESS_SECRET,
} from './auth.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cfg: ConfigService) {
    const envSecret = cfg.get<string>('JWT_ACCESS_SECRET');
    const finalSecret = envSecret || resolveAccessSecret();
    if (!envSecret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_ACCESS_SECRET not set in production');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: finalSecret,
    });
  }
  async validate(payload: any) {
    // Minimal validation
    if (!payload || typeof payload.sub === 'undefined') {
      throw new UnauthorizedException('Invalid JWT payload (missing sub)');
    }
    // Some older tokens might lack roles; normalize to empty structure instead of outright rejection
    let roles = payload.roles;
    if (!roles || typeof roles !== 'object') roles = { global: [], org: [] };
    return {
      userId: payload.sub,
      tenantId: payload.tid,
      phone: payload.phone,
      roles,
      tokenVersion: payload.tokenVersion ?? 1,
    };
  }
}
