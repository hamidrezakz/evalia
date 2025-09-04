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
import { IS_PUBLIC_KEY } from './public.decorator';
import { ROLES_KEY, AdvancedRolesDescriptor } from './roles.decorator';

interface JwtRolesPayload {
  global: string[];
  org: { orgId: string; role: string }[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow public endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const meta = this.reflector.getAllAndOverride<any>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    if (!user) throw new ForbiddenException('unauthorized');
    const roles = (user.roles || { global: [], org: [] }) as JwtRolesPayload;

    // SUPER_ADMIN always allowed (global bypass) 
    if (roles.global.includes('SUPER_ADMIN')) return true;

    if (!meta) return true;

    // Backward compatibility: meta is an array of strings
    if (Array.isArray(meta)) {
      if (meta.length === 0) return true;
      if (meta.some((r) => roles.global.includes(r))) return true;
      const orgPatternRoles = meta.filter((r) => r.startsWith('ORG:'));
      if (orgPatternRoles.length) {
        const needed = orgPatternRoles.map((r) => r.split(':')[1]);
        if (roles.org.some((o) => needed.includes(o.role))) return true;
      }
      throw new ForbiddenException('دسترسی کافی به این بخش ندارید');
    }

    // Advanced descriptor mode
    const descriptor = meta as AdvancedRolesDescriptor;
    const { any = [], all = [], orgAny = [], orgAll = [] } = descriptor;

    // Helper resolvers
    const hasGlobal = (r: string) => roles.global.includes(r);
    const hasOrgRole = (r: string) => roles.org.some((o) => o.role === r);
    const matchToken = (token: string): boolean => {
      if (token.startsWith('ORG:')) {
        const role = token.split(':')[1];
        return hasOrgRole(role);
      }
      return hasGlobal(token);
    };

    // any: at least one matches (global or ORG: pattern aware)
    if (any.length && any.some(matchToken)) return true;

    // all: every listed global role must exist
    if (all.length && all.every(hasGlobal)) return true;

    // orgAny: at least one org role present
    if (orgAny.length && orgAny.some(hasOrgRole)) return true;

    // orgAll: all org roles must be present (possibly across org memberships)
    if (orgAll.length && orgAll.every(hasOrgRole)) return true;

    throw new ForbiddenException('دسترسی کافی به این بخش ندارید');
  }
}
