import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { FastifyRequest } from 'fastify'
import { ROLES_KEY } from '../decorators/roles.decorator'

type AuthRole = 'USER' | 'MODERATOR' | 'ADMIN'

interface RequestWithUser extends FastifyRequest {
  user?: {
    role?: AuthRole
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AuthRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const role = request.user?.role

    return Boolean(role && roles.includes(role))
  }
}
