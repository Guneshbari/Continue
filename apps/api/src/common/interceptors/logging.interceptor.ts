import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import type { FastifyRequest } from 'fastify'

/**
 * Structured request logging interceptor.
 * Logs: method, path, status code, duration (ms).
 * Only logs errors at warn/error level — keeps noise low.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    const { method, url } = request
    const startMs = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startMs
          const statusCode = ctx.switchToHttp().getResponse<{ statusCode: number }>().statusCode ?? 200
          this.logger.log(`${method} ${url} ${statusCode} +${duration}ms`)
        },
        error: (err: unknown) => {
          const duration = Date.now() - startMs
          const status = (err as { status?: number })?.status ?? 500
          // 4xx → warn, 5xx → error
          if (status >= 500) {
            this.logger.error(`${method} ${url} ${status} +${duration}ms`)
          } else {
            this.logger.warn(`${method} ${url} ${status} +${duration}ms`)
          }
        },
      }),
    )
  }
}
