import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { SearchService } from './search.service'
import { Public } from '../auth/decorators/public.decorator'

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
}
