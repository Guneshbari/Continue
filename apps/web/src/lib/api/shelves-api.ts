import { apiClient } from './client'
import type { GameSummary } from '@/types/api'

export interface GameShelf {
  id: string
  title: string
  items: GameSummary[]
}

export const shelvesApi = {
  getShelf(kind: string, limit = 12): Promise<GameShelf> {
    return apiClient.get<GameShelf>(`/shelves/${kind}?limit=${limit}`)
  },
}
