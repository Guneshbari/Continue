import { Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaService } from '../../common/prisma/prisma.service'
import type { UpsertRatingDto } from './dto/rating.dto'

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, gameId: string, dto: UpsertRatingDto) {
    await this.assertGameExists(gameId)

    const rating = await this.prisma.rating.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: { userId, gameId, score: dto.score },
      update: { score: dto.score },
    })

    await this.recalcAvg(gameId)
    return rating
  }

  async remove(userId: string, gameId: string) {
    await this.assertGameExists(gameId)
    await this.prisma.rating.deleteMany({ where: { userId, gameId } })
    await this.recalcAvg(gameId)
  }

  async findByGame(gameId: string) {
    return this.prisma.rating.findMany({
      where: { gameId },
      select: { score: true, userId: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findUserRating(userId: string, gameId: string) {
    return this.prisma.rating.findUnique({
      where: { userId_gameId: { userId, gameId } },
    })
  }

  private async assertGameExists(gameId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, deletedAt: null },
      select: { id: true },
    })
    if (!game) throw new NotFoundException('Game not found')
  }

  private async recalcAvg(gameId: string) {
    const agg = await this.prisma.rating.aggregate({
      where: { gameId },
      _avg: { score: true },
      _count: { score: true },
    })
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        avgRating: agg._avg.score,
        ratingCount: agg._count.score,
      },
    })
  }
}
