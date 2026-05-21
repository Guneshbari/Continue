import {
  Controller, Put, Delete, Get, Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import type { RatingsService } from './ratings.service'
import type { UpsertRatingDto } from './dto/rating.dto'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('ratings')
@ApiBearerAuth()
@Controller({ path: 'games/:gameId/ratings', version: '1' })
export class RatingsController {
  constructor(private readonly svc: RatingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all ratings for a game' })
  findByGame(@Param('gameId') gameId: string) {
    return this.svc.findByGame(gameId)
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my rating for a game' })
  myRating(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.svc.findUserRating(userId, gameId)
  }

  @Put()
  @ApiOperation({ summary: 'Create or update rating (1–10)' })
  upsert(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.svc.upsert(userId, gameId, dto)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my rating' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.svc.remove(userId, gameId)
  }
}
