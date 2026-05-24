import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'node:crypto'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'

interface SafeUser {
  id: string
  email: string
  username: string
  role: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
        deletedAt: null,
      },
      select: { email: true, username: true },
    })

    if (existing) {
      const field = existing.email === dto.email ? 'email' : 'username'
      throw new ConflictException(`${field} already taken`)
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: { username: dto.username, email: dto.email, passwordHash },
      select: { id: true, username: true, email: true, role: true },
    })

    return this.issueTokens(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true, username: true, email: true, role: true, passwordHash: true },
    })

    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const safeUser: SafeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
    return this.issueTokens(safeUser)
  }

  /**
   * Refresh — validates incoming refresh token against stored hash,
   * invalidates it (rotation), then issues a new token pair.
   */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken)

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, username: true, email: true, role: true, deletedAt: true } } },
    })

    if (!stored || stored.expiresAt < new Date() || stored.user.deletedAt) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    // Invalidate used token — rotation prevents replay
    await this.prisma.refreshToken.delete({ where: { tokenHash } })

    const safeUser: SafeUser = {
      id: stored.user.id,
      username: stored.user.username,
      email: stored.user.email,
      role: stored.user.role,
    }
    return this.issueTokens(safeUser)
  }

  /** Revoke all refresh tokens for user on logout */
  async revokeAllTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }

  private async issueTokens(user: SafeUser) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    })

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })

    // Store hashed refresh token — never store plain tokens in DB
    const expiresIn7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: expiresIn7d,
      },
    })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    }
  }

  /** SHA-256 hex of the raw token — deterministic, no salt needed for lookup */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}
