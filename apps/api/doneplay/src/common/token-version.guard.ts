import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_TOKEN_VERSION_KEY } from './check-token-version.decorator';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TokenVersionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresCheck = this.reflector.getAllAndOverride<boolean>(
      CHECK_TOKEN_VERSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiresCheck) return true; // skip

    const request = context.switchToHttp().getRequest();
    const user = request.user as any;
    if (!user?.userId) throw new UnauthorizedException('Invalid token');

    // Payload tokenVersion provided by JwtStrategy validate
    const tokenVersionFromToken = user.tokenVersion ?? 1;
    // Load current tokenVersion
    const dbUser: any = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, tokenVersion: true },
    });
    const currentVersion = dbUser?.tokenVersion ?? 1;
    if (currentVersion !== tokenVersionFromToken) {
      throw new UnauthorizedException('Session expired, please login again');
    }
    return true;
  }
}
