import { apiClient } from './client'
import type { GameSummary, GameDetail, GamesListResponse } from '@continue/types'

export interface GamesListParams {
  sort?: 'trending' | 'top-rated' | 'new' | 'upcoming'
  genre?: string
  platform?: string
  q?: string
  cursor?: string
  limit?: number
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

  // ─── Single game ────────────────────────────────────────────────────────────
  async get(idOrSlug: string): Promise<GameDetail> {
    const res = await apiClient.get<{ data: GameDetail }>(`/games/${idOrSlug}`)
    return res.data
  },
}
