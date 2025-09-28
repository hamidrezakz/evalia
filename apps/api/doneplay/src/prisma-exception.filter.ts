import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (this.isPrismaKnownError(exception)) {
      const prismaError = exception as Prisma.PrismaClientKnownRequestError;
      let status = HttpStatus.BAD_REQUEST;
      let message = 'Database constraint error';

      switch (prismaError.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on: ${(prismaError.meta as any)?.target}`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          this.logger.warn(`Unhandled Prisma error code: ${prismaError.code}`);
      }
      return response
        .status(status)
        .json({ error: message, code: prismaError.code });
    }

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    this.logger.error('Unexpected error', exception?.stack || exception);
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }

  private isPrismaKnownError(
    ex: any,
  ): ex is Prisma.PrismaClientKnownRequestError {
    return ex && typeof ex === 'object' && ex.code && ex.clientVersion;
  }
}
