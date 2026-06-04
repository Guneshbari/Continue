import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { GamesService } from './games.service'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('discover')
@Controller({ path: 'discover', version: '1' })
export class DiscoverController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get unified discovery dashboard (trending, new releases, top rated, upcoming)' })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  async getDashboard(
    @Query('limit') limit = 6,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findDiscoverDashboard(Math.min(Number(limit) || 6, 20))
  }
}
