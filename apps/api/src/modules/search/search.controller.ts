import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { SearchService } from './search.service'

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search games by title, developer, or slug' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default 20)' })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.search.search(q, limit ? parseInt(limit, 10) : 20)
    return { data: results }
  }
}
