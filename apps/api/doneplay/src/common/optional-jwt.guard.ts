import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { OPTIONAL_JWT_KEY } from './optional-jwt.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard that allows requests with or without JWT.
 * If JWT is present and valid, req.user will be set. If not, req.user will be undefined, but access is still allowed.
 * Usage: @UseGuards(OptionalJwtGuard) on controller or route (with @OptionalJwt())
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If endpoint is public, skip JWT check entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // If endpoint is optional-jwt, try JWT but allow if missing
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_JWT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!isOptional) {
      // Default AuthGuard('jwt') behavior
      return super.canActivate(context) as Promise<boolean>;
    }
    // Try to authenticate, but ignore errors
    try {
      await super.canActivate(context);
    } catch (e) {
      // Ignore error, allow request to proceed without user
    }
    return true;
  }
}
