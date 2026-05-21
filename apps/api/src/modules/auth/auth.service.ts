import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import type { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import type { PrismaService } from '../../common/prisma/prisma.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check uniqueness
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

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
    return this.issueTokens(safeUser)
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, username: true, email: true, role: true },
    })
    if (!user) throw new UnauthorizedException()
    return this.issueTokens(user)
  }

  private issueTokens(user: { id: string; email: string; username: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    })

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    }
  }
}
