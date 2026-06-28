import { apiClient } from './client'
import type { GameSummary, GameDetail, GamesListResponse } from '@continue/types'

export interface DiscoverDashboardResponse {
  trending: GameSummary[]
  newReleases: GameSummary[]
  topRated: GameSummary[]
  upcoming: GameSummary[]
}

export interface GameFiltersResponse {
  genres: { id: string; slug: string; name: string }[]
  platforms: { id: string; slug: string; name: string }[]
  years: number[]
  ratings: number[]
}

export interface GamesListParams {
  sort?:
    | 'trending'
    | 'top-rated'
    | 'most-reviewed'
    | 'newest'
    | 'recently-released'
    | 'upcoming'
    | 'new'
    | undefined
  genre?: string | undefined
  platform?: string | undefined
  q?: string | undefined
  cursor?: string | undefined
  limit?: number | undefined
  year?: number | undefined
  minRating?: number | undefined
  maxRating?: number | undefined
  minReviewCount?: number | undefined
}

export const gamesApi = {
  // ─── Generic paginated list ─────────────────────────────────────────────────
  list(params: GamesListParams = {}): Promise<GamesListResponse> {
    const qs = new URLSearchParams()
    if (params.sort) qs.set('sort', params.sort)
    if (params.genre) qs.set('genre', params.genre)
    if (params.platform) qs.set('platform', params.platform)
    if (params.q) qs.set('q', params.q)
    if (params.cursor) qs.set('cursor', params.cursor)
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.year) qs.set('year', String(params.year))
    if (params.minRating) qs.set('minRating', String(params.minRating))
    if (params.maxRating) qs.set('maxRating', String(params.maxRating))
    if (params.minReviewCount) qs.set('minReviewCount', String(params.minReviewCount))

    // Enforce crawler-safe alphabetical parameter ordering
    qs.sort()

    const query = qs.toString()
    return apiClient.get(`/games${query ? `?${query}` : ''}`)
  },

  // ─── Discovery endpoints — dedicated SSR-optimised routes ──────────────────
  trending(limit = 6): Promise<GameSummary[]> {
    return apiClient.get(`/games/trending?limit=${limit}`)
  },

  newReleases(limit = 6): Promise<GameSummary[]> {
    return apiClient.get(`/games/new-releases?limit=${limit}`)
  },

  topRated(limit = 6): Promise<GameSummary[]> {
    return apiClient.get(`/games/top-rated?limit=${limit}`)
  },

  discover(limit = 6): Promise<DiscoverDashboardResponse> {
    return apiClient.get(`/discover?limit=${limit}`)
  },

  filters(): Promise<GameFiltersResponse> {
    return apiClient.get('/games/filter')
  },

  // ─── Single game ────────────────────────────────────────────────────────────
  async get(idOrSlug: string): Promise<GameDetail> {
    const res = await apiClient.get<{ data: GameDetail }>(`/games/${idOrSlug}`)
    return res.data
  },
}
