import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Public } from './decorators/public.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser, type AuthUser } from './decorators/current-user.decorator'

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  /**
   * Expects the raw refresh token in Authorization header as Bearer.
   * Returns a new token pair. Old token is invalidated (rotation).
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  refresh(@Headers('authorization') authHeader: string) {
    const rawToken = authHeader?.replace(/^Bearer\s+/i, '')
    if (!rawToken) {
      throw new Error('Missing refresh token')
    }
    return this.authService.refresh(rawToken)
  }

  /**
   * Revokes all refresh tokens for the current user.
   * Client must discard access token locally (it remains valid until expiry).
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revokes all refresh tokens for the user' })
  async logout(@CurrentUser() user: AuthUser) {
    await this.authService.revokeAllTokens(user.id)
  }
}
