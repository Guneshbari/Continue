import { apiClient } from './client'

interface RatingResponse {
  id: string
  userId: string
  gameId: string
  score: number
  updatedAt: string
}

export const ratingsApi = {
  async upsert(gameId: string, score: number, token: string): Promise<RatingResponse> {
    const res = await apiClient.put<{ data: RatingResponse }>(
      `/games/${gameId}/ratings`,
      { score },
      token,
    )
    return res.data
  },

  remove(gameId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/ratings`, token)
  },

  async myRating(gameId: string, token: string): Promise<RatingResponse | null> {
    const res = await apiClient.get<{ data: RatingResponse | null }>(
      `/games/${gameId}/ratings/me`,
      token,
    )
    return res.data
  },
}

export const reviewsApi = {
  list<TReview>(gameId: string, limit = 20, cursor?: string): Promise<{ data: TReview[] }> {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (cursor) qs.set('cursor', cursor)
    return apiClient.get(`/games/${gameId}/reviews?${qs}`)
  },

  async create<TReview>(
    gameId: string,
    data: {
      title?: string | undefined
      body: string
      isSpoiler?: boolean | undefined
      status?: 'PUBLISHED' | 'DRAFT' | undefined
    },
    token: string,
  ): Promise<TReview> {
    const res = await apiClient.post<{ data: TReview }>(`/games/${gameId}/reviews`, data, token)
    return res.data
  },

  async update<TReview>(
    gameId: string,
    reviewId: string,
    data: {
      title?: string | undefined
      body?: string | undefined
      isSpoiler?: boolean | undefined
      status?: 'PUBLISHED' | 'DRAFT' | undefined
    },
    token: string,
  ): Promise<TReview> {
    const res = await apiClient.patch<{ data: TReview }>(
      `/games/${gameId}/reviews/${reviewId}`,
      data,
      token,
    )
    return res.data
  },

  remove(gameId: string, reviewId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/reviews/${reviewId}`, token)
  },
}
