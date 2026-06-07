'use client'

import { useSearchParams } from 'next/navigation'
import { useGames } from '@/hooks/api/useGames'
import { useDiscoverMetadata } from '@/hooks/api/useDiscoverMetadata'
import { DiscoverySidebar } from '@/components/game/DiscoverySidebar'
import { DiscoveryFilterBar } from '@/components/game/DiscoveryFilterBar'
import { ResponsiveGameGrid } from '@/components/game/ResponsiveGameGrid'
import { PaginationLoader } from '@/components/game/PaginationLoader'
import { GameCardSkeleton } from '@/components/game/GameCard'
import { getSkeletonKeys } from '@/lib/skeletonKeys'
import { GlobalErrorState } from '@/components/ui/GlobalErrorState'
import type { GamesListParams } from '@/lib/api/games-api'

const SORT_MAP: Record<string, GamesListParams['sort']> = {
  'trending': 'trending',
  'top-rated': 'top-rated',
  'most-reviewed': 'most-reviewed',
  'new-releases': 'new',
  'upcoming': 'upcoming',
}

interface DiscoverSortClientProps {
  sortKey: string
}

export function DiscoverSortClient({ sortKey }: DiscoverSortClientProps) {
  const searchParams = useSearchParams()
  
  const genre = searchParams.get('genre') || undefined
  const platform = searchParams.get('platform') || undefined
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined
  const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!, 10) : undefined
  const maxRating = searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!, 10) : undefined
  const minReviewCount = searchParams.get('minReviewCount') ? parseInt(searchParams.get('minReviewCount')!, 10) : undefined
  const cursor = searchParams.get('cursor') || undefined

  const apiSort = SORT_MAP[sortKey]

  // Fetch games list
  const { 
    data: gamesResponse, 
    isLoading: isGamesLoading, 
    isError: isGamesError, 
    refetch: refetchGames 
  } = useGames({
    sort: apiSort,
    genre,
    platform,
    year,
    minRating: rating,
    maxRating,
    minReviewCount,
    cursor,
    limit: 24,
  })

  // Fetch metadata filters
  const { 
    data: filters, 
    isLoading: isFiltersLoading, 
    isError: isFiltersError,
    refetch: refetchFilters
  } = useDiscoverMetadata()

  const handleRetry = () => {
    refetchGames()
    if (isFiltersError) refetchFilters()
  }

  return (
    <div className="discovery-grid-layout">
      {/* Left hand Sidebar */}
      <DiscoverySidebar />

      {/* Right hand Content */}
      <div className="discovery-main-content">
        {isFiltersLoading ? (
          <div className="discovery-filter-bar-skeleton" style={{ height: '2.5rem', marginBottom: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }} />
        ) : isFiltersError ? (
          <DiscoveryFilterBar filters={{ genres: [], platforms: [], years: [], ratings: [] }} />
        ) : (
          <DiscoveryFilterBar filters={filters!} />
        )}

        {isGamesLoading ? (
          <div className="discovery-results-wrapper">
            <div className="grid-switcher-placeholder" style={{ height: '2rem', marginBottom: '1.5rem' }} />
            <ul className="games-grid" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {getSkeletonKeys(12).map((skeletonKey) => (
                <li key={skeletonKey}>
                  <GameCardSkeleton />
                </li>
              ))}
            </ul>
          </div>
        ) : isGamesError ? (
          <div className="discovery-results-wrapper" style={{ marginTop: '2rem' }}>
            <GlobalErrorState onRetry={handleRetry} />
          </div>
        ) : (
          <div className="discovery-results-wrapper">
            <ResponsiveGameGrid games={gamesResponse?.data ?? []} />
            <PaginationLoader nextCursor={gamesResponse?.meta?.nextCursor ?? null} />
          </div>
        )}
      </div>
    </div>
  )
}
