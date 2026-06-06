import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ShelfRankingStrategy } from './shelf-ranking.strategy'
import { GAME_SUMMARY_SELECT, GameSummaryRecord } from '../discovery.constants'

@Injectable()
export class NewlyAddedStrategy implements ShelfRankingStrategy {
  async fetch(
    prisma: PrismaService,
    config: ConfigService,
    limit: number,
  ): Promise<GameSummaryRecord[]> {
    return prisma.game.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
      take: limit,
      select: GAME_SUMMARY_SELECT,
    })
  }
}
