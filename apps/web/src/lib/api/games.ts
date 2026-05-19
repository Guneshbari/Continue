import { apiClient } from './client'
import type { ApiResponse, GameSummary, GameDetail } from '@continue/types'

export interface GamesQuery {
  q?: string
  genre?: string
  platform?: string
  sort?: 'trending' | 'top-rated' | 'new' | 'upcoming'
  cursor?: string
  limit?: number
}

export const gamesApi = {
  list(query?: GamesQuery): Promise<ApiResponse<GameSummary[]>> {
    const params = new URLSearchParams()
    if (query?.q)        params.set('q', query.q)
    if (query?.genre)    params.set('genre', query.genre)
    if (query?.platform) params.set('platform', query.platform)
    if (query?.sort)     params.set('sort', query.sort)
    if (query?.cursor)   params.set('cursor', query.cursor)
    if (query?.limit)    params.set('limit', String(query.limit))
    const qs = params.toString()
    return apiClient.get(`/games${qs ? `?${qs}` : ''}`)
  },

  get(idOrSlug: string): Promise<GameDetail> {
    return apiClient.get(`/games/${idOrSlug}`)
  },
}
