import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ShelfRankingStrategy } from './shelf-ranking.strategy'
import { GAME_SUMMARY_SELECT, GameSummaryRecord } from '../discovery.constants'

@Injectable()
export class TrendingStrategy implements ShelfRankingStrategy {
  async fetch(
    prisma: PrismaService,
    config: ConfigService,
    limit: number,
  ): Promise<GameSummaryRecord[]> {
    const decay = config.get<number>('DISCOVERY_TRENDING_RECENCY_DECAY') ?? 1.5
    const now = new Date()

    // Fetch the 100 most popular games as a candidate pool
    const candidates = await prisma.game.findMany({
      where: {
        deletedAt: null,
        releaseDate: { lte: now },
      },
      orderBy: { ratingCount: 'desc' },
      take: 100,
      select: GAME_SUMMARY_SELECT,
    })

    // Compute trending scores: (ratingCount * avgRating) / (ageInDays + 2)^decay
    const scored = candidates.map((game) => {
      const avgRating = game.avgRating || 0
      const ratingCount = game.ratingCount || 0
      const releaseDate = game.releaseDate ? new Date(game.releaseDate) : new Date(0)

      const ageInMs = Math.max(0, now.getTime() - releaseDate.getTime())
      const ageInDays = ageInMs / (1000 * 60 * 60 * 24)

      const score = (avgRating * ratingCount) / Math.pow(ageInDays + 2, decay)
      return { game, score }
    })

    // Sort by trending score descending
    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, limit).map((s) => s.game)
  }
}
