import { apiClient } from './client'

export interface UserProfile {
  id: string
  username: string
  email?: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
  reviewCount: number
  ratingCount: number
  listCount: number
}

export const usersApi = {
  profile(username: string): Promise<UserProfile> {
    return apiClient.get(`/users/${username}`)
  },

  reviews(username: string, limit = 10, cursor?: string) {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (cursor) qs.set('cursor', cursor)
    return apiClient.get(`/users/${username}/reviews?${qs}`)
  },

  ratings(username: string, limit = 20, cursor?: string) {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (cursor) qs.set('cursor', cursor)
    return apiClient.get(`/users/${username}/ratings?${qs}`)
  },

  lists(username: string) {
    return apiClient.get(`/users/${username}/lists`)
  },
}
