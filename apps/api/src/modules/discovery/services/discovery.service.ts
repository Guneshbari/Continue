import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { GameMapper } from '../../games/game.mapper'
import type { SearchProvider } from '../providers/search-provider.interface'
import { SEARCH_PROVIDER } from '../providers/search-provider.interface'
import { FacetAggregationService } from './facet-aggregation.service'
import type { ShelfRankingStrategy } from '../strategies/shelf-ranking.strategy'
import { TrendingStrategy } from '../strategies/trending.strategy'
import { TopRatedStrategy } from '../strategies/top-rated.strategy'
import { RecentReleasesStrategy } from '../strategies/recent-releases.strategy'
import { NewlyAddedStrategy } from '../strategies/newly-added.strategy'
import { HiddenGemsStrategy } from '../strategies/hidden-gems.strategy'
import type { DiscoveryQueryDto } from '../dto/discovery-query.dto'
import type { SearchQueryDto, SearchSuggestionsQueryDto } from '../dto/search-query.dto'
import { GAME_SUMMARY_SELECT } from '../discovery.constants'
import type { ShelfDto } from '../../games/dto/shelf.dto'
import type { PaginatedResponseDto } from '../../games/dto/pagination.dto'
import type { GameSummaryDto } from '../../games/dto/game-summary.dto'
import type { GamesQueryDto } from '../../games/dto/games.dto'

