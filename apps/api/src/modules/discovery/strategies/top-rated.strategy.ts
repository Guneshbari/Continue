import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ShelfRankingStrategy } from './shelf-ranking.strategy'
import { GAME_SUMMARY_SELECT } from '../discovery.constants'

@Injectable()
export class TopRatedStrategy implements ShelfRankingStrategy {
  async fetch(prisma: PrismaService, config: ConfigService, limit: number): Promise<any[]> {
    const minReviews = config.get<number>('DISCOVERY_TOP_RATED_MIN_REVIEWS') ?? 1

    return prisma.game.findMany({
      where: {
        deletedAt: null,
        avgRating: { not: null },
        ratingCount: { gte: minReviews },
      },
      orderBy: [
        { avgRating: 'desc' },
        { ratingCount: 'desc' },
        { title: 'asc' },
      ],
      take: limit,
      select: GAME_SUMMARY_SELECT,
    })
  }
}
