import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}))

import { FirebaseAuthGuard } from './firebase-auth.guard'
import { FirebaseAdminService } from '../firebase-admin.service'
import { UserProvisioningService } from '../services/user-provisioning.service'

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard
  let reflector: Reflector
  let firebaseAdmin: FirebaseAdminService
  let userProvisioning: UserProvisioningService

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    }
    const mockFirebaseAdmin = {
      verifyIdToken: jest.fn(),
    }
    const mockUserProvisioning = {
      findOrCreateUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: FirebaseAdminService, useValue: mockFirebaseAdmin },
        { provide: UserProvisioningService, useValue: mockUserProvisioning },
      ],
    }).compile()

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard)
    reflector = module.get(Reflector)
    firebaseAdmin = module.get(FirebaseAdminService)
    userProvisioning = module.get(UserProvisioningService)
  })

  const createMockContext = (authHeader?: string, isPublic = false): ExecutionContext => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(isPublic)

    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
      user: undefined,
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext
  }

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should accept a valid token and attach user to request', async () => {
    const context = createMockContext('Bearer valid-token')
    const decodedToken = {
      uid: 'firebase-uid-123',
      email: 'user@example.com',
      name: 'John Doe',
      picture: 'http://pic.com/pic.jpg',
      email_verified: true,
    }
    const localUser = {
      id: 'local-id-123',
      username: 'johndoe',
      role: 'USER',
    }

    ;(firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValue(decodedToken as any)
    ;(userProvisioning.findOrCreateUser as jest.Mock).mockResolvedValue(localUser as any)

    const canActivate = await guard.canActivate(context)
    expect(canActivate).toBe(true)

    const request = context.switchToHttp().getRequest()
    expect(request.user).toEqual({
      id: 'local-id-123',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      username: 'johndoe',
      role: 'USER',
      displayName: 'John Doe',
      picture: 'http://pic.com/pic.jpg',
      emailVerified: true,
    })
  })

  it('should reject missing token for protected routes', async () => {
    const context = createMockContext()
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token is missing'),
    )
  })

  it('should accept missing token for public routes but not populate user', async () => {
    const context = createMockContext(undefined, true)
    const canActivate = await guard.canActivate(context)
    expect(canActivate).toBe(true)

    const request = context.switchToHttp().getRequest()
    expect(request.user).toBeUndefined()
  })

  it('should reject expired tokens with normalized error message', async () => {
    const context = createMockContext('Bearer expired-token')
    ;(firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValue({ code: 'auth/id-token-expired' })

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token has expired'),
    )
  })

  it('should reject revoked tokens with normalized error message', async () => {
    const context = createMockContext('Bearer revoked-token')
    ;(firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValue({ code: 'auth/id-token-revoked' })

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authentication token has been revoked'),
    )
  })

  it('should reject malformed tokens with normalized error message', async () => {
    const context = createMockContext('Bearer malformed-token')
    ;(firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValue({ code: 'auth/argument-error' })

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Malformed authentication token'),
    )
  })

  it('should accept invalid token on a public route without throwing', async () => {
    const context = createMockContext('Bearer invalid-token', true)
    ;(firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValue({ code: 'auth/id-token-expired' })

    const canActivate = await guard.canActivate(context)
    expect(canActivate).toBe(true)
  })
})
