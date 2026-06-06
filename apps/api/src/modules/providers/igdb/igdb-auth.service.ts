import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { TwitchOauthResponse } from './igdb.types'

@Injectable()
export class IgdbAuthService {
  private readonly logger = new Logger(IgdbAuthService.name)

  private readonly clientId: string | null
  private readonly clientSecret: string | null
  private readonly offlineMode: boolean

  private cachedToken: string | null = null
  private expiresAt: number | null = null // timestamp in milliseconds
  private refreshPromise: Promise<void> | null = null

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('TWITCH_CLIENT_ID') ?? null
    this.clientSecret = this.config.get<string>('TWITCH_CLIENT_SECRET') ?? null
    this.offlineMode =
      this.config.get<string>('IGDB_OFFLINE_MODE') === 'true' ||
      !this.clientId ||
      !this.clientSecret

    if (this.offlineMode) {
      this.logger.warn(
        '⚠️ IGDB Ingestion Credentials missing or IGDB_OFFLINE_MODE is active. Operating in OFFLINE MOCK PROVIDER MODE.',
      )
    } else {
      this.logger.log('🔑 Twitch/IGDB Credentials detected. Authenticated requests active.')
    }
  }

  /**
   * Return whether the system is running in offline mock mode.
   */
  isOfflineMode(): boolean {
    return this.offlineMode
  }

  /**
   * Return the configured Twitch Client ID.
   */
  getClientId(): string | null {
    return this.clientId
  }

  /**
   * Obtain a valid access token. Resolves in-memory cache, and fetches a new token
   * from Twitch if expired or nearing expiration (5-minute buffer).
   * Serializes concurrent requests using refreshPromise.
   */
  async getAccessToken(): Promise<string> {
    if (this.offlineMode) {
      return 'mock-offline-twitch-token'
    }

    if (this.cachedToken && !this.isTokenExpired()) {
      return this.cachedToken
    }

    // Serialize concurrent token fetch calls to prevent multiple concurrent HTTP calls
    if (this.refreshPromise) {
      this.logger.log('🔄 Access token refresh already in progress. Awaiting existing promise...')
      await this.refreshPromise
      return this.cachedToken!
    }

    this.logger.log('🔄 Access token expired or missing. Fetching a new Twitch OAuth token...')
    this.refreshPromise = this.refreshAccessToken().finally(() => {
      this.refreshPromise = null
    })

    await this.refreshPromise

    if (!this.cachedToken) {
      throw new Error('Twitch OAuth token acquisition failed unexpectedly.')
    }

    return this.cachedToken
  }

  /**
   * Force refresh the Twitch OAuth access token.
   */
  async refreshAccessToken(): Promise<void> {
    if (this.offlineMode) {
      this.cachedToken = 'mock-offline-twitch-token'
      this.expiresAt = Date.now() + 3600000
      return
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Twitch Client ID and Client Secret must be configured for authenticated mode.',
      )
    }

    try {
      const response = await axios.post<TwitchOauthResponse>(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          },
        },
      )

      const { access_token, expires_in } = response.data
      this.cachedToken = access_token

      // Store expiresAt with a 5-minute (300,000ms) safety buffer to prevent race conditions
      const bufferMs = 300_000
      this.expiresAt = Date.now() + expires_in * 1000 - bufferMs

      this.logger.log(
        `✅ Twitch OAuth token refreshed successfully. Expires in: ${Math.round(expires_in / 3600)} hour(s) (with safety buffer applied).`,
      )
    } catch (error: any) {
      const details = error.response?.data ? JSON.stringify(error.response.data) : error.message
      this.logger.error(`❌ Failed to retrieve Twitch OAuth token: ${details}`)
      throw new Error(`Twitch OAuth token fetch failed: ${error.message}`)
    }
  }

  /**
   * Returns whether the cached token is missing or expired.
   */
  isTokenExpired(): boolean {
    if (!this.expiresAt) return true
    return Date.now() >= this.expiresAt
  }
}
