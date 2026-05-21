import { apiClient } from './client'
import type { GameSummary } from '@continue/types'

export interface SearchResultItem extends GameSummary {
  type: 'game'
}

export interface SearchResponse {
  data: SearchResultItem[]
}

export const searchApi = {
  search(q: string, limit = 20): Promise<SearchResponse> {
    const qs = new URLSearchParams({ q, limit: String(limit) })
    return apiClient.get(`/search?${qs}`)
  },
}
