import { Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateGameDto, GamesQueryDto } from './dto/games.dto'
import { mapMediaAsset, getVariantUrl } from '../../common/utils/media'

// ─── Shared Prisma select shapes ──────────────────────────────────────────────

const GAME_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  cover: {
    select: {
      rawUrl: true,
      optimized: true,
      variants: {
        select: {
          role: true,
          url: true,
          width: true,
          height: true,
          format: true,
          blurPlaceholder: true,
        },
      },
    },
  },
  releaseDate: true,
  avgRating: true,
  ratingCount: true,
  genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
  platforms: { select: { platform: { select: { id: true, slug: true, name: true } } } },
} as const

const GAME_DETAIL_SELECT = {
  ...GAME_SUMMARY_SELECT,
  description: true,
  backdrop: {
    select: {
      rawUrl: true,
      optimized: true,
      variants: {
        select: {
          role: true,
          url: true,
          width: true,
          height: true,
          format: true,
          blurPlaceholder: true,
        },
      },
    },
  },
  developers: { select: { developer: { select: { id: true, slug: true, name: true } } } },
  publishers: { select: { publisher: { select: { id: true, slug: true, name: true } } } },
  tags: { select: { tag: { select: { id: true, slug: true, name: true } } } },
  screenshots: {
    orderBy: { position: 'asc' as const },
    select: {
      asset: {
        select: {
          rawUrl: true,
          optimized: true,
          variants: {
            select: {
              role: true,
              url: true,
              width: true,
              height: true,
              format: true,
              blurPlaceholder: true,
            },
          },
        },
      },
    },
  },
  trailers: {
    select: {
      id: true,
      youtubeId: true,
      name: true,
    },
  },
  themes: { select: { theme: { select: { id: true, slug: true, name: true } } } },
  franchise: { select: { id: true, slug: true, name: true } },
  summary: true,
  storyline: true,
  igdbRating: true,
  igdbRatingCount: true,
  status: true,
} as const

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Discovery ───────────────────────────────────────────────────────────────

  /**
   * Curated discovery queries — used by dedicated homepage endpoints.
   * Returns a flat array (no cursor pagination) for SSR speed.
   */
  async findDiscovery(
    section: 'trending' | 'new-releases' | 'top-rated',
    limit: number,
  ) {
    const now = new Date()

    const where =
      section === 'new-releases'
        ? { deletedAt: null, releaseDate: { lte: now } }
        : section === 'top-rated'
          ? { deletedAt: null, avgRating: { not: null }, ratingCount: { gte: 1 } }
          : { deletedAt: null } // trending — all games

    const orderBy =
      section === 'new-releases'
        ? { releaseDate: 'desc' as const }
        : section === 'top-rated'
          ? { avgRating: 'desc' as const }
          : { ratingCount: 'desc' as const } // trending

    const items = await this.prisma.game.findMany({
      where,
      orderBy,
      take: limit,
      select: GAME_SUMMARY_SELECT,
    })

    return items.map(this.mapGameSummary)
  }

  // ─── Generic list (cursor-paginated) ─────────────────────────────────────────

  async findAll(query: GamesQueryDto) {
    const {
      q,
      genre,
      platform,
      sort,
      cursor,
      limit,
      year,
      minRating,
      maxRating,
      minReviewCount,
    } = query

    const now = new Date()
    const isRecentlyReleased = sort === 'recently-released'

    // ─── 1. Review Count Aggregation Filter ──────────────────────────────────
    let gameIdsWithMinReviews: string[] | undefined = undefined
    if (minReviewCount !== undefined && minReviewCount !== null && minReviewCount > 0) {
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
      gameIdsWithMinReviews = groups.map((g) => g.gameId)
    }

    // ─── 2. Rating Range Filter ──────────────────────────────────────────────
    const hasMinRating = minRating !== undefined && minRating !== null
    const hasMaxRating = maxRating !== undefined && maxRating !== null
    const ratingFilter =
      hasMinRating || hasMaxRating
        ? {
            avgRating: {
              ...(hasMinRating && { gte: minRating }),
              ...(hasMaxRating && { lte: maxRating }),
            },
          }
        : {}

    const where = {
      deletedAt: null,
      ...(isRecentlyReleased && {
        releaseDate: {
          lte: now,
        },
      }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { slug: { contains: q, mode: 'insensitive' as const } },
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
      ...ratingFilter,
      ...(gameIdsWithMinReviews !== undefined && {
        id: { in: gameIdsWithMinReviews },
      }),
    }

    const orderBy = this.resolveOrderBy(sort)

    const items = await this.prisma.game.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      select: GAME_SUMMARY_SELECT,
    })

    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null

    return {
      data: data.map(this.mapGameSummary),
      meta: { nextCursor, total: undefined },
    }
  }

  // ─── Discovery metadata / filters ───────────────────────────────────────────

  async findFilters() {
    const genres = await this.prisma.genre.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' },
    })

    const platforms = await this.prisma.platform.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' },
    })

    const gamesWithDates = await this.prisma.game.findMany({
      where: { deletedAt: null, releaseDate: { not: null } },
      select: { releaseDate: true },
    })

    const yearsSet = new Set<number>()
    for (const g of gamesWithDates) {
      if (g.releaseDate) {
        yearsSet.add(g.releaseDate.getFullYear())
      }
    }
    const years = Array.from(yearsSet).sort((a, b) => b - a)

    return {
      genres,
      platforms,
      years,
      ratings: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    }
  }

  async findDiscoverDashboard(limit = 6) {
    const [trending, newReleases, topRated] = await Promise.all([
      this.findDiscovery('trending', limit),
      this.findDiscovery('new-releases', limit),
      this.findDiscovery('top-rated', limit),
    ])

    const now = new Date()
    const upcomingItems = await this.prisma.game.findMany({
      where: { deletedAt: null, releaseDate: { gt: now } },
      orderBy: { releaseDate: 'asc' },
      take: limit,
      select: GAME_SUMMARY_SELECT,
    })
    const upcoming = upcomingItems.map(this.mapGameSummary)

    return {
      trending,
      newReleases,
      topRated,
      upcoming,
    }
  }

  // ─── Single game ─────────────────────────────────────────────────────────────

  async findBySlug(idOrSlug: string) {
    const game = await this.prisma.game.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: GAME_DETAIL_SELECT,
    })
    if (!game) throw new NotFoundException('Game not found')
    return this.mapGameDetail(game)
  }

  async create(dto: CreateGameDto) {
    const game = await this.prisma.game.create({ data: { ...dto }, select: GAME_DETAIL_SELECT })
    return this.mapGameDetail(game)
  }

  // ─── Private mappers ─────────────────────────────────────────────────────────

  private mapGameSummary = (game: any) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    cover: mapMediaAsset(game.cover),
    coverUrl: getVariantUrl(game.cover, 'COVER_MD'),
    releaseDate: game.releaseDate?.toISOString() ?? null,
    avgRating: game.avgRating,
    ratingCount: game.ratingCount,
    genres: game.genres?.map((g: any) => g.genre).filter(Boolean) ?? [],
    platforms: game.platforms?.map((p: any) => p.platform).filter(Boolean) ?? [],
  })

  private mapGameDetail = (game: any) => ({
    ...this.mapGameSummary(game),
    description: game.description,
    backdrop: mapMediaAsset(game.backdrop),
    bannerUrl: getVariantUrl(game.backdrop, 'BACKDROP_HERO'),
    developer: game.developers?.[0]?.developer?.name ?? null,
    publisher: game.publishers?.[0]?.publisher?.name ?? null,
    developers: game.developers?.map((d: any) => d.developer).filter(Boolean) ?? [],
    publishers: game.publishers?.map((p: any) => p.publisher).filter(Boolean) ?? [],
    tags: game.tags?.map((t: any) => t.tag).filter(Boolean) ?? [],
    screenshots: (game.screenshots ?? []).map((s: any) => {
      const mapped = mapMediaAsset(s.asset)
      if (mapped) {
        mapped.heroScore = s.heroScore
        mapped.isPrimaryHeroCandidate = s.isPrimaryHeroCandidate
      }
      return mapped
    }).filter(Boolean),
    trailers: game.trailers ?? [],
    themes: game.themes?.map((t: any) => t.theme).filter(Boolean) ?? [],
    franchise: game.franchise ?? null,
    summary: game.summary,
    storyline: game.storyline,
    igdbRating: game.igdbRating,
    igdbRatingCount: game.igdbRatingCount,
    status: game.status,
  })

  private resolveOrderBy(sort?: string) {
    switch (sort) {
      case 'trending':
        return { ratingCount: 'desc' as const }
      case 'top-rated':
        return { avgRating: 'desc' as const }
      case 'most-reviewed':
        return { reviews: { _count: 'desc' as const } }
      case 'newest':
      case 'recently-released':
      case 'new':
        return { releaseDate: 'desc' as const }
      case 'upcoming':
        return { releaseDate: 'asc' as const }
      default:
        return { ratingCount: 'desc' as const }
    }
  }
}
