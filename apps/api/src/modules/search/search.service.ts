import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

export interface SearchResult {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  avgRating: number | null
  ratingCount: number
  releaseDate: string | null
  genres: { id: string; slug: string; name: string }[]
  type: 'game'
}

interface SearchGameRow {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  avgRating: number | null
  ratingCount: number
  releaseDate: Date | null
  genres: { genre: { id: string; slug: string; name: string } }[]
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, limit = 20): Promise<SearchResult[]> {
    if (!q || q.trim().length < 2) return []

    const term = q.trim()

    // Use Postgres ILIKE on title + developer — fallback before pg_trgm extension enabled
    const games = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { developer: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [
        // Exact prefix matches float to top naturally with this ordering
        { ratingCount: 'desc' },
        { avgRating: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        coverUrl: true,
        avgRating: true,
        ratingCount: true,
        releaseDate: true,
        genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
      },
    })

    return (games as SearchGameRow[]).map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      coverUrl: g.coverUrl,
      avgRating: g.avgRating,
      ratingCount: g.ratingCount,
      releaseDate: g.releaseDate?.toISOString() ?? null,
      genres: g.genres.map((gg) => gg.genre),
      type: 'game' as const,
    }))
  }

  async suggestions(q: string, limit = 5): Promise<SearchResult[]> {
    if (!q || q.trim().length < 2) return []

    const term = q.trim()

    const games = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { developer: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit * 2,
      orderBy: [
        { ratingCount: 'desc' },
        { avgRating: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        coverUrl: true,
        avgRating: true,
        ratingCount: true,
        releaseDate: true,
        genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
      },
    })

    const sorted = (games as SearchGameRow[]).sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const termLower = term.toLowerCase()

      const aStarts = aTitle.startsWith(termLower)
      const bStarts = bTitle.startsWith(termLower)

      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return 0
    })

    return sorted.slice(0, limit).map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      coverUrl: g.coverUrl,
      avgRating: g.avgRating,
      ratingCount: g.ratingCount,
      releaseDate: g.releaseDate?.toISOString() ?? null,
      genres: g.genres.map((gg) => gg.genre),
      type: 'game' as const,
    }))
  }
}
