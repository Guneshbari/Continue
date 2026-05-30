import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import type { ReviewsService } from './reviews.service'
import { Public } from '../auth/decorators/public.decorator'

/**
 * Standalone featured reviews controller — mounted at /reviews.
 * Separate from the nested /games/:gameId/reviews controller.
 * Used by the homepage discovery system.
 */
@ApiTags('reviews')
@Controller({ path: 'reviews', version: '1' })
export class FeaturedReviewsController {
  constructor(private readonly svc: ReviewsService) {}

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured reviews for homepage discovery' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  findFeatured(
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ) {
    return this.svc.findFeatured(Math.min(limit, 10))
  }
}
