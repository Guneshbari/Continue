import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Wraps non-null, non-array responses in { data } envelope.
 * Array responses and pre-wrapped { data } objects pass through unchanged.
 * 204 No Content (null/undefined) also passes through.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        // Null (204 No Content) — pass through
        if (value === null || value === undefined) return value

        // Already wrapped or is a raw array with pagination — pass through
        if (typeof value === 'object' && 'data' in (value as object)) return value

        // Wrap everything else
        return { data: value }
      }),
    )
  }
}
