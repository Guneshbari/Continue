import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { CurrentUser, type AuthUser } from './decorators/current-user.decorator'
import { FirebaseAuthGuard } from './guards/firebase-auth.guard'

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile and Firebase-linked account info' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing token.' })
  async getMe(@CurrentUser() user: AuthUser) {
    return user
  }
}
