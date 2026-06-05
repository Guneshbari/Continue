import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { GameMapper } from '../../games/game.mapper'
import { SearchProvider } from './search-provider.interface'
import { SearchQueryDto, SearchSuggestionsQueryDto } from '../dto/search-query.dto'
import { SearchResultDto, SearchSuggestionDto } from '../dto/search-response.dto'
import { getVariantUrl } from '../../../common/utils/media'

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

const GAME_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  cover: { select: MEDIA_ASSET_SELECT },
  releaseDate: true,
  avgRating: true,
  ratingCount: true,
  genres: { select: { genre: { select: { id: true, slug: true, name: true } } } },
  platforms: { select: { platform: { select: { id: true, slug: true, name: true } } } },
} as const

@Injectable()
export class PrismaSearchProvider implements SearchProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: GameMapper,
  ) {}

  async search(query: SearchQueryDto): Promise<{ items: SearchResultDto[]; total: number }> {
    // Query Normalization Layer: trim, lowercase, remove consecutive hyphens/spaces
    const rawTerm = query.q || ''
    const normalizedTerm = rawTerm.trim().toLowerCase().replace(/[\s-]+/g, ' ')
    if (normalizedTerm.length < 2) {
      return { items: [], total: 0 }
    }

    const page = Math.max(query.page ?? 1, 1)
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)

    // We fetch a candidate pool of matches to rank exact/prefix matches first in memory
    const candidates = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: normalizedTerm, mode: 'insensitive' } },
          { slug: { contains: normalizedTerm, mode: 'insensitive' } },
        ],
      },
      select: GAME_SUMMARY_SELECT,
    })

    const total = candidates.length

    // Ranking Foundation: exact matches -> prefix matches -> popularity desc
    const sorted = candidates.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()

      const aExact = aTitle === normalizedTerm
      const bExact = bTitle === normalizedTerm
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      const aStarts = aTitle.startsWith(normalizedTerm)
      const bStarts = bTitle.startsWith(normalizedTerm)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      const aCount = a.ratingCount || 0
      const bCount = b.ratingCount || 0
      if (aCount !== bCount) {
        return bCount - aCount
      }

      return (b.avgRating || 0) - (a.avgRating || 0)
    })

    const paginated = sorted.slice((page - 1) * limit, page * limit)

    const items = paginated.map((game) => {
      const summary = this.mapper.toSummaryDto(game)
      const result: SearchResultDto = {
        ...summary,
        type: 'game' as const,
        highlights: [],
      }

      // Search Result Highlight Support
      const titleLower = game.title.toLowerCase()
      const matchIndex = titleLower.indexOf(normalizedTerm)
      if (matchIndex !== -1) {
        const originalMatch = game.title.substring(matchIndex, matchIndex + normalizedTerm.length)
        const snippet = game.title.replace(new RegExp(normalizedTerm, 'ig'), `<em>${originalMatch}</em>`)
        result.highlights = [{ field: 'title', snippet }]
      }

      return result
    })

    return { items, total }
  }

  async suggest(query: SearchSuggestionsQueryDto): Promise<SearchSuggestionDto[]> {
    const rawTerm = query.q || ''
    const normalizedTerm = rawTerm.trim().toLowerCase().replace(/[\s-]+/g, ' ')
    if (normalizedTerm.length < 2) {
      return []
    }

    const limit = Math.min(Math.max(query.limit ?? 5, 1), 20)

    const candidates = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: normalizedTerm, mode: 'insensitive' } },
          { slug: { contains: normalizedTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        cover: { select: MEDIA_ASSET_SELECT },
        ratingCount: true,
      },
    })

    const sorted = candidates.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()

      const aExact = aTitle === normalizedTerm
      const bExact = bTitle === normalizedTerm
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      const aStarts = aTitle.startsWith(normalizedTerm)
      const bStarts = bTitle.startsWith(normalizedTerm)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      return (b.ratingCount || 0) - (a.ratingCount || 0)
    })

    return sorted.slice(0, limit).map((game) => ({
      id: game.id,
      slug: game.slug,
      title: game.title,
      coverUrl: getVariantUrl(game.cover, 'COVER_MD') || null,
    }))
  }
}
