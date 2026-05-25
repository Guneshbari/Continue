import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { SearchService } from './search.service'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search games by title, developer, or slug' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default 20)' })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.searchService.search(q, limit ? parseInt(limit, 10) : 20)
    return { data: results }
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions for auto-complete' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max suggestions (default 5)' })
  async suggestions(
    @Query('q') q: string,
    @Query('limit') limit = '5',
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    res.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')
    const results = await this.searchService.suggestions(q, Number(limit) || 5)
    return { data: results }
  }
}
