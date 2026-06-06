import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ShelfRankingStrategy } from './shelf-ranking.strategy'
import { GAME_SUMMARY_SELECT, GameSummaryRecord } from '../discovery.constants'

@Injectable()
export class HiddenGemsStrategy implements ShelfRankingStrategy {
  async fetch(
    prisma: PrismaService,
    config: ConfigService,
    limit: number,
  ): Promise<GameSummaryRecord[]> {
    const maxReviews = config.get<number>('DISCOVERY_HIDDEN_GEMS_MAX_REVIEWS') ?? 10

    return prisma.game.findMany({
      where: {
        deletedAt: null,
        avgRating: { gte: 7.0 },
        ratingCount: { gte: 1, lte: maxReviews },
      },
      orderBy: [{ avgRating: 'desc' }, { ratingCount: 'desc' }, { title: 'asc' }],
      take: limit,
      select: GAME_SUMMARY_SELECT,
    })
  }
}
