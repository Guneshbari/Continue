import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { getVariantUrl } from '../../common/utils/media'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: { select: { reviews: true, ratings: true, lists: true } },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      ratingCount: user._count.ratings,
      listCount: user._count.lists,
    }
  }

  async findReviews(username: string, limit = 10, cursor?: string) {
    const user = await this.findByUsername(username)
    const reviews = await this.prisma.review.findMany({
      where: { userId: user.id, deletedAt: null, status: 'PUBLISHED' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        game: {
          select: {
            id: true,
            slug: true,
            title: true,
            cover: {
              select: {
                rawUrl: true,
                optimized: true,
                variants: {
                  select: {
                    role: true,
                    url: true,
                    width: true,
                    height: true,
                    format: true,
                    blurPlaceholder: true,
                  },
                },
              },
            },
            avgRating: true,
            releaseDate: true,
            ratings: {
              where: { userId: user.id },
              select: { score: true },
            },
          },
        },
      },
    })
    const hasNext = reviews.length > limit
    const data = hasNext ? reviews.slice(0, limit) : reviews

    const mappedData = data.map((r) => ({
      ...r,
      game: {
        id: r.game.id,
        slug: r.game.slug,
        title: r.game.title,
        coverUrl: getVariantUrl(r.game.cover, 'COVER_MD'),
        avgRating: r.game.avgRating,
        releaseDate: r.game.releaseDate,
        ratings: r.game.ratings,
      },
    }))

    return { data: mappedData, nextCursor: hasNext ? (data[data.length - 1]?.id ?? null) : null }
  }

  async findRatings(username: string, limit = 20, cursor?: string) {
    const user = await this.findByUsername(username)
    const ratings = await this.prisma.rating.findMany({
      where: { userId: user.id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
      include: {
        game: {
          select: {
            id: true,
            slug: true,
            title: true,
            cover: {
              select: {
                rawUrl: true,
                optimized: true,
                variants: {
                  select: {
                    role: true,
                    url: true,
                    width: true,
                    height: true,
                    format: true,
                    blurPlaceholder: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    const hasNext = ratings.length > limit
    const data = hasNext ? ratings.slice(0, limit) : ratings

    const mappedData = data.map((r) => ({
      ...r,
      game: {
        id: r.game.id,
        slug: r.game.slug,
        title: r.game.title,
        coverUrl: getVariantUrl(r.game.cover, 'COVER_MD'),
      },
    }))

    return { data: mappedData, nextCursor: hasNext ? (data[data.length - 1]?.id ?? null) : null }
  }

  async findLists(username: string) {
    const user = await this.findByUsername(username)
    return this.prisma.list.findMany({
      where: { userId: user.id, visibility: 'PUBLIC', deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        visibility: true,
        _count: { select: { items: true } },
      },
    })
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: { select: { reviews: true, ratings: true, lists: true } },
      },
    })
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      ratingCount: user._count.ratings,
      listCount: user._count.lists,
    }
  }
}
