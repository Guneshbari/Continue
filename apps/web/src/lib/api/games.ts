import { apiClient } from './client'
import type { GameSummary, GameDetail } from '@continue/types'

interface GamesListParams {
  sort?: 'trending' | 'top-rated' | 'new' | 'upcoming'
  genre?: string
  platform?: string
  q?: string
  cursor?: string
  limit?: number
}

interface GamesListResponse {
  data: GameSummary[]
  nextCursor: string | null
}

export const gamesApi = {
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

  get(idOrSlug: string): Promise<GameDetail> {
    return apiClient.get(`/games/${idOrSlug}`)
  },
}
