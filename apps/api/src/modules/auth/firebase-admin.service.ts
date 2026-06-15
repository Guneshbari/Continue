import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { initializeApp, getApps, App, cert } from 'firebase-admin/app'
import { getAuth, DecodedIdToken, UserRecord } from 'firebase-admin/auth'

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private firebaseApp!: App

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID')
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL')
    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase credentials. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must be defined.',
      )
    }

    // Parse escaped newlines if any
    privateKey = privateKey.replace(/\\n/g, '\n')

    const existingApps = getApps()
    if (existingApps.length === 0) {
      this.firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else {
      this.firebaseApp = existingApps[0]!
    }
  }

  async verifyIdToken(token: string, checkRevoked = true): Promise<DecodedIdToken> {
    return getAuth(this.firebaseApp).verifyIdToken(token, checkRevoked)
  }

  async getUser(uid: string): Promise<UserRecord> {
    return getAuth(this.firebaseApp).getUser(uid)
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    await getAuth(this.firebaseApp).revokeRefreshTokens(uid)
  }
}
