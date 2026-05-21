import { apiClient } from './client'

interface RatingResponse {
  id: string
  userId: string
  gameId: string
  score: number
  updatedAt: string
}

export const ratingsApi = {
  upsert(gameId: string, score: number, token: string): Promise<RatingResponse> {
    return apiClient.post(`/games/${gameId}/ratings`, { score }, token)
  },

  remove(gameId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/ratings`, token)
  },

  myRating(gameId: string, token: string): Promise<RatingResponse | null> {
    return apiClient.get(`/games/${gameId}/ratings/me`, token)
  },
}

export const reviewsApi = {
  list<TReview>(gameId: string, limit = 20, cursor?: string): Promise<{ data: TReview[] }> {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (cursor) qs.set('cursor', cursor)
    return apiClient.get(`/games/${gameId}/reviews?${qs}`)
  },

  create<TReview>(gameId: string, data: { title?: string; body: string }, token: string): Promise<TReview> {
    return apiClient.post(`/games/${gameId}/reviews`, data, token)
  },

  update(gameId: string, reviewId: string, data: { title?: string; body?: string }, token: string) {
    return apiClient.patch(`/games/${gameId}/reviews/${reviewId}`, data, token)
  },

  remove(gameId: string, reviewId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/reviews/${reviewId}`, token)
  },
}
