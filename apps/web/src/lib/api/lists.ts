import { apiClient } from './client'

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
  create(token: string, payload: CreateListPayload): Promise<ListSummary> {
    return apiClient.post('/lists', payload, token)
  },
  byUser(username: string, token?: string): Promise<ListSummary[]> {
    return apiClient.get(`/users/${username}/lists`, token)
  },
  getOne(username: string, slug: string, token?: string): Promise<ListDetail> {
    return apiClient.get(`/users/${username}/lists/${slug}`, token)
  },
  update(id: string, token: string, payload: Partial<CreateListPayload>): Promise<ListSummary> {
    return apiClient.patch(`/lists/${id}`, payload, token)
  },
  delete(id: string, token: string): Promise<void> {
    return apiClient.delete(`/lists/${id}`, token)
  },
  addItem(listId: string, token: string, gameId: string, note?: string): Promise<ListItem> {
    return apiClient.post(`/lists/${listId}/items`, { gameId, note }, token)
  },
  removeItem(listId: string, gameId: string, token: string): Promise<void> {
    return apiClient.delete(`/lists/${listId}/items/${gameId}`, token)
  },
}
