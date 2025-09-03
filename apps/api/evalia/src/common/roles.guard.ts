/**
 * مثال استفاده از گارد نقش و دکوریتور Roles:
 *
 * import { Controller, Get, UseGuards } from '@nestjs/common';
 * import { AuthGuard } from '@nestjs/passport';
 * import { Roles } from './roles.decorator';
 *
 * // اگر RolesGuard به صورت global با APP_GUARD ثبت شده باشد، فقط کافی است:
 *
 * @Controller('admin')
 * @UseGuards(AuthGuard('jwt'))
 * export class AdminController {
 *   @Get('dashboard')
 *   @Roles('ADMIN', 'ORG:OWNER')
 *   getDashboard() {
 *     return { message: 'دسترسی مجاز!' };
 *   }
 * }
 */

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
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    if (!user) throw new ForbiddenException('unauthorized');
    const roles = (user.roles || { global: [], org: [] }) as JwtRolesPayload;

    // SUPER_ADMIN always allowed (global bypass)
    if (roles.global.includes('SUPER_ADMIN')) return true;

    if (!required || required.length === 0) return true;

    // Allow if any required role matches global roles
    if (required.some((r) => roles.global.includes(r))) return true;

    // Support ORG:<ROLE> pattern
    const orgPatternRoles = required.filter((r) => r.startsWith('ORG:'));
    if (orgPatternRoles.length) {
      const needed = orgPatternRoles.map((r) => r.split(':')[1]);
      if (roles.org.some((o) => needed.includes(o.role))) return true;
    }

    throw new ForbiddenException('دسترسی کافی به این بخش ندارید');
  }
}
