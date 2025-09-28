import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ResponseInterceptor } from './common/response.interceptor';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(logger);
  // Allow both LAN IP and localhost for frontend
  const origins = (
    process.env.CORS_ORIGIN || 'http://10.22.114.199:3000,http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());
  console.log('CORS allowed origins:', origins);
  app.enableCors({
    // typed loosely for simplicity; adjust if stricter typing desired
    origin: (origin: any, callback: any) => {
      if (!origin) return callback(null, true); // allow non-browser (curl / server-side)
      if (origins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS blocked for origin: ' + origin));
    },
    credentials: true,
  });
  // Security middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  // compression library CJS interop: exported function or default
  const compressionFn = (compression as any).default || (compression as any);
  app.use(compressionFn());
  // If behind reverse proxy (nginx), express adapter trust proxy can be enabled:
  const httpAdapter: any = app.getHttpAdapter();
  if (httpAdapter?.getInstance) {
    const instance = httpAdapter.getInstance();
    if (instance?.set) instance.set('trust proxy', 1);
  }
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`API listening on port ${port}`);
  logger.log('Allowed CORS origins: ' + origins.join(', '));
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received. Closing gracefully...');
    await app.close();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    logger.log('SIGINT received. Closing gracefully...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
