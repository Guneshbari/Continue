import { Injectable, Logger } from '@nestjs/common'
import type { PrismaService } from '../../../common/prisma/prisma.service'
import type { TaxonomyResolutionResult } from '../types/sync.types'

@Injectable()
export class TaxonomySyncService {
  private readonly logger = new Logger(TaxonomySyncService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotently synchronizes the entire taxonomy tree for a given provider game payload,
   * returning resolved database IDs ready for relationship binding.
   */
  async resolveTaxonomies(
    payload: {
      genres: string[]      // slugs
      platforms: string[]   // slugs
      themes: string[]      // slugs
      developers: string[]  // names
      publishers: string[]  // names
      franchise: string | null
    }
  ): Promise<TaxonomyResolutionResult> {
    
    // 1. Resolve Genres - De-duplicate genres slug-level prior to resolution to prevent parallel duplicate conflicts
    const uniqueGenres = Array.from(new Set((payload.genres ?? []).map(g => g.trim().toLowerCase()))).filter(Boolean)
    const genreIds = await Promise.all(
      uniqueGenres.map(async (slug) => {
        const name = this.slugToName(slug)
        const genre = await this.prisma.genre.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
          select: { id: true },
        })
        return genre.id
      })
    )

    // 2. Resolve Platforms - De-duplicate platforms slug-level prior to resolution
    const uniquePlatforms = Array.from(new Set((payload.platforms ?? []).map(p => p.trim().toLowerCase()))).filter(Boolean)
    const platformIds = await Promise.all(
      uniquePlatforms.map(async (slug) => {
        const name = this.slugToName(slug)
        const platform = await this.prisma.platform.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
          select: { id: true },
        })
        return platform.id
      })
    )

    // 3. Resolve Themes - De-duplicate themes slug-level prior to resolution
    const uniqueThemes = Array.from(new Set((payload.themes ?? []).map(t => t.trim().toLowerCase()))).filter(Boolean)
    const themeIds = await Promise.all(
      uniqueThemes.map(async (slug) => {
        const name = this.slugToName(slug)
        const theme = await this.prisma.theme.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
          select: { id: true },
        })
        return theme.id
      })
    )

    // 4. Resolve Developers - De-duplicate by mapping to unique normalized slugs first to prevent collision errors
    const devMap = new Map<string, string>()
    for (const name of (payload.developers ?? [])) {
      if (!name) continue
      const slug = this.nameToSlug(name)
      if (slug && !devMap.has(slug)) {
        devMap.set(slug, name)
      }
    }
    const developerIds = await Promise.all(
      Array.from(devMap.entries()).map(async ([slug, name]) => {
        const dev = await this.prisma.developer.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
          select: { id: true },
        })
        return dev.id
      })
    )

    // 5. Resolve Publishers - De-duplicate by mapping to unique normalized slugs first
    const pubMap = new Map<string, string>()
    for (const name of (payload.publishers ?? [])) {
      if (!name) continue
      const slug = this.nameToSlug(name)
      if (slug && !pubMap.has(slug)) {
        pubMap.set(slug, name)
      }
    }
    const publisherIds = await Promise.all(
      Array.from(pubMap.entries()).map(async ([slug, name]) => {
        const pub = await this.prisma.publisher.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
          select: { id: true },
        })
        return pub.id
      })
    )

    // 6. Resolve Franchise
    let franchiseId: string | null = null
    if (payload.franchise) {
      const slug = this.nameToSlug(payload.franchise)
      const fr = await this.prisma.franchise.upsert({
        where: { slug },
        update: { name: payload.franchise },
        create: { slug, name: payload.franchise },
        select: { id: true },
      })
      franchiseId = fr.id
    }

    return {
      genres: genreIds,
      platforms: platformIds,
      themes: themeIds,
      developers: developerIds,
      publishers: publisherIds,
      franchiseId,
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  private nameToSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 120)
  }
}
