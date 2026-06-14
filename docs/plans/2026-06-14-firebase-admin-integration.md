# Firebase Admin Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish a trusted identity verification layer in NestJS using the Firebase Admin SDK.

**Architecture:** Initialize the Firebase Admin SDK once during application startup using `@nestjs/config` for credentials. Expose a global `FirebaseAdminModule` with `FirebaseAdminService` to verify ID tokens and query user profiles from Firebase.

**Tech Stack:** NestJS, TypeScript, Firebase Admin SDK, Zod (environment validation)

---

### Task 1: Add dependency and update environment configuration

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/src/common/config/env.validation.ts`
- Modify: `.env`
- Modify: `.env.example`
- Modify: `apps/api/.env`
- Modify: `apps/api/.env.example`

**Step 1: Install dependency**
Run: `pnpm --filter @continue/api add firebase-admin`
Expected: `firebase-admin` successfully added to `@continue/api`.

**Step 2: Add validation to envSchema**
In `apps/api/src/common/config/env.validation.ts`, add:
```typescript
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_PRIVATE_KEY: z.string().min(1),
```

**Step 3: Update env files with mock credentials**
Add the following to all `.env` and `.env.example` files:
```ini
# Firebase Admin Configuration
FIREBASE_PROJECT_ID="mock-project-id"
FIREBASE_CLIENT_EMAIL="mock-client-email@mock.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3...\n-----END PRIVATE KEY-----\n"
```

**Step 4: Verify typecheck and tests pass**
Run: `pnpm run type-check && pnpm test`
Expected: Compile successful and all 54 tests pass.

**Step 5: Commit**
```bash
git add apps/api/package.json apps/api/src/common/config/env.validation.ts .env .env.example apps/api/.env apps/api/.env.example
git commit -m "chore: add firebase-admin dependency and env configuration validation"
```

---

### Task 2: Create FirebaseAdminService and FirebaseAdminModule

**Files:**
- Create: `apps/api/src/common/firebase/firebase-admin.service.ts`
- Create: `apps/api/src/common/firebase/firebase-admin.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Step 1: Create FirebaseAdminService**
Create `apps/api/src/common/firebase/firebase-admin.service.ts`:
```typescript
import * as admin from 'firebase-admin'
import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name)
  private firebaseApp!: admin.app.App

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID')
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL')
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY')

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.error('❌ Missing Firebase configuration environment variables.')
      throw new Error('Missing Firebase Admin configuration')
    }

    try {
      // Format private key to handle escaped newlines
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      })
      this.logger.log('🔥 Firebase Admin SDK initialized successfully.')
    } catch (err: any) {
      this.logger.error(`❌ Failed to initialize Firebase Admin SDK: ${err.message}`)
      throw err
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth(this.firebaseApp).verifyIdToken(idToken)
    } catch (err: any) {
      this.logger.error(`❌ Firebase token verification failed: ${err.message}`)
      throw err
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth(this.firebaseApp).getUser(uid)
    } catch (err: any) {
      this.logger.error(`❌ Firebase user lookup failed: ${err.message}`)
      throw err
    }
  }
}
```

**Step 2: Create FirebaseAdminModule**
Create `apps/api/src/common/firebase/firebase-admin.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common'
import { FirebaseAdminService } from './firebase-admin.service'

@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
```

**Step 3: Register FirebaseAdminModule in AppModule**
Import `FirebaseAdminModule` and add it to the `imports` array in `apps/api/src/app.module.ts`.

**Step 4: Commit**
```bash
git add apps/api/src/common/firebase/ apps/api/src/app.module.ts
git commit -m "feat: create FirebaseAdminService and FirebaseAdminModule"
```

---

### Task 3: Add Authentication Test Suite and verify

**Files:**
- Create: `apps/api/src/common/firebase/firebase-admin.service.spec.ts`

**Step 1: Write unit tests**
Create `apps/api/src/common/firebase/firebase-admin.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { FirebaseAdminService } from './firebase-admin.service'
import * as admin from 'firebase-admin'

jest.mock('firebase-admin', () => {
  const mockAuthInstance = {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  }
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: jest.fn(() => mockAuthInstance),
  }
})

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService
  let configService: ConfigService

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'mock-project-id'
      if (key === 'FIREBASE_CLIENT_EMAIL') return 'mock-client-email'
      if (key === 'FIREBASE_PRIVATE_KEY') return 'mock-private-key'
      return null
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<FirebaseAdminService>(FirebaseAdminService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('onModuleInit', () => {
    it('should initialize firebase app successfully if config is present', () => {
      service.onModuleInit()
      expect(admin.initializeApp).toHaveBeenCalledTimes(1)
      expect(admin.credential.cert).toHaveBeenCalledWith({
        projectId: 'mock-project-id',
        clientEmail: 'mock-client-email',
        privateKey: 'mock-private-key',
      })
    })

    it('should replace escaped newlines in private key', () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'FIREBASE_PRIVATE_KEY') return 'key\\nwith\\nnewlines'
        return 'mock-val'
      })

      service.onModuleInit()
      expect(admin.credential.cert).toHaveBeenCalledWith({
        projectId: 'mock-val',
        clientEmail: 'mock-val',
        privateKey: 'key\nwith\nnewlines',
      })
    })

    it('should throw error if any configuration variable is missing', () => {
      mockConfig.get.mockReturnValue(undefined)
      expect(() => service.onModuleInit()).toThrow('Missing Firebase Admin configuration')
      expect(admin.initializeApp).not.toHaveBeenCalled()
    })
  })

  describe('verifyIdToken', () => {
    beforeEach(() => {
      service.onModuleInit()
    })

    it('should return decoded token on success', async () => {
      const mockDecoded = { uid: 'user123', email: 'test@example.com' }
      const mockAuth = admin.auth() as any
      mockAuth.verifyIdToken.mockResolvedValue(mockDecoded)

      const result = await service.verifyIdToken('valid-token')
      expect(result).toEqual(mockDecoded)
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    })

    it('should throw on verification error', async () => {
      const mockAuth = admin.auth() as any
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

      await expect(service.verifyIdToken('invalid-token')).rejects.toThrow('Invalid token')
    })
  })

  describe('getUserByUid', () => {
    beforeEach(() => {
      service.onModuleInit()
    })

    it('should return user record on success', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' }
      const mockAuth = admin.auth() as any
      mockAuth.getUser.mockResolvedValue(mockUser)

      const result = await service.getUserByUid('user123')
      expect(result).toEqual(mockUser)
      expect(mockAuth.getUser).toHaveBeenCalledWith('user123')
    })

    it('should throw on lookup error', async () => {
      const mockAuth = admin.auth() as any
      mockAuth.getUser.mockRejectedValue(new Error('User not found'))

      await expect(service.getUserByUid('invalid-uid')).rejects.toThrow('User not found')
    })
  })
})
```

**Step 2: Run unit test**
Run: `pnpm --filter @continue/api exec jest src/common/firebase/firebase-admin.service.spec.ts`
Expected: Test passes completely.

**Step 3: Run all project tests and typecheck**
Run: `pnpm run type-check && pnpm test`
Expected: Everything compiles and passes.

**Step 4: Commit**
```bash
git add apps/api/src/common/firebase/firebase-admin.service.spec.ts
git commit -m "test: add FirebaseAdminService unit tests"
```
