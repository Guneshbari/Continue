import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { FastifyRequest } from 'fastify'
import { FirebaseAdminService } from '../firebase-admin.service'
import { UserProvisioningService } from '../services/user-provisioning.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface'

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly userProvisioning: UserProvisioningService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: AuthenticatedUser }>()

    // Extract token
    const authHeader = request.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!token) {
      if (isPublic) {
        return true
      }
      throw new UnauthorizedException('Authentication token is missing')
    }

    try {
      // Verify token via Firebase Admin (checks revocation as requested)
      const decodedToken = await this.firebaseAdmin.verifyIdToken(token, true)

      // Auto-provision user record locally
      const localUser = await this.userProvisioning.findOrCreateUser(decodedToken)

      // Attach trusted user object to request
      request.user = {
        id: localUser.id,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email!,
        username: localUser.username,
        role: localUser.role,
        displayName: decodedToken.name || null,
        picture: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
      }

      return true
    } catch (error: any) {
      if (isPublic) {
        return true
      }

      const errorCode = error?.code || ''
      let message = 'Invalid authentication token'

      if (errorCode === 'auth/id-token-expired') {
        message = 'Authentication token has expired'
      } else if (errorCode === 'auth/id-token-revoked') {
        message = 'Authentication token has been revoked'
      } else if (errorCode === 'auth/argument-error') {
        message = 'Malformed authentication token'
      }

      throw new UnauthorizedException(message)
    }
  }
}
