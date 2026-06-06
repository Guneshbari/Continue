import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { DiscoveryService } from '../discovery/services/discovery.service'
import * as GameDtos from './dto/games.dto'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('shelves')
@Controller({ path: 'shelves', version: '1' })
export class ShelvesController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: GameDtos.ShelfDto })
  async getTrending(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<GameDtos.ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findShelf('trending', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: GameDtos.ShelfDto })
  async getTopRated(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<GameDtos.ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findShelf('top-rated', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('recent-releases')
  @ApiOperation({ summary: 'Get recently released games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: GameDtos.ShelfDto })
  async getRecentReleases(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<GameDtos.ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findShelf('recent-releases', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('newly-added')
  @ApiOperation({ summary: 'Get newly added games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: GameDtos.ShelfDto })
  async getNewlyAdded(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<GameDtos.ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findShelf('newly-added', Math.min(Number(limit) || 12, 50))
  }

  @Public()
  @Get('hidden-gems')
  @ApiOperation({ summary: 'Get hidden gems games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiResponse({ type: GameDtos.ShelfDto })
  async getHiddenGems(
    @Query('limit') limit = 12,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<GameDtos.ShelfDto> {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findShelf('hidden-gems', Math.min(Number(limit) || 12, 50))
  }
}
