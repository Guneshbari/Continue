import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common'
import type { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, gameId: string, dto: CreateReviewDto) {
    await this.assertGameExists(gameId)

    const existing = await this.prisma.review.findFirst({
      where: { userId, gameId, isPrimary: true, deletedAt: null },
    })
    if (existing) throw new ConflictException('You already reviewed this game')

    return this.prisma.review.create({
      data: { userId, gameId, ...dto, status: 'PUBLISHED' },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })
  }

  async findByGame(gameId: string, limit = 20, cursor?: string) {
    const reviews = await this.prisma.review.findMany({
      where: { gameId, deletedAt: null, status: 'PUBLISHED' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })

    const hasNext = reviews.length > limit
    const data = hasNext ? reviews.slice(0, limit) : reviews
    
    // Satisfy TS strict mode bounds checking
    const lastItem = data[data.length - 1]
    
    return {
      data,
      nextCursor: hasNext && lastItem ? lastItem.id : null,
    }
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.findOwned(id, userId)
    return this.prisma.review.update({
      where: { id: review.id },
      data: dto,
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })
  }

  async remove(id: string, userId: string) {
    const review = await this.findOwned(id, userId)
    await this.prisma.review.update({
      where: { id: review.id },
      data: { deletedAt: new Date() },
    })
  }

  private async findOwned(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } })
    if (!review || review.deletedAt) throw new NotFoundException('Review not found')
    if (review.userId !== userId) throw new ForbiddenException()
    return review
  }

  private async assertGameExists(gameId: string) {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, deletedAt: null }, select: { id: true },
    })
    if (!game) throw new NotFoundException('Game not found')
  }
}
