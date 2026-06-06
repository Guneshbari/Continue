import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { IgdbAuthService } from './igdb-auth.service'
import { ProviderGame, ProviderTrailer } from '../contracts/provider.contracts'
import { RawIgdbGame } from '../normalizers/igdb-normalizer'
import { normalizeIgdbGame } from '../normalizers/igdb-normalizer'
import { ScenarioRegistryService } from '../../fixtures/scenario-registry.service'

@Injectable()
export class IgdbApiService {
  private readonly logger = new Logger(IgdbApiService.name)
  private readonly baseUrl = 'https://api.igdb.com/v4'

  // Circuit breaker state variables
  private consecutiveFailures = 0
  private breakerState: 'CLOSED' | 'OPEN' = 'CLOSED'
  private breakerCooldownUntil = 0

  constructor(
    private readonly authService: IgdbAuthService,
    private readonly fixtureRegistry: ScenarioRegistryService,
  ) {}

  private verifyBreakerState(): void {
    if (this.breakerState === 'OPEN') {
      if (Date.now() >= this.breakerCooldownUntil) {
        // Cooldown period expired: attempt half-open/closed recovery
        this.breakerState = 'CLOSED'
        this.consecutiveFailures = 0
        this.logger.log('🔌 Circuit breaker cooldown complete. Resuming outgoing IGDB requests.')
      } else {
        const remainingSeconds = Math.ceil((this.breakerCooldownUntil - Date.now()) / 1000)
        throw new Error(
          `IGDB API provider suspended due to too many consecutive failures. Cooldown active for: ${remainingSeconds}s.`,
        )
      }
    }
  }

  private handleBreakerFailure(): void {
    this.consecutiveFailures++
    if (this.consecutiveFailures >= 5) {
      this.breakerState = 'OPEN'
      this.breakerCooldownUntil = Date.now() + 60_000 // 60-second suspension window
      this.logger.error(
        `🔌 Circuit breaker tripped! Suspending all outgoing IGDB API requests for 60s.`,
      )
    }
  }

  private handleBreakerSuccess(): void {
    this.consecutiveFailures = 0
    this.breakerState = 'CLOSED'
  }

  /**
   * Search for games on IGDB matching a text string.
   */
  async searchGames(query: string, limit = 10): Promise<ProviderGame[]> {
    if (this.authService.isOfflineMode()) {
      return this.simulateOfflineSearch(query, limit)
    }

    const fields = this.getGameFieldsQuery()
    const queryBody = `fields ${fields}; search "${query}"; limit ${limit};`
    const rawGames = await this.postRequest<RawIgdbGame[]>('/games', queryBody)
    return rawGames.map(normalizeIgdbGame)
  }

  /**
   * Fetch a single game by its external IGDB ID.
   */
  async fetchGameById(id: number): Promise<ProviderGame | null> {
    if (this.authService.isOfflineMode()) {
      return this.simulateOfflineFetchById(id)
    }

    const fields = this.getGameFieldsQuery()
    const queryBody = `fields ${fields}; where id = ${id};`
    const rawGames = await this.postRequest<RawIgdbGame[]>('/games', queryBody)

    if (!rawGames || rawGames.length === 0) return null
    const first = rawGames[0]
    return first ? normalizeIgdbGame(first) : null
  }

  /**
   * Fetch popular/trending games sorted by rating and count.
   */
  async fetchPopularGames(limit = 10): Promise<ProviderGame[]> {
    if (this.authService.isOfflineMode()) {
      return this.simulateOfflinePopular(limit)
    }

    const fields = this.getGameFieldsQuery()
    const queryBody = `fields ${fields}; sort rating desc; where rating_count > 10; limit ${limit};`
    const rawGames = await this.postRequest<RawIgdbGame[]>('/games', queryBody)
    return rawGames.map(normalizeIgdbGame)
  }

  /**
   * Fetch screenshots independently for a given IGDB game ID.
   */
  async fetchScreenshots(gameId: number): Promise<string[]> {
    const game = await this.fetchGameById(gameId)
    return game?.screenshots ?? []
  }

  /**
   * Fetch trailers independently for a given IGDB game ID.
   */
  async fetchTrailers(gameId: number): Promise<ProviderTrailer[]> {
    const game = await this.fetchGameById(gameId)
    return game?.trailers ?? []
  }

  // ─── Query Builders ────────────────────────────────────────────────────────

