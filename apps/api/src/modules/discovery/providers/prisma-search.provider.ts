import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { GameMapper } from '../../games/game.mapper'
import { SearchProvider } from './search-provider.interface'
import { SearchQueryDto, SearchSuggestionsQueryDto } from '../dto/search-query.dto'
import { SearchResultDto, SearchSuggestionDto } from '../dto/search-response.dto'
import { getVariantUrl } from '../../../common/utils/media'
import { GAME_SUMMARY_SELECT, MEDIA_ASSET_SELECT } from '../discovery.constants'
import type { Prisma } from '@prisma/client'

const SEARCH_CANDIDATE_LIMIT = 500

@Injectable()
export class PrismaSearchProvider implements SearchProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: GameMapper,
  ) {}

  async search(query: SearchQueryDto): Promise<{ items: SearchResultDto[]; total: number }> {
    // Query Normalization Layer: trim, lowercase, remove consecutive hyphens/spaces
    const rawTerm = query.q || ''
    const normalizedTerm = rawTerm
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, ' ')
    if (normalizedTerm.length < 2) {
      return { items: [], total: 0 }
    }

    const page = Math.max(query.page ?? 1, 1)
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)
    const where = this.buildSearchWhere(normalizedTerm)
    const take = Math.min(Math.max(page * limit * 3, limit), SEARCH_CANDIDATE_LIMIT)

    const [candidates, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy: [{ ratingCount: 'desc' }, { avgRating: 'desc' }, { title: 'asc' }],
        take,
        select: GAME_SUMMARY_SELECT,
      }),
      this.prisma.game.count({ where }),
    ])

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
        const endIndex = matchIndex + normalizedTerm.length
        const snippet = `${game.title.slice(0, matchIndex)}<em>${game.title.slice(matchIndex, endIndex)}</em>${game.title.slice(endIndex)}`
        result.highlights = [{ field: 'title', snippet }]
      }

      return result
    })

    return { items, total }
  }

  async suggest(query: SearchSuggestionsQueryDto): Promise<SearchSuggestionDto[]> {
    const rawTerm = query.q || ''
    const normalizedTerm = rawTerm
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, ' ')
    if (normalizedTerm.length < 2) {
      return []
    }

    const limit = Math.min(Math.max(query.limit ?? 5, 1), 20)
    const where = this.buildSearchWhere(normalizedTerm)

    const candidates = await this.prisma.game.findMany({
      where,
      orderBy: [{ ratingCount: 'desc' }, { title: 'asc' }],
      take: Math.min(limit * 4, SEARCH_CANDIDATE_LIMIT),
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

  private buildSearchWhere(normalizedTerm: string): Prisma.GameWhereInput {
    const slugTerm = normalizedTerm.replace(/\s+/g, '-')

    return {
      deletedAt: null,
      OR: [
        { title: { contains: normalizedTerm, mode: 'insensitive' } },
        { slug: { contains: slugTerm, mode: 'insensitive' } },
      ],
    }
  }
}
