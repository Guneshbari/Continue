import { apiClient } from './client'
import type { GameSummary } from '@/types/api'

export interface DiscoverDashboardResponse {
  trending: GameSummary[]
  newReleases: GameSummary[]
  topRated: GameSummary[]
  upcoming: GameSummary[]
}

export interface BackendMetadataResponse {
  genres: { id: string; slug: string; name: string; count: number }[]
  platforms: { id: string; slug: string; name: string; count: number }[]
  themes: { id: string; slug: string; name: string; count: number }[]
  releaseYears: { year: number; count: number }[]
}

export interface GameFiltersResponse {
  genres: { id: string; slug: string; name: string }[]
  platforms: { id: string; slug: string; name: string }[]
  years: number[]
  ratings: number[]
}

export const discoveryApi = {
  async discoverDashboard(limit = 6): Promise<DiscoverDashboardResponse> {
    return apiClient.get<DiscoverDashboardResponse>(`/discover?limit=${limit}`)
  },

  async metadata(): Promise<GameFiltersResponse> {
    const raw = await apiClient.get<BackendMetadataResponse>('/discover/metadata')

    // Normalize backend facets to UI-consumed GameFiltersResponse contract
    return {
      genres: raw.genres.map(({ id, slug, name }) => ({ id, slug, name })),
      platforms: raw.platforms.map(({ id, slug, name }) => ({ id, slug, name })),
      years: raw.releaseYears.map(({ year }) => year),
      ratings: [9, 8, 7, 6, 5, 4, 3, 2, 1], // Standard 10-point scale ratings
    }
  },
}
