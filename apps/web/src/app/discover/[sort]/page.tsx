import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { gamesApi } from '@/lib/api/games'
import type { GamesListParams } from '@/lib/api/games'
import { DiscoverySidebar } from '@/components/game/DiscoverySidebar'
import { DiscoveryFilterBar } from '@/components/game/DiscoveryFilterBar'
import { ResponsiveGameGrid } from '@/components/game/ResponsiveGameGrid'
import { PaginationLoader } from '@/components/game/PaginationLoader'
import { GameCardSkeleton } from '@/components/game/GameCard'
import { getSkeletonKeys } from '@/lib/skeletonKeys'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

export const revalidate = 300

interface PageProps {
  params: Promise<{ sort: string }>
  searchParams: Promise<{
    genre?: string
    platform?: string
    year?: string
    rating?: string
    cursor?: string
  }>
}

const SORT_MAP: Record<string, GamesListParams['sort']> = {
  'trending': 'trending',
  'top-rated': 'top-rated',
  'new-releases': 'new',
  'upcoming': 'upcoming',
}

const TITLE_MAP: Record<string, string> = {
  'trending': 'Trending Now',
  'top-rated': 'Top Rated Acclaimed',
  'new-releases': 'New Releases',
  'upcoming': 'Upcoming Releases',
}

const DESC_MAP: Record<string, string> = {
  'trending': 'Check out the most active, popular, and talked-about games on Continue right now.',
  'top-rated': 'Acclaimed masterpieces and highly rated hits reviewed by Continue community members.',
  'new-releases': 'Fresh out of the developer oven — recently launched games hot on the press.',
  'upcoming': 'Highly anticipated releases coming down the pipe. Keep these on your radar.',
}

export async function generateMetadata({ params }: { params: Promise<{ sort: string }> }): Promise<Metadata> {
  const p = await params
  const title = TITLE_MAP[p.sort] ?? 'Discover'
  return {
    title: `${title} — Continue`,
    description: DESC_MAP[p.sort] ?? 'Browse and discover games by category, genre, platform and more.',
  }
}

async function FilteredGameView({
  sortKey,
  genre,
  platform,
  year,
  rating,
  cursor,
}: {
  sortKey: string
  genre?: string | undefined
  platform?: string | undefined
  year?: string | undefined
  rating?: string | undefined
  cursor?: string | undefined
}) {
  const apiSort = SORT_MAP[sortKey]
  if (!apiSort) notFound()

  let gamesResponse
  try {
    gamesResponse = await gamesApi.list({
      sort: apiSort,
      genre,
      platform,
      year: year ? parseInt(year, 10) : undefined,
      minRating: rating ? parseInt(rating, 10) : undefined,
      cursor,
      limit: 24,
    })
  } catch (err) {
    console.error('Failed to load deep discovery games list:', err)
    gamesResponse = { data: [], meta: { nextCursor: null } }
  }

  return (
    <div className="discovery-results-wrapper">
      <ResponsiveGameGrid games={gamesResponse.data} />
      <PaginationLoader nextCursor={gamesResponse.meta?.nextCursor ?? null} />
    </div>
  )
}

export default async function DiscoverSortPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedQueryParams = await searchParams
  const sortKey = resolvedParams.sort

  if (!SORT_MAP[sortKey]) {
    notFound()
  }

  // Load active filters dynamically so selects render dynamically
  let filters
  try {
    filters = await gamesApi.filters()
  } catch {
    filters = { genres: [], platforms: [], years: [], ratings: [] }
  }

  const title = TITLE_MAP[sortKey]
  const desc = DESC_MAP[sortKey]

  return (
    <ResponsiveContainer as="main" className="discovery-layout-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="discovery-page-hero">
        <div className="discovery-page-hero__meta">
          <span className="discovery-page-hero__tag">EDITORIAL SECTION</span>
          <h1 className="discovery-page-hero__title">{title}</h1>
          <p className="discovery-page-hero__desc">{desc}</p>
        </div>
      </div>

      <div className="discovery-grid-layout">
        {/* Left hand Sidebar */}
        <DiscoverySidebar />

        {/* Right hand Content */}
        <div className="discovery-main-content">
          <DiscoveryFilterBar filters={filters} />

          <Suspense fallback={
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
          }>
            <FilteredGameView
              sortKey={sortKey}
              genre={resolvedQueryParams.genre}
              platform={resolvedQueryParams.platform}
              year={resolvedQueryParams.year}
              rating={resolvedQueryParams.rating}
              cursor={resolvedQueryParams.cursor}
            />
          </Suspense>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
