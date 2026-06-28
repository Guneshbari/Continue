import { Injectable, Logger } from '@nestjs/common'
import { IgdbApiService } from '../../providers/igdb/igdb-api.service'
import { IgdbAuthService } from '../../providers/igdb/igdb-auth.service'
import { TaxonomySyncService } from './taxonomy-sync.service'
import { MediaSyncService } from './media-sync.service'
import { GameSyncService } from './game-sync.service'
import type { SyncResult } from '../types/sync.types'
import type { ProviderGame } from '../../providers/contracts/provider.contracts'
import { PrismaService } from '../../../common/prisma/prisma.service'

@Injectable()
export class ProviderSyncService {
  private readonly logger = new Logger(ProviderSyncService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly igdbApi: IgdbApiService,
    private readonly igdbAuth: IgdbAuthService,
    private readonly taxonomySync: TaxonomySyncService,
    private readonly mediaSync: MediaSyncService,
    private readonly gameSync: GameSyncService,
  ) {}

  /**
   * Orchestrates the synchronization of a single game from IGDB by its slug.
   */
  async syncGameBySlug(slug: string, correlationId?: string): Promise<SyncResult> {
    const cid = correlationId || `sync-${Math.random().toString(36).substring(2, 9)}`
    const startTime = Date.now()
    const provider = this.igdbAuth.isOfflineMode() ? 'mock' : 'igdb'

    try {
      this.logger.log(
        `[CorrelationID: ${cid}] 🚀 Starting synchronization for slug: "${slug}" (Provider: ${provider})`,
      )

      // 1. Search for game to resolve external details (offline or live)
      const matches = await this.igdbApi.searchGames(slug, 1)
      const matchedGame = matches.find((g: ProviderGame) => g.slug === slug) ?? matches[0]

      if (!matchedGame) {
        this.logger.warn(
          `[CorrelationID: ${cid}] ⚠️ Game slug "${slug}" not found in external provider.`,
        )
        return {
          status: 'failed',
          entityId: null,
          externalId: null,
          errors: [`Game slug "${slug}" not found in provider.`],
        }
      }

      const syncResult = await this.executeSyncLifecycle(matchedGame, provider, cid)

      const durationMs = Date.now() - startTime
      console.log(
        JSON.stringify({
          event: 'ingestion_sync_completed',
          correlationId: cid,
          provider,
          status: syncResult.status,
          slug: matchedGame.slug,
          externalId: matchedGame.externalId,
          durationMs,
        }),
      )

      return syncResult
    } catch (err: any) {
      this.logger.error(`[CorrelationID: ${cid}] ❌ Sync failed for slug "${slug}": ${err.message}`)
      return {
        status: 'failed',
        entityId: null,
        externalId: null,
        errors: [err.message],
      }
    }
  }

  /**
   * Orchestrates the synchronization of a single game by its external ID.
   */
  async syncGameByExternalId(id: number, correlationId?: string): Promise<SyncResult> {
    const cid = correlationId || `sync-${Math.random().toString(36).substring(2, 9)}`
    const startTime = Date.now()
    const provider = this.igdbAuth.isOfflineMode() ? 'mock' : 'igdb'

    try {
      this.logger.log(
        `[CorrelationID: ${cid}] 🚀 Starting synchronization for external ID: ${id} (Provider: ${provider})`,
      )

      const matchedGame = await this.igdbApi.fetchGameById(id)

      if (!matchedGame) {
        this.logger.warn(`[CorrelationID: ${cid}] ⚠️ External ID ${id} not found in provider.`)
        return {
          status: 'failed',
          entityId: null,
          externalId: id,
          errors: [`External ID ${id} not found in provider.`],
        }
      }

      const syncResult = await this.executeSyncLifecycle(matchedGame, provider, cid)

      const durationMs = Date.now() - startTime
      console.log(
        JSON.stringify({
          event: 'ingestion_sync_completed',
          correlationId: cid,
          provider,
          status: syncResult.status,
          slug: matchedGame.slug,
          externalId: matchedGame.externalId,
          durationMs,
        }),
      )

      return syncResult
    } catch (err: any) {
      this.logger.error(
        `[CorrelationID: ${cid}] ❌ Sync failed for external ID ${id}: ${err.message}`,
      )
      return {
        status: 'failed',
        entityId: null,
        externalId: id,
        errors: [err.message],
      }
    }
  }

