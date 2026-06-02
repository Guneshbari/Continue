import { Controller, Get, Post, Param, Body, Query, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { GamesService } from './games.service'
import type { GamesQueryDto, CreateGameDto } from './dto/games.dto'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('games')
@Controller({ path: 'games', version: '1' })
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // ─── Discovery endpoints — SSR-optimised, cached ──────────────────────────

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Top games by popularity (homepage discovery)' })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  async trending(@Query('limit') limit = 6, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findDiscovery('trending', Math.min(Number(limit) || 6, 20))
  }

  @Public()
  @Get('new-releases')
  @ApiOperation({ summary: 'Recently released games (homepage discovery)' })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  async newReleases(@Query('limit') limit = 6, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findDiscovery('new-releases', Math.min(Number(limit) || 6, 20))
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Top-rated games (homepage discovery)' })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  async topRated(@Query('limit') limit = 6, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.gamesService.findDiscovery('top-rated', Math.min(Number(limit) || 6, 20))
  }

  @Public()
  @Get('filter')
  @ApiOperation({ summary: 'Get active taxonomy lists (genres, platforms, years) for filtering' })
  async filters(@Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
    return this.gamesService.findFilters()
  }

  // ─── Generic list + detail ─────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List games with filtering, sorting, and page pagination' })
  findAll(@Query() query: GamesQueryDto) {
    return this.gamesService.findAll(query)
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get canonical game detail by slug or id' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.gamesService.findBySlug(idOrSlug)
  }

  // Admin-only in Phase 4
  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create game (admin)' })
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto)
  }
}
