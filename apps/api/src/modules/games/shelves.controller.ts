import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { FastifyReply } from 'fastify'
import { GamesService } from './games.service'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('shelves')
@Controller({ path: 'shelves', version: '1' })
export class ShelvesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get canonical trending games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  async trending(@Query('limit') limit = 12, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('trending', Number(limit) || 12)
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Get canonical top-rated games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  async topRated(@Query('limit') limit = 12, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('top-rated', Number(limit) || 12)
  }

  @Public()
  @Get('recent-releases')
  @ApiOperation({ summary: 'Get canonical recent releases games shelf' })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  async recentReleases(@Query('limit') limit = 12, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findShelf('recent-releases', Number(limit) || 12)
  }
}
