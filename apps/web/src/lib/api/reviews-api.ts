import { apiClient } from './client'

export interface ReviewResponse {
  id: string
  title: string | null
  body: string
  status: 'PUBLISHED' | 'DRAFT'
  isSpoiler: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export interface CreateReviewPayload {
  title?: string
  body: string
  status?: 'PUBLISHED' | 'DRAFT'
  isSpoiler?: boolean
}

export const reviewsApi = {
  async list(gameId: string, limit = 20, cursor?: string): Promise<{ data: ReviewResponse[] }> {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (cursor) qs.set('cursor', cursor)
    return apiClient.get(`/games/${gameId}/reviews?${qs.toString()}`)
  },

  async create(gameId: string, data: CreateReviewPayload, token: string): Promise<ReviewResponse> {
    const res = await apiClient.post<{ data: ReviewResponse }>(`/games/${gameId}/reviews`, data, token)
    return res.data
  },

  async update(gameId: string, reviewId: string, data: Partial<CreateReviewPayload>, token: string): Promise<ReviewResponse> {
    const res = await apiClient.patch<{ data: ReviewResponse }>(`/games/${gameId}/reviews/${reviewId}`, data, token)
    return res.data
  },

  remove(gameId: string, reviewId: string, token: string): Promise<void> {
    return apiClient.delete(`/games/${gameId}/reviews/${reviewId}`, token)
  },
}
