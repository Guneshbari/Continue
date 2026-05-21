import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateListDto, UpdateListDto, AddListItemDto } from './dto/list.dto'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  _count: { select: { items: true } },
}

const LIST_ITEM_GAME_SELECT = {
  id: true,
  slug: true,
  title: true,
  coverUrl: true,
  avgRating: true,
  releaseDate: true,
}

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── List CRUD ──────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateListDto) {
    const base = slugify(dto.title)
    // Ensure unique slug per user by appending a short suffix if needed
    const existing = await this.prisma.list.findMany({
      where: { userId, slug: { startsWith: base } },
      select: { slug: true },
    })
    const slug = existing.length === 0 ? base : `${base}-${existing.length}`

    return this.prisma.list.create({
      data: {
        userId,
        slug,
        title: dto.title,
        description: dto.description ?? null,
        visibility: dto.visibility ?? 'PUBLIC',
      },
      select: LIST_SELECT,
    })
  }

  async findByUser(username: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: { id: true },
    })
    if (!user) throw new NotFoundException('User not found')

    // If requester is owner, show all; otherwise only PUBLIC
    const visibilityFilter = requesterId === user.id
      ? {}
      : { visibility: 'PUBLIC' as const }

    return this.prisma.list.findMany({
      where: { userId: user.id, ...visibilityFilter },
      orderBy: { updatedAt: 'desc' },
      select: LIST_SELECT,
    })
  }

  async findOne(username: string, slug: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: { id: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const list = await this.prisma.list.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        items: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            note: true,
            position: true,
            createdAt: true,
            game: { select: LIST_ITEM_GAME_SELECT },
          },
        },
        _count: { select: { items: true } },
      },
    })
    if (!list) throw new NotFoundException('List not found')

    // Private list — only owner can see
    if (list.visibility === 'PRIVATE' && requesterId !== list.userId) {
      throw new ForbiddenException('This list is private')
    }

    return list
  }

  async update(id: string, userId: string, dto: UpdateListDto) {
    await this.assertOwner(id, userId)
    return this.prisma.list.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.description !== undefined ? { description: dto.description ?? null } : {}),
      },
      select: LIST_SELECT,
    })
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId)
    await this.prisma.list.delete({ where: { id } })
  }

  // ─── List items ─────────────────────────────────────────────────────────────

  async addItem(listId: string, userId: string, dto: AddListItemDto) {
    await this.assertOwner(listId, userId)

    // Check game exists
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId, deletedAt: null },
      select: { id: true },
    })
    if (!game) throw new NotFoundException('Game not found')

    // Max position = current count
    const count = await this.prisma.listItem.count({ where: { listId } })

    try {
      return await this.prisma.listItem.create({
        data: {
          listId,
          gameId: dto.gameId,
          note: dto.note ?? null,
          position: count,
        },
        include: {
          game: { select: LIST_ITEM_GAME_SELECT },
        },
      })
    } catch {
      throw new ConflictException('Game already in this list')
    }
  }

  async removeItem(listId: string, userId: string, gameId: string) {
    await this.assertOwner(listId, userId)
    const item = await this.prisma.listItem.findFirst({
      where: { listId, gameId },
    })
    if (!item) throw new NotFoundException('Item not found in list')
    await this.prisma.listItem.delete({ where: { id: item.id } })
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────

  private async assertOwner(listId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: { userId: true },
    })
    if (!list) throw new NotFoundException('List not found')
    if (list.userId !== userId) throw new ForbiddenException()
  }
}
