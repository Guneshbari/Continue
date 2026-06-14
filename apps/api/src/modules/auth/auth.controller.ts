import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'
import { Public } from './decorators/public.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser, type AuthUser } from './decorators/current-user.decorator'
import type { FastifyRequest, FastifyReply } from 'fastify'

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.register(dto)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.header(
      'Set-Cookie',
      `refresh_token=${result.refreshToken}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${7 * 24 * 60 * 60}`,
    )
    return {
      accessToken: result.accessToken,
      user: result.user,
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email + password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.login(dto)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.header(
      'Set-Cookie',
      `refresh_token=${result.refreshToken}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${7 * 24 * 60 * 60}`,
    )
    return {
      accessToken: result.accessToken,
      user: result.user,
    }
  }

  /**
   * Expects the raw refresh token in request cookies or Authorization header.
   * Returns a new access token and user. Old token is invalidated (rotation).
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const cookieHeader = req.headers.cookie ?? ''
    const cookieToken = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('refresh_token='))
      ?.split('=')[1]

    const authHeader = req.headers.authorization
    const headerToken = authHeader?.replace(/^Bearer\s+/i, '')

    const rawToken = cookieToken || headerToken
    if (!rawToken) {
      res.status(HttpStatus.UNAUTHORIZED)
      return { statusCode: 401, error: 'Unauthorized', message: 'Missing refresh token' }
    }

    try {
      const result = await this.authService.refresh(rawToken)
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      res.header(
        'Set-Cookie',
        `refresh_token=${result.refreshToken}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${7 * 24 * 60 * 60}`,
      )
      return {
        accessToken: result.accessToken,
        user: result.user,
      }
    } catch {
      res.status(HttpStatus.UNAUTHORIZED)
      return { statusCode: 401, error: 'Unauthorized', message: 'Invalid refresh token' }
    }
  }

  /**
   * Revokes all refresh tokens for the current user and clears cookie.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revokes all refresh tokens for the user' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.authService.revokeAllTokens(user.id)
    res.header(
      'Set-Cookie',
      'refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    )
  }
}