  /**
   * Reusable query template for fetching deep, relationally dense game records.
   */
  private getGameFieldsQuery(): string {
    return [
      'name',
      'slug',
      'summary',
      'storyline',
      'first_release_date',
      'rating',
      'rating_count',
      'cover.url',
      'artworks.url',
      'screenshots.url',
      'genres.name',
      'genres.slug',
      'platforms.name',
      'platforms.slug',
      'themes.name',
      'themes.slug',
      'involved_companies.developer',
      'involved_companies.publisher',
      'involved_companies.company.name',
      'involved_companies.company.slug',
      'videos.video_id',
      'videos.name',
      'franchises.name',
      'franchises.slug',
    ].join(',')
  }

  // ─── HTTP Orchestration & Rate Limiting ────────────────────────────────────

  private async postRequest<T>(endpoint: string, queryBody: string, isRetry = false): Promise<T> {
    this.verifyBreakerState()

    const token = await this.authService.getAccessToken()
    const clientId = this.authService.getClientId() ?? ''

    try {
      const response = await axios.post<T>(`${this.baseUrl}${endpoint}`, queryBody, {
        timeout: 10000, // Enforce a 10s request timeout limit
        headers: {
          'Client-ID': clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
      })

      this.handleBreakerSuccess()
      this.checkRateLimits(response.headers)

      return response.data
    } catch (error: any) {
      // 1. Handle HTTP 401 Unauthorized - retry once with refreshed token
      if (error.response?.status === 401 && !isRetry) {
        this.logger.warn(
          '⚠️ IGDB request returned 401 Unauthorized. Clearing Twitch token cache and retrying...',
        )
        await this.authService.refreshAccessToken()
        return this.postRequest<T>(endpoint, queryBody, true)
      }

      this.handleBreakerFailure()

      // 2. Handle HTTP 429 Rate Limit Exhausted
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers?.['retry-after']
        const msg = `IGDB API Rate Limit Exhausted (HTTP 429). Retry After: ${retryAfter ?? 'unknown'}s.`
        this.logger.error(`❌ ${msg}`)
        throw new Error(msg)
      }

      const details = error.response?.data ? JSON.stringify(error.response.data) : error.message
      this.logger.error(`❌ IGDB API request to "${endpoint}" failed: ${details}`)
      throw new Error(`IGDB API Request Failed: ${error.message}`)
    }
  }

  /**
   * Analyzes response headers to warn developers if rate limits are reaching exhaust ceilings.
   */
  private checkRateLimits(headers: any): void {
    const remaining = headers['x-ratelimit-remaining']
    const reset = headers['x-ratelimit-reset']

    if (remaining !== undefined) {
      const remainingInt = parseInt(remaining, 10)
      if (remainingInt < 10) {
        this.logger.warn(
          `⚠️ WARNING: IGDB Rate Limit is critical. Remaining: ${remainingInt}. Resets in: ${reset}s.`,
        )
      }
    }
  }

  // ─── Offline Mock Simulation (Step 2.3.1.e) ──────────────────────────────────

  private getRealisticFixtureDataset(): ProviderGame[] {
    const fixtureGames = this.fixtureRegistry.resolveDataset('realistic')
    return fixtureGames.map((game, index) => ({
      externalId: game.igdbId ?? 1000 + index,
      slug: game.slug,
      title: game.title,
      description: game.description,
      summary: game.summary,
      storyline: game.storyline,
      releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
      igdbRating: game.igdbRating,
      igdbRatingCount: game.igdbRatingCount,
      coverUrl: game.coverUrl,
      backdropUrl: game.backdropUrl,
      genres: game.genres,
      platforms: game.platforms,
      themes: game.themes,
      developers: game.developers,
      publishers: game.publishers,
      franchise: game.franchise,
      screenshots: game.screenshots,
      trailers: game.trailers,
    }))
  }

  private simulateOfflineSearch(query: string, limit: number): ProviderGame[] {
    this.logger.log(`[Offline-Mode] Simulating game search for query: "${query}"`)
    const dataset = this.getRealisticFixtureDataset()
    const cleanQuery = query.toLowerCase().trim()

    return dataset
      .filter(
        (g) =>
          g.title.toLowerCase().includes(cleanQuery) || g.slug.toLowerCase().includes(cleanQuery),
      )
      .slice(0, limit)
  }

  private simulateOfflineFetchById(id: number): ProviderGame | null {
    this.logger.log(`[Offline-Mode] Simulating fetch for game ID: ${id}`)
    const dataset = this.getRealisticFixtureDataset()
    return dataset.find((g) => g.externalId === id) ?? null
  }

  private simulateOfflinePopular(limit: number): ProviderGame[] {
    this.logger.log(`[Offline-Mode] Simulating popular games listing...`)
    const dataset = this.getRealisticFixtureDataset()
    return dataset.sort((a, b) => (b.igdbRating ?? 0) - (a.igdbRating ?? 0)).slice(0, limit)
  }
}
