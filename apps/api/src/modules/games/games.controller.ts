import { Controller, Get, Post, Param, Body, Query, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { GamesService } from './games.service'
import { DiscoveryService } from '../discovery/services/discovery.service'
import type { GameSummaryDto } from './dto/games.dto'
import * as GameDtos from './dto/games.dto'
import { CreateGameDto } from './dto/games.dto'
import { GameDetailDto, PaginatedResponseDto } from './dto/games.dto'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('games')
@Controller({ path: 'games', version: '1' })
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Public()
  @Get('filter')
  @ApiOperation({ summary: 'Get active taxonomy lists (genres, platforms, years) for filtering' })
  async filters(@Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
    return this.discoveryService.findFilters()
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List games with filtering, sorting, and page pagination' })
  @ApiResponse({ type: PaginatedResponseDto })
  async findAll(
    @Query() query: GameDtos.GamesQueryDto,
  ): Promise<PaginatedResponseDto<GameSummaryDto>> {
    return this.discoveryService.findAll(query)
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get canonical game detail by slug' })
  @ApiResponse({ type: GameDetailDto })
  async findOne(@Param('slug') slug: string): Promise<GameDetailDto> {
    return this.gamesService.findBySlug(slug)
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create game (admin)' })
  @ApiResponse({ type: GameDetailDto })
  async create(@Body() dto: CreateGameDto): Promise<GameDetailDto> {
    return this.gamesService.create(dto)
  }
}
