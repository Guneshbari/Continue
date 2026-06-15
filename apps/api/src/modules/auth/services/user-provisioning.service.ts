import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { UserRole } from '@prisma/client'

@Injectable()
export class UserProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(decodedToken: DecodedIdToken) {
    const firebaseUid = decodedToken.uid
    const email = decodedToken.email

    if (!email) {
      throw new ConflictException('Email is required from identity token')
    }

    // 1. Try to find user by firebaseUid
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (user) {
      return user
    }

    // 2. Try to find user by email to link Firebase UID
    user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Link Firebase UID to existing user
      return this.prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid },
      })
    }

    // 3. Create a new user
    // Generate a unique username from email
    const baseUsername = email.split('@')[0]!.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user'
    let username = baseUsername
    let suffix = 1

    // Ensure username is unique and not a reserved word
    const RESERVED_USERNAMES = [
      'admin', 'support', 'continue', 'api', 'auth', 'settings', 'discover', 'games', 'lists', 'u'
    ]

    while (true) {
      if (RESERVED_USERNAMES.includes(username)) {
        username = `${baseUsername}${suffix++}`
        continue
      }

      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      })

      if (!existingUsername) {
        break
      }

      username = `${baseUsername}${suffix++}`
    }

    // Handle displayName and avatarUrl
    const displayName = decodedToken.name || null
    const avatarUrl = decodedToken.picture || null

    try {
      return await this.prisma.user.create({
        data: {
          firebaseUid,
          email,
          username,
          displayName,
          avatarUrl,
          role: UserRole.USER,
          isVerified: decodedToken.email_verified || false,
        },
      })
    } catch (error: any) {
      // In case of race conditions (e.g. parallel requests), try fetching the user one more time
      const checkAgain = await this.prisma.user.findFirst({
        where: {
          OR: [{ firebaseUid }, { email }],
        },
      })
      if (checkAgain) {
        if (!checkAgain.firebaseUid) {
          return this.prisma.user.update({
            where: { id: checkAgain.id },
            data: { firebaseUid },
          })
        }
        return checkAgain
      }
      throw new InternalServerErrorException('Failed to provision user: ' + error.message)
    }
  }
}
