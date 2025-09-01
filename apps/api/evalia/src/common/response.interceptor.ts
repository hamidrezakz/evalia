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
        if (value && value.__raw) {
          return value.payload; // escape hatch
        }
        if (value && value.data !== undefined && value.meta) {
          return {
            data: value.data,
            meta: value.meta,
            tookMs: Date.now() - started,
          };
        }
        return { data: value, tookMs: Date.now() - started };
      }),
    );
  }
}
