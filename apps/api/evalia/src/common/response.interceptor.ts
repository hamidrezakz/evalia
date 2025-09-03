import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started = Date.now();
    return next.handle().pipe(
      map((value) => {
        // Escape hatch: controller/service intentionally returns raw payload (no wrapping)
        if (value && value.__raw) {
          return value.payload;
        }

        const tookMs = Date.now() - started;
        // Already formatted pattern: { data, meta?, ... } -> augment (idempotent)
        if (value && typeof value === 'object' && value.data !== undefined) {
          return {
            success: value.success !== undefined ? value.success : true,
            code: value.code !== undefined ? value.code : 200,
            message: value.message || null,
            error: value.error || null,
            data: value.data,
            meta: value.meta || null,
            tookMs,
          };
        }

        // Primitive / array / plain object => wrap freshly
        return {
          success: true,
          code: 200,
          message: null,
          error: null,
          data: value,
          meta: null,
          tookMs,
        };
      }),
    );
  }
}
