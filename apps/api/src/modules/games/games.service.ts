import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import {
  CreateGameDto,
  GamesQueryDto,
  PaginatedResponseDto,
  GameSummaryDto,
  ShelfDto,
} from './dto/games.dto'
import { GameMapper } from './game.mapper'

const MEDIA_ASSET_SELECT = {
  variants: {
    select: {
      role: true,
      url: true,
      width: true,
      height: true,
      blurPlaceholder: true,
    },
  },
} as const

const TAXONOMY_SELECT = {
  id: true,
  slug: true,
  name: true,
} as const

const GAME_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  cover: { select: MEDIA_ASSET_SELECT },
  releaseDate: true,
  avgRating: true,
  ratingCount: true,
} as const

const GAME_DETAIL_SELECT = {
  ...GAME_SUMMARY_SELECT,
  description: true,
  backdrop: { select: MEDIA_ASSET_SELECT },
  developers: { select: { developer: { select: TAXONOMY_SELECT } } },
  publishers: { select: { publisher: { select: TAXONOMY_SELECT } } },
  genres: { select: { genre: { select: TAXONOMY_SELECT } } },
  platforms: { select: { platform: { select: TAXONOMY_SELECT } } },
  tags: { select: { tag: { select: TAXONOMY_SELECT } } },
  themes: { select: { theme: { select: TAXONOMY_SELECT } } },
  franchise: { select: TAXONOMY_SELECT },
  screenshots: {
    orderBy: { position: 'asc' as const },
    select: { asset: { select: MEDIA_ASSET_SELECT } },
  },
  summary: true,
  status: true,
} as const

type ShelfKind = 'trending' | 'top-rated' | 'recent-releases'

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: GameMapper,
  ) {}

  async findAll(query: GamesQueryDto): Promise<PaginatedResponseDto<GameSummaryDto>> {
    const page = Math.max(query.page ?? 1, 1)
    const limit = Math.min(Math.max(query.limit ?? 24, 1), 50)
    const where = await this.buildWhere(query)
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

  async findBySlug(idOrSlug: string) {
    const game = await this.prisma.game.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: GAME_DETAIL_SELECT,
    })

    if (!game) throw new NotFoundException('Game not found')
    return this.mapper.toDetailDto(game)
  }

  async findDiscovery(section: 'trending' | 'new-releases' | 'top-rated', limit: number) {
    const shelfKind = section === 'new-releases' ? 'recent-releases' : section
    const shelf = await this.findShelf(shelfKind, limit)
    return shelf.items
  }

  async findShelf(kind: ShelfKind, limit = 12): Promise<ShelfDto> {
    const cappedLimit = Math.min(Math.max(limit, 1), 50)
    const items = await this.prisma.game.findMany({
      where: this.resolveShelfWhere(kind),
      orderBy: this.resolveShelfOrderBy(kind),
      take: cappedLimit,
      select: GAME_SUMMARY_SELECT,
    })

    return this.mapper.toShelfDto(kind, this.shelfTitle(kind), items)
  }

  async findFilters() {
    const [genres, platforms, gamesWithDates] = await Promise.all([
      this.prisma.genre.findMany({
        select: TAXONOMY_SELECT,
        orderBy: { name: 'asc' },
      }),
      this.prisma.platform.findMany({
        select: TAXONOMY_SELECT,
        orderBy: { name: 'asc' },
      }),
      this.prisma.game.findMany({
        where: { deletedAt: null, releaseDate: { not: null } },
        select: { releaseDate: true },
      }),
    ])

    const years = Array.from(
      new Set(
        gamesWithDates.flatMap((game) =>
          game.releaseDate ? [game.releaseDate.getFullYear()] : [],
        ),
      ),
    ).sort((a, b) => b - a)

    return {
      genres,
      platforms,
      years,
      ratings: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    }
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

  async create(dto: CreateGameDto) {
    const game = await this.prisma.game.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.releaseDate && { releaseDate: new Date(dto.releaseDate) }),
      },
      select: GAME_DETAIL_SELECT,
    })
    return this.mapper.toDetailDto(game)
  }

  private async buildWhere(query: GamesQueryDto): Promise<Prisma.GameWhereInput> {
    const { q, genre, platform, year, minRating, maxRating, minReviewCount } = query

    const gameIdsWithMinReviews = await this.gameIdsWithMinReviews(minReviewCount)
    const hasMinRating = minRating !== undefined && minRating !== null
    const hasMaxRating = maxRating !== undefined && maxRating !== null

    return {
      deletedAt: null,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(genre && { genres: { some: { genre: { slug: genre } } } }),
      ...(platform && { platforms: { some: { platform: { slug: platform } } } }),
      ...(year && {
        releaseDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59),
        },
      }),
      ...((hasMinRating || hasMaxRating) && {
        avgRating: {
          ...(hasMinRating && { gte: minRating }),
          ...(hasMaxRating && { lte: maxRating }),
        },
      }),
      ...(gameIdsWithMinReviews && { id: { in: gameIdsWithMinReviews } }),
    }
  }

  private async gameIdsWithMinReviews(minReviewCount?: number): Promise<string[] | undefined> {
    if (!minReviewCount || minReviewCount <= 0) return undefined

    const groups = await this.prisma.review.groupBy({
      by: ['gameId'],
      where: { deletedAt: null, status: 'PUBLISHED' },
      _count: { _all: true },
      having: {
        gameId: {
          _count: {
            gte: minReviewCount,
          },
        },
      },
    })

    return groups.map((group) => group.gameId)
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

  private resolveShelfWhere(kind: ShelfKind): Prisma.GameWhereInput {
    const now = new Date()
    if (kind === 'top-rated') {
      return { deletedAt: null, avgRating: { not: null }, ratingCount: { gte: 1 } }
    }
    if (kind === 'recent-releases') {
      return { deletedAt: null, releaseDate: { lte: now } }
    }
    return { deletedAt: null }
  }

  private resolveShelfOrderBy(kind: ShelfKind): Prisma.GameOrderByWithRelationInput[] {
    if (kind === 'top-rated') {
      return [{ avgRating: 'desc' }, { ratingCount: 'desc' }, { title: 'asc' }]
    }
    if (kind === 'recent-releases') {
      return [{ releaseDate: 'desc' }, { title: 'asc' }]
    }
    return [{ ratingCount: 'desc' }, { avgRating: 'desc' }, { title: 'asc' }]
  }

  private resolveOrderBy(sort?: string): Prisma.GameOrderByWithRelationInput[] {
    switch (sort) {
      case 'rating':
      case 'top-rated':
        return [{ avgRating: 'desc' }, { ratingCount: 'desc' }, { title: 'asc' }]
      case 'release_date':
      case 'newest':
      case 'recently-released':
      case 'new':
        return [{ releaseDate: 'desc' }, { title: 'asc' }]
      case 'recently_added':
        return [{ createdAt: 'desc' }, { title: 'asc' }]
      case 'most-reviewed':
        return [{ reviews: { _count: 'desc' } }, { title: 'asc' }]
      case 'upcoming':
        return [{ releaseDate: 'asc' }, { title: 'asc' }]
      case 'popular':
      case 'trending':
      default:
        return [{ ratingCount: 'desc' }, { avgRating: 'desc' }, { title: 'asc' }]
    }
  }

  private shelfTitle(kind: ShelfKind): string {
    switch (kind) {
      case 'top-rated':
        return 'Top Rated'
      case 'recent-releases':
        return 'Recent Releases'
      case 'trending':
        return 'Trending'
    }
  }
}
