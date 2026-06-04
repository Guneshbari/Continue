import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import type { GamesService } from './games.service'
import { ShelfDto } from './dto/games.dto'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('shelves')
@Controller({ path: 'shelves', version: '1' })
export class ShelvesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: ShelfDto })
  async getTrending(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('trending', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: ShelfDto })
  async getTopRated(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('top-rated', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('recent-releases')
  @ApiOperation({ summary: 'Get recently released games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: ShelfDto })
  async getRecentReleases(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('recent-releases', Math.min(Number(limit) || 12, 50))
  }
}
