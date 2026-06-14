import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import type { ProviderGame} from '../../providers/contracts/provider.contracts';
import type { TaxonomyResolutionResult } from '../types/sync.types'

@Injectable()
export class GameSyncService {
  private readonly logger = new Logger(GameSyncService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotently synchronizes the core Game entity and its entire relational tree,
   * using delta set operations to minimize database write churn.
   */
  async syncGame(
    providerGame: ProviderGame,
    taxonomy: TaxonomyResolutionResult,
    media: { coverId: string | null; backdropId: string | null },
    screenshotAssetIds: string[],
  ): Promise<string> {
    
    // ── 1. Upsert the Core Game entity ────────────────────────────────────────
    const game = await this.prisma.game.upsert({
      where: { slug: providerGame.slug },
      update: {
        title: providerGame.title,
        description: providerGame.description,
        summary: providerGame.summary,
        storyline: providerGame.storyline,
        releaseDate: providerGame.releaseDate,
        igdbId: providerGame.externalId,
        igdbRating: providerGame.igdbRating,
        igdbRatingCount: providerGame.igdbRatingCount,
        coverId: media.coverId,
        backdropId: media.backdropId,
        franchiseId: taxonomy.franchiseId,
      },
      create: {
        slug: providerGame.slug,
        title: providerGame.title,
        description: providerGame.description,
        summary: providerGame.summary,
        storyline: providerGame.storyline,
        releaseDate: providerGame.releaseDate,
        igdbId: providerGame.externalId,
        igdbRating: providerGame.igdbRating,
        igdbRatingCount: providerGame.igdbRatingCount,
        coverId: media.coverId,
        backdropId: media.backdropId,
        franchiseId: taxonomy.franchiseId,
      },
    })

    const gameId = game.id

    // ── 2. Run Delta Synchronization on Join Tables ──────────────────────────
    await this.syncJunctionPlatforms(gameId, taxonomy.platforms)
    await this.syncJunctionGenres(gameId, taxonomy.genres)
    await this.syncJunctionThemes(gameId, taxonomy.themes)
    await this.syncJunctionDevelopers(gameId, taxonomy.developers)
    await this.syncJunctionPublishers(gameId, taxonomy.publishers)

    // ── 3. Sync screenshots idempotently (Reconcile position / delete orphans) ──
    await this.syncScreenshots(gameId, screenshotAssetIds)

    // ── 4. Sync trailers idempotently ─────────────────────────────────────────
    await this.syncTrailers(gameId, providerGame.trailers)

    return gameId
  }

  // ─── Delta Junction Synchronization Helpers ───────────────────────────────

  private async syncJunctionPlatforms(gameId: string, targetIds: string[]): Promise<void> {
    const existing = await this.prisma.gamePlatform.findMany({
      where: { gameId },
      select: { platformId: true },
    })
    const existingIds = existing.map((p: { platformId: string }) => p.platformId)

    const toAdd = targetIds.filter((id: string) => !existingIds.includes(id))
    const toRemove = existingIds.filter((id: string) => !targetIds.includes(id))

    if (toRemove.length > 0) {
      await this.prisma.gamePlatform.deleteMany({
        where: { gameId, platformId: { in: toRemove } },
      })
    }
    if (toAdd.length > 0) {
      await this.prisma.gamePlatform.createMany({
        data: toAdd.map((platformId: string) => ({ gameId, platformId })),
      })
    }
  }

  private async syncJunctionGenres(gameId: string, targetIds: string[]): Promise<void> {
    const existing = await this.prisma.gameGenre.findMany({
      where: { gameId },
      select: { genreId: true },
    })
    const existingIds = existing.map((g: { genreId: string }) => g.genreId)

    const toAdd = targetIds.filter((id: string) => !existingIds.includes(id))
    const toRemove = existingIds.filter((id: string) => !targetIds.includes(id))

    if (toRemove.length > 0) {
      await this.prisma.gameGenre.deleteMany({
        where: { gameId, genreId: { in: toRemove } },
      })
    }
    if (toAdd.length > 0) {
      await this.prisma.gameGenre.createMany({
        data: toAdd.map((genreId: string) => ({ gameId, genreId })),
      })
    }
  }

  private async syncJunctionThemes(gameId: string, targetIds: string[]): Promise<void> {
    const existing = await this.prisma.gameTheme.findMany({
      where: { gameId },
      select: { themeId: true },
    })
    const existingIds = existing.map((t: { themeId: string }) => t.themeId)

    const toAdd = targetIds.filter((id: string) => !existingIds.includes(id))
    const toRemove = existingIds.filter((id: string) => !targetIds.includes(id))

    if (toRemove.length > 0) {
      await this.prisma.gameTheme.deleteMany({
        where: { gameId, themeId: { in: toRemove } },
      })
    }
    if (toAdd.length > 0) {
      await this.prisma.gameTheme.createMany({
        data: toAdd.map((themeId: string) => ({ gameId, themeId })),
      })
    }
  }

  private async syncJunctionDevelopers(gameId: string, targetIds: string[]): Promise<void> {
    const existing = await this.prisma.gameDeveloper.findMany({
      where: { gameId },
      select: { developerId: true },
    })
    const existingIds = existing.map((d: { developerId: string }) => d.developerId)

    const toAdd = targetIds.filter((id: string) => !existingIds.includes(id))
    const toRemove = existingIds.filter((id: string) => !targetIds.includes(id))

    if (toRemove.length > 0) {
      await this.prisma.gameDeveloper.deleteMany({
        where: { gameId, developerId: { in: toRemove } },
      })
    }
    if (toAdd.length > 0) {
      await this.prisma.gameDeveloper.createMany({
        data: toAdd.map((developerId: string) => ({ gameId, developerId })),
      })
    }
  }

  private async syncJunctionPublishers(gameId: string, targetIds: string[]): Promise<void> {
    const existing = await this.prisma.gamePublisher.findMany({
      where: { gameId },
      select: { publisherId: true },
    })
    const existingIds = existing.map((p: { publisherId: string }) => p.publisherId)

    const toAdd = targetIds.filter((id: string) => !existingIds.includes(id))
    const toRemove = existingIds.filter((id: string) => !targetIds.includes(id))

    if (toRemove.length > 0) {
      await this.prisma.gamePublisher.deleteMany({
        where: { gameId, publisherId: { in: toRemove } },
      })
    }
    if (toAdd.length > 0) {
      await this.prisma.gamePublisher.createMany({
        data: toAdd.map((publisherId: string) => ({ gameId, publisherId })),
      })
    }
  }

  // ─── Screenshot Delta Reconciler ──────────────────────────────────────────

  private async syncScreenshots(gameId: string, incomingAssetIds: string[]): Promise<void> {
    const existing = await this.prisma.screenshot.findMany({
      where: { gameId },
      select: { assetId: true, position: true },
    })

    const existingAssetIds = existing.map((s: { assetId: string }) => s.assetId)

    // Determine diff
    const toAdd = incomingAssetIds.filter((id: string) => !existingAssetIds.includes(id))
    const toRemove = existingAssetIds.filter((id: string) => !incomingAssetIds.includes(id))

    // 1. Delete removed screenshots
    if (toRemove.length > 0) {
      await this.prisma.screenshot.deleteMany({
        where: { gameId, assetId: { in: toRemove } },
      })
    }

    // 2. Add new screenshots
    for (const assetId of toAdd) {
      const position = incomingAssetIds.indexOf(assetId)
      await this.prisma.screenshot.create({
        data: { gameId, assetId, position },
      })
    }

    // 3. Keep positions fully aligned for unchanged screenshots
    for (const s of existing) {
      if (incomingAssetIds.includes(s.assetId)) {
        const targetPos = incomingAssetIds.indexOf(s.assetId)
        if (s.position !== targetPos) {
          await this.prisma.screenshot.updateMany({
            where: { gameId, assetId: s.assetId },
            data: { position: targetPos },
          })
        }
      }
    }
  }

  // ─── Trailer Delta Reconciler ─────────────────────────────────────────────

  private async syncTrailers(
    gameId: string,
    incoming: Array<{ youtubeId: string; name: string | null }>,
  ): Promise<void> {
    const existing = await this.prisma.trailer.findMany({
      where: { gameId },
      select: { id: true, youtubeId: true, name: true },
    })

    const incomingIds = incoming.map((v: { youtubeId: string }) => v.youtubeId)
    const existingIds = existing.map((v: { youtubeId: string }) => v.youtubeId)

    // Diff
    const toAdd = incoming.filter((v: { youtubeId: string }) => !existingIds.includes(v.youtubeId))
    const toRemove = existing.filter((v: { youtubeId: string }) => !incomingIds.includes(v.youtubeId))

    // 1. Delete removed trailers
    if (toRemove.length > 0) {
      await this.prisma.trailer.deleteMany({
        where: { id: { in: toRemove.map((v: { id: string }) => v.id) } },
      })
    }

    // 2. Add new trailers
    if (toAdd.length > 0) {
      await this.prisma.trailer.createMany({
        data: toAdd.map((v: { youtubeId: string; name: string | null }) => ({
          gameId,
          youtubeId: v.youtubeId,
          name: v.name,
        })),
      })
    }

    // 3. Update changed names
    for (const ext of existing) {
      const match = incoming.find((v: { youtubeId: string }) => v.youtubeId === ext.youtubeId)
      if (match && match.name !== ext.name) {
        await this.prisma.trailer.update({
          where: { id: ext.id },
          data: { name: match.name },
        })
      }
    }
  }
}
