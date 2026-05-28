import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateListDto, UpdateListDto, AddListItemDto, ReorderListItemsDto } from './dto/list.dto'
import { getVariantUrl } from '../../common/utils/media'

function slugify(title: string): string {
  let base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)

  if (!base) {
    base = 'untitled'
  }

  const RESERVED_SLUGS = [
    'discovery', 'create', 'edit', 'settings', 'admin',
    'new', 'popular', 'trending', 'api', 'auth', 'u', 'games', 'lists'
  ]

  if (RESERVED_SLUGS.includes(base)) {
    return `${base}-collection`
  }
  return base
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
  items: {
    take: 3,
    orderBy: { position: 'asc' as const },
    select: {
      game: {
        select: {
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
  },
}

const LIST_ITEM_GAME_SELECT = {
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
}

function mapListItem(item: any): any {
  if (!item) return item
  return {
    ...item,
    game: {
      id: item.game?.id,
      slug: item.game?.slug,
      title: item.game?.title,
      coverUrl: getVariantUrl(item.game?.cover, 'COVER_MD'),
      avgRating: item.game?.avgRating,
      releaseDate: item.game?.releaseDate,
    },
  }
}

function mapList(list: any): any {
  if (!list) return list
  return {
    ...list,
    items: (list.items ?? []).map(mapListItem),
  }
}

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public discovery (homepage) ──────────────────────────────────────────────

  /**
   * Public list discovery — top public lists by item count.
   * Returns shaped data for the homepage collection mosaic cards.
   */
  async findPublicDiscovery(limit = 3) {
    const lists = await this.prisma.list.findMany({
      where: { visibility: 'PUBLIC', deletedAt: null },
      orderBy: { items: { _count: 'desc' } },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        _count: { select: { items: true } },
        user: { select: { username: true, displayName: true } },
        items: {
          take: 3,
          orderBy: { position: 'asc' },
          select: {
            game: {
              select: {
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
        },
      },
    })

    return lists.map((list) => ({
      id: list.id,
      slug: list.slug,
      title: list.title,
      description: list.description,
      gameCount: list._count.items,
      curator: {
        username: list.user.username,
        displayName: list.user.displayName ?? list.user.username,
      },
      covers: list.items
        .map((item) => getVariantUrl(item.game.cover, 'COVER_MD'))
        .filter((url): url is string => url !== null),
    }))
  }

  // ─── List CRUD ──────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateListDto) {
    const base = slugify(dto.title)
    const existing = await this.prisma.list.findMany({
      where: { deletedAt: null, slug: { startsWith: base } },
      select: { slug: true },
    })
    const slug = existing.length === 0 ? base : `${base}-${existing.length}`

    const list = await this.prisma.list.create({
      data: {
        userId,
        slug,
        title: dto.title,
        description: dto.description ?? null,
        visibility: dto.visibility ?? 'PUBLIC',
      },
      select: LIST_SELECT,
    })
    return mapList(list)
  }

  async findByUser(username: string, requesterId?: string, gameId?: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: { id: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const visibilityFilter = requesterId === user.id
      ? {}
      : { visibility: 'PUBLIC' as const }

    const lists = await this.prisma.list.findMany({
      where: { userId: user.id, deletedAt: null, ...visibilityFilter },
      orderBy: { updatedAt: 'desc' },
      select: {
        ...LIST_SELECT,
        ...(gameId && {
          items: {
            where: { gameId },
            select: { gameId: true },
          },
        }),
      },
    })

    return lists.map(mapList)
  }

  async findOne(username: string, slug: string, requesterId?: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: { id: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const list = await this.prisma.list.findFirst({
      where: { userId: user.id, slug, deletedAt: null },
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

    if (list.visibility === 'PRIVATE' && requesterId !== list.userId) {
      throw new ForbiddenException('This list is private')
    }

    return {
      ...list,
      items: (list.items ?? []).map(mapListItem),
    }
  }

  async findBySlug(slug: string, requesterId?: string) {
    const list = await this.prisma.list.findFirst({
      where: { slug, deletedAt: null },
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

    if (list.visibility === 'PRIVATE' && requesterId !== list.userId) {
      throw new ForbiddenException('This list is private')
    }

    return {
      ...list,
      items: (list.items ?? []).map(mapListItem),
    }
  }

  async update(id: string, userId: string, dto: UpdateListDto) {
    await this.assertOwner(id, userId)
    const list = await this.prisma.list.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.description !== undefined ? { description: dto.description ?? null } : {}),
      },
      select: LIST_SELECT,
    })
    return mapList(list)
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId)
    await this.prisma.list.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // ─── List items ─────────────────────────────────────────────────────────────

  async addItem(listId: string, userId: string, dto: AddListItemDto) {
    await this.assertOwner(listId, userId)

    const game = await this.prisma.game.findFirst({
      where: { id: dto.gameId, deletedAt: null },
      select: { id: true },
    })
    if (!game) throw new NotFoundException('Game not found')

    const count = await this.prisma.listItem.count({ where: { listId } })

    try {
      const item = await this.prisma.listItem.create({
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
      return mapListItem(item)
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

  async reorderItems(listId: string, userId: string, dto: ReorderListItemsDto) {
    await this.assertOwner(listId, userId)

    const updates = dto.gameIds.map((gameId, index) =>
      this.prisma.listItem.update({
        where: { listId_gameId: { listId, gameId } },
        data: { position: index },
      })
    )

    await this.prisma.$transaction(updates)

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
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
    if (!list) return null
    return {
      ...list,
      items: (list.items ?? []).map(mapListItem),
    }
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────

  private async assertOwner(listId: string, userId: string) {
    const list = await this.prisma.list.findFirst({
      where: { id: listId, deletedAt: null },
      select: { userId: true },
    })
    if (!list) throw new NotFoundException('List not found')
    if (list.userId !== userId) throw new ForbiddenException()
  }
}