type DiscoveryListQuery = DiscoveryQueryDto | GamesQueryDto

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mapper: GameMapper,
    @Inject(SEARCH_PROVIDER) private readonly searchProvider: SearchProvider,
    private readonly facets: FacetAggregationService,
    private readonly trendingStrategy: TrendingStrategy,
    private readonly topRatedStrategy: TopRatedStrategy,
    private readonly recentReleasesStrategy: RecentReleasesStrategy,
    private readonly newlyAddedStrategy: NewlyAddedStrategy,
    private readonly hiddenGemsStrategy: HiddenGemsStrategy,
  ) {}

  async search(query: SearchQueryDto) {
    return this.searchProvider.search(query)
  }

  async suggestions(query: SearchSuggestionsQueryDto) {
    return this.searchProvider.suggest(query)
  }

  async findFilters() {
    return this.facets.getFacets()
  }

  async findAll(query: DiscoveryListQuery): Promise<PaginatedResponseDto<GameSummaryDto>> {
    const page = Math.max(query.page ?? 1, 1)
    const limit = Math.min(Math.max(query.limit ?? 24, 1), 100)
    const where = this.buildWhere(query)
    const orderBy = this.resolveOrderBy(query.sort)

    const [items, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: GAME_SUMMARY_SELECT,
      }),
      this.prisma.game.count({ where }),
    ])

    return {
      items: items.map((item) => this.mapper.toSummaryDto(item)),
      page,
      limit,
      total,
      hasNext: page * limit < total,
    }
  }

  async findShelf(kind: string, limit?: number): Promise<ShelfDto> {
    const defaultLimit = this.config.get<number>('DISCOVERY_SHELF_DEFAULT_LIMIT') ?? 12
    const cappedLimit = Math.min(Math.max(limit || defaultLimit, 1), 50)
    let strategy: ShelfRankingStrategy

    switch (kind) {
      case 'trending':
        strategy = this.trendingStrategy
        break
      case 'top-rated':
        strategy = this.topRatedStrategy
        break
      case 'recent-releases':
        strategy = this.recentReleasesStrategy
        break
      case 'newly-added':
        strategy = this.newlyAddedStrategy
        break
      case 'hidden-gems':
        strategy = this.hiddenGemsStrategy
        break
      default:
        throw new NotFoundException(`Unknown shelf kind: ${kind}`)
    }

    const items = await strategy.fetch(this.prisma, this.config, cappedLimit)
    const title = this.getShelfTitle(kind)
    return this.mapper.toShelfDto(kind, title, items)
  }

  async findDiscoverDashboard(limit = 6) {
    const [trending, newReleases, topRated, upcoming] = await Promise.all([
      this.findShelf('trending', limit),
      this.findShelf('recent-releases', limit),
      this.findShelf('top-rated', limit),
      this.findUpcoming(limit),
    ])

    return {
      trending: trending.items,
      newReleases: newReleases.items,
      topRated: topRated.items,
      upcoming,
    }
  }

  private async findUpcoming(limit: number) {
    const now = new Date()
    const items = await this.prisma.game.findMany({
      where: { deletedAt: null, releaseDate: { gt: now } },
      orderBy: [{ releaseDate: 'asc' }, { title: 'asc' }],
      take: Math.min(Math.max(limit, 1), 50),
      select: GAME_SUMMARY_SELECT,
    })

    return items.map((item) => this.mapper.toSummaryDto(item))
  }

  private buildWhere(query: DiscoveryListQuery): Prisma.GameWhereInput {
    const genre = query.genre
    const platform = query.platform
    const theme = 'theme' in query ? query.theme : undefined
    const search = 'q' in query ? query.q?.trim() : undefined
    const gamesQuery = query as GamesQueryDto
    const discoveryQuery = query as DiscoveryQueryDto
    const releaseYear = 'year' in query ? gamesQuery.year : discoveryQuery.releaseYear
    const ratingMin = 'minRating' in query ? gamesQuery.minRating : discoveryQuery.ratingMin
    const ratingMax = 'maxRating' in query ? gamesQuery.maxRating : discoveryQuery.ratingMax
    const minReviewCount = 'minReviewCount' in query ? query.minReviewCount : undefined
    const hasMinRating = ratingMin !== undefined && ratingMin !== null
    const hasMaxRating = ratingMax !== undefined && ratingMax !== null

    return {
      deletedAt: null,
      ...(genre && { genres: { some: { genre: { slug: genre } } } }),
      ...(platform && { platforms: { some: { platform: { slug: platform } } } }),
      ...(theme && { themes: { some: { theme: { slug: theme } } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search.replace(/\s+/g, '-'), mode: 'insensitive' as const } },
        ],
      }),
      ...(releaseYear && {
        releaseDate: {
          gte: new Date(releaseYear, 0, 1),
          lte: new Date(releaseYear, 11, 31, 23, 59, 59),
        },
      }),
      ...((hasMinRating || hasMaxRating) && {
        avgRating: {
          ...(hasMinRating && { gte: ratingMin }),
          ...(hasMaxRating && { lte: ratingMax }),
        },
      }),
      ...(minReviewCount !== undefined && { ratingCount: { gte: minReviewCount } }),
    }
  }

  private resolveOrderBy(sort?: string): Prisma.GameOrderByWithRelationInput[] {
    switch (sort) {
      case 'rating':
      case 'top-rated':
        return [{ avgRating: 'desc' }, { ratingCount: 'desc' }, { title: 'asc' }]
      case 'release_date':
      case 'recently-released':
        return [{ releaseDate: 'desc' }, { title: 'asc' }]
      case 'recently_added':
      case 'newest':
      case 'new':
        return [{ createdAt: 'desc' }, { title: 'asc' }]
      case 'upcoming':
        return [{ releaseDate: 'asc' }, { title: 'asc' }]
      case 'title':
        return [{ title: 'asc' }]
      case 'most-reviewed':
        return [{ ratingCount: 'desc' }, { title: 'asc' }]
      case 'trending':
      case 'popular':
      default:
        return [{ ratingCount: 'desc' }, { avgRating: 'desc' }, { title: 'asc' }]
    }
  }

  private getShelfTitle(kind: string): string {
    switch (kind) {
      case 'trending':
        return 'Trending'
      case 'top-rated':
        return 'Top Rated'
      case 'recent-releases':
        return 'Recent Releases'
      case 'newly-added':
        return 'Newly Added'
      case 'hidden-gems':
        return 'Hidden Gems'
      default:
        return kind
    }
  }
}