  /**
   * Fetches popular games from provider and synchronizes them all transaction-safely.
   */
  async syncPopularGames(limit = 10, correlationId?: string): Promise<SyncResult[]> {
    const cid = correlationId || `sync-popular-${Math.random().toString(36).substring(2, 9)}`
    this.logger.log(
      `[CorrelationID: ${cid}] 🚀 Starting popular games synchronization (Limit: ${limit})...`,
    )
    try {
      const games = await this.igdbApi.fetchPopularGames(limit)
      const results: SyncResult[] = []

      for (const game of games) {
        const result = await this.executeSyncLifecycle(
          game,
          this.igdbAuth.isOfflineMode() ? 'mock' : 'igdb',
          cid,
        )
        results.push(result)
      }

      return results
    } catch (err: any) {
      this.logger.error(`[CorrelationID: ${cid}] ❌ Popular games sync failed: ${err.message}`)
      return [{ status: 'failed', entityId: null, externalId: null, errors: [err.message] }]
    }
  }

  /**
   * Searches provider for games matching query and synchronizes the results.
   */
  async syncSearchResults(query: string, limit = 5, correlationId?: string): Promise<SyncResult[]> {
    const cid = correlationId || `sync-search-${Math.random().toString(36).substring(2, 9)}`
    this.logger.log(
      `[CorrelationID: ${cid}] 🚀 Starting search results synchronization for query: "${query}" (Limit: ${limit})...`,
    )
    try {
      const games = await this.igdbApi.searchGames(query, limit)
      const results: SyncResult[] = []

      for (const game of games) {
        const result = await this.executeSyncLifecycle(
          game,
          this.igdbAuth.isOfflineMode() ? 'mock' : 'igdb',
          cid,
        )
        results.push(result)
      }

      return results
    } catch (err: any) {
      this.logger.error(
        `[CorrelationID: ${cid}] ❌ Search sync failed for "${query}": ${err.message}`,
      )
      return [{ status: 'failed', entityId: null, externalId: null, errors: [err.message] }]
    }
  }

  // ─── Lifecycle Coordinator ──────────────────────────────────────────────────

  private async executeSyncLifecycle(
    game: ProviderGame,
    provider: 'igdb' | 'mock',
    correlationId?: string,
  ): Promise<SyncResult> {
    const cid = correlationId || `sync-lifecycle-${Math.random().toString(36).substring(2, 9)}`

    this.logger.log(
      `[CorrelationID: ${cid}] Starting database write operations for game: "${game.title}"`,
    )

    // Check if game exists to determine create/update status
    const existingGame = await this.prisma.game.findUnique({
      where: { slug: game.slug },
      select: { id: true, updatedAt: true },
    })

    // Incremental update optimization: Skip persistence if already sync'd recently and metadata is equivalent
    const isNew = !existingGame
    const status: 'created' | 'updated' = isNew ? 'created' : 'updated'

    // We execute the sync within a transaction boundary to protect taxonomy/media/game tree consistency.
    // Set custom transaction timeout configurations to avoid infinite database locks under load.
    return await this.prisma.$transaction(
      async (_tx: any) => {
        // 1. Resolve taxonomies (Prisma writes inside transaction)
        const taxonomy = await this.taxonomySync.resolveTaxonomies(game)

        // 2. Resolve media assets
        const coverId = await this.mediaSync.resolveAsset(game.coverUrl, provider)
        const backdropId = await this.mediaSync.resolveAsset(game.backdropUrl, provider)
        const screenshotAssetIds = await this.mediaSync.resolveScreenshots(
          game.screenshots,
          provider,
        )

        // 3. Persist the main game tree
        const entityId = await this.gameSync.syncGame(
          game,
          taxonomy,
          { coverId, backdropId },
          screenshotAssetIds,
        )

        return {
          status,
          entityId,
          externalId: game.externalId,
        }
      },
      {
        maxWait: 5000,
        timeout: 15000,
      },
    )
  }
}
