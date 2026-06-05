import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger'
import { DiscoveryService } from '../discovery/services/discovery.service'
import { SearchQueryDto, SearchSuggestionsQueryDto } from '../discovery/dto/search-query.dto'
import { SearchResultDto, SearchSuggestionDto } from '../discovery/dto/search-response.dto'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search games by title, slug, or developer' })
  @ApiResponse({ type: [SearchResultDto] })
  async search(@Query() query: SearchQueryDto) {
    const results = await this.discoveryService.search(query)
    // Maintain old contract where search returns `{ data: items }`
    return { data: results.items, total: results.total }
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions for auto-complete' })
  @ApiResponse({ type: [SearchSuggestionDto] })
  async suggestions(
    @Query() query: SearchSuggestionsQueryDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    res.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')
    const results = await this.discoveryService.suggestions(query)
    return { data: results }
  }
}
