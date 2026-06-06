import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { DiscoverMetadataResponseDto } from '../dto/discover-metadata.dto'

@Injectable()
export class FacetAggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async getFacets(): Promise<DiscoverMetadataResponseDto> {
    const [
      genreGroups,
      platformGroups,
      themeGroups,
      gamesWithDates,
      genresList,
      platformsList,
      themesList,
    ] = await Promise.all([
      this.prisma.gameGenre.groupBy({
        by: ['genreId'],
        _count: { gameId: true },
        where: { game: { deletedAt: null } },
      }),
      this.prisma.gamePlatform.groupBy({
        by: ['platformId'],
        _count: { gameId: true },
        where: { game: { deletedAt: null } },
      }),
      this.prisma.gameTheme.groupBy({
        by: ['themeId'],
        _count: { gameId: true },
        where: { game: { deletedAt: null } },
      }),
      this.prisma.game.findMany({
        where: { deletedAt: null, releaseDate: { not: null } },
        select: { releaseDate: true },
      }),
      this.prisma.genre.findMany({
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.platform.findMany({
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.theme.findMany({
        select: { id: true, slug: true, name: true },
      }),
    ])

    // Map counts
    const genreCountsMap = genreGroups.reduce(
      (acc, curr) => {
        acc[curr.genreId] = curr._count.gameId
        return acc
      },
      {} as Record<string, number>,
    )

    const platformCountsMap = platformGroups.reduce(
      (acc, curr) => {
        acc[curr.platformId] = curr._count.gameId
        return acc
      },
      {} as Record<string, number>,
    )

    const themeCountsMap = themeGroups.reduce(
      (acc, curr) => {
        acc[curr.themeId] = curr._count.gameId
        return acc
      },
      {} as Record<string, number>,
    )

    const yearCountsMap = gamesWithDates.reduce(
      (acc, curr) => {
        if (curr.releaseDate) {
          const year = curr.releaseDate.getFullYear()
          acc[year] = (acc[year] || 0) + 1
        }
        return acc
      },
      {} as Record<number, number>,
    )

    // Build lists sorted by count desc, then alphabetically/numerically
    const genres = genresList
      .map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        count: genreCountsMap[g.id] || 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    const platforms = platformsList
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        count: platformCountsMap[p.id] || 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    const themes = themesList
      .map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        count: themeCountsMap[t.id] || 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    const releaseYears = Object.entries(yearCountsMap)
      .map(([year, count]) => ({
        year: Number(year),
        count,
      }))
      .sort((a, b) => b.year - a.year)

    return {
      genres,
      platforms,
      themes,
      releaseYears,
    }
  }
}
