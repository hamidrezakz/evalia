import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_change_meee',
    });
  }
  async validate(payload: any) {
    // Defensive: if payload is missing sub or roles, treat as invalid
    if (!payload || typeof payload.sub === 'undefined' || !payload.roles) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    // You can add more checks here (e.g. type, tokenVersion, etc)
    return {
      userId: payload.sub,
      tenantId: payload.tid,
      phone: payload.phone,
      roles: payload.roles || { global: [], org: [] },
      tokenVersion: payload.tokenVersion ?? 1,
    };
  }
}
