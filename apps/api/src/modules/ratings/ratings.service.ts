import { Injectable, NotFoundException } from '@nestjs/common'
import type { PrismaService } from '../../common/prisma/prisma.service'
import type { UpsertRatingDto } from './dto/rating.dto'

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, gameId: string, dto: UpsertRatingDto) {
    await this.assertGameExists(gameId)

    // Upsert + atomic avg recalc in one transaction — no race window
    const rating = await this.prisma.$transaction(async (tx) => {
      const r = await tx.rating.upsert({
        where: { userId_gameId: { userId, gameId } },
        create: { userId, gameId, score: dto.score },
        update: { score: dto.score },
      })
      await this.atomicRecalcAvg(tx, gameId)
      return r
    })

    return rating
  }

  async remove(userId: string, gameId: string) {
    await this.assertGameExists(gameId)
    await this.prisma.$transaction(async (tx) => {
      await tx.rating.deleteMany({ where: { userId, gameId } })
      await this.atomicRecalcAvg(tx, gameId)
    })
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

  /**
   * Single atomic SQL expression — no separate SELECT + UPDATE round-trip.
   * Must be called inside a transaction (tx) to be consistent with the rating write.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async atomicRecalcAvg(tx: any, gameId: string) {
    await tx.$executeRaw`
      UPDATE games
      SET
        avg_rating   = (SELECT AVG(score)::float FROM ratings WHERE game_id = ${gameId}),
        rating_count = (SELECT COUNT(*)::int     FROM ratings WHERE game_id = ${gameId})
      WHERE id = ${gameId}
    `
  }
}
