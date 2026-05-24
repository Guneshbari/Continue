import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  override canActivate(context: ExecutionContext) {
    // Always run strategy so that a valid token in the Authorization header populates req.user.
    // If the token is missing/invalid, handleRequest will bypass throwing an error for public routes.
    return super.canActivate(context)
  }

  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) return user

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return null

    return super.handleRequest(err, user, info, context)
  }
}
