import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

interface JwtRolesPayload {
  global: string[];
  org: { orgId: string; role: string }[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    if (!user) throw new ForbiddenException('unauthorized');
    const roles = (user.roles || { global: [], org: [] }) as JwtRolesPayload;

    // Allow if any required role matches global roles
    if (required.some((r) => roles.global.includes(r))) return true;

    // Support ORG:<ROLE> pattern
    const orgPatternRoles = required.filter((r) => r.startsWith('ORG:'));
    if (orgPatternRoles.length) {
      const needed = orgPatternRoles.map((r) => r.split(':')[1]);
      if (roles.org.some((o) => needed.includes(o.role))) return true;
    }

    throw new ForbiddenException('insufficient role');
  }
}
