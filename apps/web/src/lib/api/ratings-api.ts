import { apiClient } from './client'

export interface RatingResponse {
  id: string
  userId: string
  gameId: string
  score: number
  updatedAt: string
}

export const ratingsApi = {
  async upsert(gameId: string, score: number, token: string): Promise<RatingResponse> {
    const res = await apiClient.put<{ data: RatingResponse }>(`/games/${gameId}/ratings`, { score }, token)
    return res.data
  },

  remove(gameId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/ratings`, token)
  },

  async myRating(gameId: string, token: string): Promise<RatingResponse | null> {
    const res = await apiClient.get<{ data: RatingResponse | null }>(`/games/${gameId}/ratings/me`, token)
    return res.data
  },
}
