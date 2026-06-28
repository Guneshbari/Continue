import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DiscoverSortClient } from '@/components/game/DiscoverSortClient'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import type { GamesListParams } from '@/lib/api/games-api'

export const revalidate = 300

interface PageProps {
  params: Promise<{ sort: string }>
  searchParams: Promise<{
    genre?: string
    platform?: string
    year?: string
    rating?: string
    maxRating?: string
    minReviewCount?: string
    cursor?: string
  }>
}

const SORT_MAP: Record<string, GamesListParams['sort']> = {
  trending: 'trending',
  'top-rated': 'top-rated',
  'most-reviewed': 'most-reviewed',
  'new-releases': 'new',
  upcoming: 'upcoming',
}

const TITLE_MAP: Record<string, string> = {
  trending: 'Trending Now',
  'top-rated': 'Top Rated Acclaimed',
  'most-reviewed': 'Most Reviewed Collections',
  'new-releases': 'New Releases',
  upcoming: 'Upcoming Releases',
}

const DESC_MAP: Record<string, string> = {
  trending: 'Check out the most active, popular, and talked-about games on Continue right now.',
  'top-rated':
    'Acclaimed masterpieces and highly rated hits reviewed by Continue community members.',
  'most-reviewed': 'The most discussed, reviewed, and analyzed titles across the entire community.',
  'new-releases': 'Fresh out of the developer oven — recently launched games hot on the press.',
  upcoming: 'Highly anticipated releases coming down the pipe. Keep these on your radar.',
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ sort: string }>
  searchParams: Promise<{ cursor?: string }>
}): Promise<Metadata> {
  const p = await params
  const s = await searchParams
  const title = TITLE_MAP[p.sort] ?? 'Discover'

  // Pagination Indexing Governance: deep scroll offsets are not indexed
  const robots = s.cursor ? { index: false, follow: true } : { index: true, follow: true }

  return {
    title: `${title} — Continue`,
    description:
      DESC_MAP[p.sort] ?? 'Browse and discover games by category, genre, platform and more.',
    robots,
  }
}

export default async function DiscoverSortPage({ params }: PageProps) {
  const resolvedParams = await params
  const sortKey = resolvedParams.sort

  if (!SORT_MAP[sortKey]) {
    notFound()
  }

  const title = TITLE_MAP[sortKey]
  const desc = DESC_MAP[sortKey]

  return (
    <ResponsiveContainer
      as="main"
      className="discovery-layout-container"
      style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}
    >
      <div className="discovery-page-hero">
        <div className="discovery-page-hero__meta">
          <span className="discovery-page-hero__tag">EDITORIAL SECTION</span>
          <h1 className="discovery-page-hero__title">{title}</h1>
          <p className="discovery-page-hero__desc">{desc}</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="discovery-grid-layout" style={{ opacity: 0.5 }}>
            <div className="discovery-main-content">
              <div
                className="discovery-filter-bar-skeleton"
                style={{
                  height: '2.5rem',
                  marginBottom: '1.5rem',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
          </div>
        }
      >
        <DiscoverSortClient sortKey={sortKey} />
      </Suspense>
    </ResponsiveContainer>
  )
}
