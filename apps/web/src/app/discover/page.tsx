import { Suspense } from 'react'
import type { Metadata } from 'next'
import { gamesApi } from '@/lib/api/games'
import { DiscoverySidebar } from '@/components/game/DiscoverySidebar'
import { GameCard } from '@/components/game/GameCard'
import { Compass } from 'lucide-react'
import Link from 'next/link'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Curated Discover Hub — Continue',
  description: 'Explore the latest trending, top-rated, recently released, and upcoming releases.',
}

async function DiscoverDashboard() {
  let data
  try {
    data = await gamesApi.discover(6)
  } catch (err) {
    console.error('Failed to fetch discovery dashboard:', err)
    data = { trending: [], newReleases: [], topRated: [], upcoming: [] }
  }

  const sections = [
    { title: 'Trending Now', games: data?.trending ?? [], href: '/discover/trending' },
    { title: 'Top Rated', games: data?.topRated ?? [], href: '/discover/top-rated' },
    { title: 'New Releases', games: data?.newReleases ?? [], href: '/discover/new-releases' },
    { title: 'Upcoming Releases', games: data?.upcoming ?? [], href: '/discover/upcoming' },
  ]

  return (
    <div className="discover-dashboard">
      {sections.map((sec) => (
        <section key={sec.href} className="discover-dashboard-section" aria-labelledby={`title-${sec.title.replace(/\s+/g, '-')}`}>
          <div className="discovery-section__header">
            <h2 id={`title-${sec.title.replace(/\s+/g, '-')}`} className="discovery-section__title">
              {sec.title}
            </h2>
            <Link href={sec.href} className="discovery-section__view-all">
              View All
            </Link>
          </div>

          {sec.games.length === 0 ? (
            <div className="games-grid-empty">
              <p>No games in this category yet.</p>
            </div>
          ) : (
            <ul className="games-grid" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {sec.games.map((game) => (
                <li key={game.id}>
                  <GameCard game={game} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <ResponsiveContainer as="main" className="discovery-layout-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="discovery-page-hero">
        <div className="discovery-page-hero__meta">
          <span className="discovery-page-hero__tag">CURATED MEDIA SELECTIONS</span>
          <h1 className="discovery-page-hero__title">
            <Compass size={36} style={{ display: 'inline', marginRight: '0.75rem', verticalAlign: 'middle', marginTop: '-4px' }} />
            Discover Hub
          </h1>
          <p className="discovery-page-hero__desc">
            Scale deep into Continue’s gaming catalog. Browse trending hits, highly acclaimed releases, and curated editorial selections.
          </p>
        </div>
      </div>

      <div className="discovery-grid-layout">
        {/* Sidebar */}
        <DiscoverySidebar />

        {/* Dashboard Content */}
        <div className="discovery-main-content">
          <Suspense fallback={
            <div className="discovery-dashboard-skeleton">
              {[1, 2].map((s) => (
                <div key={s} className="discover-dashboard-section" style={{ marginBottom: '4rem' }}>
                  <div className="skeleton-line skeleton-line--title" style={{ width: '200px', height: '1.5rem', marginBottom: '1.5rem' }} />
                  <div className="games-grid">
                    {[1, 2, 3, 4, 5, 6].map((k) => (
                      <div key={k} className="game-card game-card--skeleton">
                        <div className="game-card__cover skeleton-pulse" style={{ aspectRatio: '3/4' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }>
            <DiscoverDashboard />
          </Suspense>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
