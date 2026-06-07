import { apiClient } from './client'
import type { GameDetail, GamesListResponse } from '@/types/api'

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
    
    qs.sort()
    
    const query = qs.toString()
    return apiClient.get(`/games${query ? `?${query}` : ''}`)
  },

  async get(idOrSlug: string): Promise<GameDetail> {
    const res = await apiClient.get<{ data: GameDetail }>(`/games/${idOrSlug}`)
    return res.data
  },
}
export type { GameDetail, GamesListResponse }
