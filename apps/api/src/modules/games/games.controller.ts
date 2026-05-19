import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { GamesService } from './games.service'
import { GamesQueryDto, CreateGameDto } from './dto/games.dto'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('games')
@Controller({ path: 'games', version: '1' })
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List games with filtering, sorting, cursor pagination' })
  findAll(@Query() query: GamesQueryDto) {
    return this.gamesService.findAll(query)
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get game by id or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.gamesService.findBySlug(idOrSlug)
  }

  // Admin-only in Phase 4 — open for now to allow seeding
  @Post()
  @ApiOperation({ summary: 'Create game (admin)' })
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto)
  }
}
