import { Test, TestingModule } from '@nestjs/testing'

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}))

import { UserProvisioningService } from './user-provisioning.service'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { UserRole } from '@prisma/client'

describe('UserProvisioningService', () => {
  let service: UserProvisioningService
  let prisma: PrismaService

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProvisioningService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()

    service = module.get<UserProvisioningService>(UserProvisioningService)
    prisma = module.get(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return existing user if found by firebaseUid', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      firebaseUid: 'uid-123',
    }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser as any)

    const result = await service.findOrCreateUser({
      uid: 'uid-123',
      email: 'test@example.com',
    } as any)

    expect(result).toEqual(existingUser)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: 'uid-123' } })
  })

  it('should link Firebase UID if user found by email', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      firebaseUid: null,
    }
    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by firebaseUid
      .mockResolvedValueOnce(existingUser as any) // by email
    ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({
      ...existingUser,
      firebaseUid: 'uid-123',
    } as any)

    const result = await service.findOrCreateUser({
      uid: 'uid-123',
      email: 'test@example.com',
    } as any)

    expect(result.firebaseUid).toBe('uid-123')
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { firebaseUid: 'uid-123' },
    })
  })

  it('should create new user with derived unique username', async () => {
    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by firebaseUid
      .mockResolvedValueOnce(null) // by email
      .mockResolvedValueOnce(null) // username availability check: testuser is free

    const newUser = {
      id: 'user-2',
      email: 'testuser@example.com',
      username: 'testuser',
      firebaseUid: 'uid-456',
    }
    ;(prisma.user.create as jest.Mock).mockResolvedValueOnce(newUser as any)

    const result = await service.findOrCreateUser({
      uid: 'uid-456',
      email: 'testuser@example.com',
      name: 'Test User',
      picture: 'http://pic.jpg',
      email_verified: true,
    } as any)

    expect(result).toEqual(newUser)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseUid: 'uid-456',
        email: 'testuser@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'http://pic.jpg',
        role: UserRole.USER,
        isVerified: true,
      },
    })
  })

  it('should handle reserved and duplicate usernames by appending a suffix', async () => {
    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by firebaseUid
      .mockResolvedValueOnce(null) // by email
      .mockResolvedValueOnce({ id: 'exists' } as any) // check username: 'admin1' exists
      .mockResolvedValueOnce(null) // check username: 'admin2' is free

    const newUser = {
      id: 'user-3',
      email: 'admin@example.com',
      username: 'admin2',
      firebaseUid: 'uid-789',
    }
    ;(prisma.user.create as jest.Mock).mockResolvedValueOnce(newUser as any)

    const result = await service.findOrCreateUser({
      uid: 'uid-789',
      email: 'admin@example.com',
    } as any)

    expect(result.username).toBe('admin2')
  })
})
