import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_change_me',
    });
  }
  async validate(payload: any) {
    return {
      userId: payload.sub,
      tenantId: payload.tid,
      phone: payload.phone,
      roles: payload.roles || { global: [], org: [] },
      tokenVersion: payload.tokenVersion ?? 1,
    };
  }
}
