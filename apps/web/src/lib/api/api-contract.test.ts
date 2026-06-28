import { gamesApi } from './games-api'
import { searchApi } from './search-api'
import { shelvesApi } from './shelves-api'
import { discoveryApi } from './discovery-api'
import type { SearchResponse } from './search-api'
import type { GameFiltersResponse } from './discovery-api'
import type { GameShelf } from './shelves-api'
import type { GameDetail, GamesListResponse, GameSummary } from '@/types/api'

// ─── Static Compiler-Enforced Contract Tests ─────────────────────────────────
// These declarations will cause type-checking to fail if any backend/frontend DTO contracts drift.

export function verifyApiContracts() {
  // Validate Games API contracts
  const listPromise: Promise<GamesListResponse> = gamesApi.list({
    sort: 'trending',
    genre: 'action-rpg',
    platform: 'pc',
    year: 2022,
    minRating: 8,
    cursor: 'abc',
    limit: 10,
  })

  const getPromise: Promise<GameDetail> = gamesApi.get('elden-ring')

  // Validate Search API contracts
  const searchPromise: Promise<SearchResponse> = searchApi.search('elden')
  const suggestionsPromise: Promise<SearchResponse> = searchApi.suggestions('elden')

  // Validate Curated Shelves API contracts
  const getShelfPromise: Promise<GameShelf> = shelvesApi.getShelf('trending', 6)

  // Validate Discovery API contracts
  const dashboardPromise: Promise<{
    trending: GameSummary[]
    newReleases: GameSummary[]
    topRated: GameSummary[]
    upcoming: GameSummary[]
  }> = discoveryApi.discoverDashboard(6)

  const metadataPromise: Promise<GameFiltersResponse> = discoveryApi.metadata()

  return {
    listPromise,
    getPromise,
    searchPromise,
    suggestionsPromise,
    getShelfPromise,
    dashboardPromise,
    metadataPromise,
  }
}
