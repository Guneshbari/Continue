import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, ParseIntPipe, DefaultValuePipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import type { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('reviews')
@ApiBearerAuth()
@Controller({ path: 'games/:gameId/reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly svc: ReviewsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get reviews for a game' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  findByGame(
    @Param('gameId') gameId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.findByGame(gameId, limit, cursor)
  }

  @Post()
  @ApiOperation({ summary: 'Write a review' })
  create(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.svc.create(userId, gameId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my review' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.svc.update(id, userId, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my review' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.svc.remove(id, userId)
  }
}
