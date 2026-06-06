import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger'
import { DiscoveryService } from '../discovery/services/discovery.service'
import * as DiscoverMetadataDtos from '../discovery/dto/discover-metadata.dto'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('discover')
@Controller({ path: 'discover', version: '1' })
export class DiscoverController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get unified discovery dashboard (trending, new releases, top rated, upcoming)',
  })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  async getDashboard(@Query('limit') limit = 6, @Res({ passthrough: true }) res: FastifyReply) {
    res.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return this.discoveryService.findDiscoverDashboard(Math.min(Number(limit) || 6, 20))
  }

  @Public()
  @Get('metadata')
  @ApiOperation({ summary: 'Get active taxonomy lists and counts for filtering' })
  @ApiResponse({ type: DiscoverMetadataDtos.DiscoverMetadataResponseDto })
  async getMetadata(
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<DiscoverMetadataDtos.DiscoverMetadataResponseDto> {
    res.header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
    return this.discoveryService.findFilters()
  }
}
