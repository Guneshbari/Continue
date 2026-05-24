import { apiClient } from './client'
import type { DiscoveryCollection } from '@continue/types'

export interface ListSummary {
  id: string
  slug: string
  title: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  createdAt: string
  updatedAt: string
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
  _count: { items: number }
}

export interface ListDetail extends ListSummary {
  items: ListItem[]
}

export interface ListItem {
  id: string
  note: string | null
  position: number
  createdAt: string
  game: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    avgRating: number | null
    releaseDate: string | null
  }
}

export interface CreateListPayload {
  title: string
  description?: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
}

export const listsApi = {
  discoveryCollections(limit = 3): Promise<DiscoveryCollection[]> {
    return apiClient.get(`/lists/discovery?limit=${limit}`)
  },
  async create(token: string, payload: CreateListPayload): Promise<ListSummary> {
    const res = await apiClient.post<{ data: ListSummary }>('/lists', payload, token)
    return res.data
  },
  byUser(username: string, token?: string): Promise<ListSummary[]> {
    return apiClient.get(`/users/${username}/lists`, token)
  },
  async getOne(username: string, slug: string, token?: string): Promise<ListDetail> {
    const res = await apiClient.get<{ data: ListDetail }>(`/users/${username}/lists/${slug}`, token)
    return res.data
  },
  async update(id: string, token: string, payload: Partial<CreateListPayload>): Promise<ListSummary> {
    const res = await apiClient.patch<{ data: ListSummary }>(`/lists/${id}`, payload, token)
    return res.data
  },
  delete(id: string, token: string): Promise<void> {
    return apiClient.delete(`/lists/${id}`, token)
  },
  async addItem(listId: string, token: string, gameId: string, note?: string): Promise<ListItem> {
    const res = await apiClient.post<{ data: ListItem }>(
      `/lists/${listId}/items`,
      { gameId, ...(note ? { note } : {}) },
      token,
    )
    return res.data
  },
  removeItem(listId: string, gameId: string, token: string): Promise<void> {
    return apiClient.delete(`/lists/${listId}/items/${gameId}`, token)
  },
}
