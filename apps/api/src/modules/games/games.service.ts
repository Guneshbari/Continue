import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateGameDto, GamesQueryDto } from './dto/games.dto'

// ─── Shared Prisma select shapes ──────────────────────────────────────────────

const GAME_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  coverUrl: true,
  releaseDate: true,
  avgRating: true,
  ratingCount: true,
  genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
  platforms: { select: { platform: { select: { id: true, slug: true, name: true } } } },
} as const

const GAME_DETAIL_SELECT = {
  ...GAME_SUMMARY_SELECT,
  description: true,
  bannerUrl: true,
  developer: true,
  publisher: true,
  tags: { select: { tag: { select: { id: true, slug: true, name: true } } } },
} as const

// ─── Internal row types (Prisma output shapes) ────────────────────────────────

interface TaxonomyRow {
  genre?: { id: string; slug: string; name: string }
  platform?: { id: string; slug: string; name: string }
  tag?: { id: string; slug: string; name: string }
}

interface GameSummaryRow {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  releaseDate: Date | null
  avgRating: number | null
  ratingCount: number
  genres: TaxonomyRow[]
  platforms: TaxonomyRow[]
}

interface GameDetailRow extends GameSummaryRow {
  description: string | null
  bannerUrl: string | null
  developer: string | null
  publisher: string | null
  tags: TaxonomyRow[]
}

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

    return (items as GameSummaryRow[]).map(this.mapGameSummary)
  }

  // ─── Generic list (cursor-paginated) ─────────────────────────────────────────

  async findAll(query: GamesQueryDto) {
    const { q, genre, platform, sort, cursor, limit, year, minRating } = query

    const where = {
      deletedAt: null,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { developer: { contains: q, mode: 'insensitive' as const } },
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
      ...(minRating && {
        avgRating: {
          gte: minRating,
        },
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
      data: (data as GameSummaryRow[]).map(this.mapGameSummary),
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
    const upcoming = (upcomingItems as GameSummaryRow[]).map(this.mapGameSummary)

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
    return this.mapGameDetail(game as GameDetailRow)
  }

  async create(dto: CreateGameDto) {
    const game = await this.prisma.game.create({ data: { ...dto }, select: GAME_DETAIL_SELECT })
    return this.mapGameDetail(game as GameDetailRow)
  }

  // ─── Private mappers ─────────────────────────────────────────────────────────

  private mapGameSummary = (game: GameSummaryRow) => ({
    ...game,
    genres: game.genres?.map((g) => g.genre).filter(Boolean) ?? [],
    platforms: game.platforms?.map((p) => p.platform).filter(Boolean) ?? [],
    releaseDate: game.releaseDate?.toISOString() ?? null,
  })

  private mapGameDetail = (game: GameDetailRow) => ({
    ...this.mapGameSummary(game),
    tags: game.tags?.map((t) => t.tag).filter(Boolean) ?? [],
  })

  private resolveOrderBy(sort?: string) {
    switch (sort) {
      case 'top-rated': return { avgRating: 'desc' as const }
      case 'new':       return { releaseDate: 'desc' as const }
      case 'upcoming':  return { releaseDate: 'asc' as const }
      default:          return { ratingCount: 'desc' as const }
    }
  }
}
