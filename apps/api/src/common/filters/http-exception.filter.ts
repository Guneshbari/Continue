import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

interface ErrorResponseBody {
  statusCode?: number
  error?: string
  message?: string | string[]
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<FastifyReply>()
    const request = context.getRequest<FastifyRequest>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined
    const body =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : undefined

    void response.status(status).send({
      statusCode: status,
      error: body?.error ?? 'Error',
      message:
        body?.message ??
        (typeof exceptionResponse === 'string' ? exceptionResponse : 'Internal server error'),
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
