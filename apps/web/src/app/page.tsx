// SSR homepage — server component, no client JS needed for initial paint

import { Hero } from '@/components/home/Hero'
import { DiscoverySection } from '@/components/game/DiscoverySection'
import { FEATURED_GAMES, TRENDING_GAMES, NEW_RELEASES, TOP_RATED } from '@/lib/data/seed'
import { gamesApi } from '@/lib/api/games'
import type { Metadata } from 'next'
import type { GameDetail, GameSummary } from '@continue/types'

export const metadata: Metadata = {
  title: 'Continue — Discover Your Next Game',
  description: 'Discover, rate, and collect games. A cinematic game discovery platform for players who care about quality.',
}

async function getHomeData() {
  try {
    const [trending, newReleases, topRated] = await Promise.all([
      gamesApi.list({ sort: 'trending', limit: 6 }),
      gamesApi.list({ sort: 'new', limit: 6 }),
      gamesApi.list({ sort: 'top-rated', limit: 6 }),
    ])

    const trendingData = trending.data as GameSummary[]
    const newData = newReleases.data as GameSummary[]
    const topData = topRated.data as GameSummary[]

    // Use API data if populated, else fall back to seed
    const hasliveData = trendingData.length > 0
    return {
      featured: hasliveData ? (trendingData.slice(0, 3) as unknown as GameDetail[]) : FEATURED_GAMES,
      trending: hasliveData ? trendingData : TRENDING_GAMES,
      newReleases: hasliveData ? newData : NEW_RELEASES,
      topRated: hasliveData ? topData : TOP_RATED,
    }
  } catch {
    // API not yet running — use static seed data
    return {
      featured: FEATURED_GAMES,
      trending: TRENDING_GAMES,
      newReleases: NEW_RELEASES,
      topRated: TOP_RATED,
    }
  }
}

export default async function HomePage() {
  const { featured, trending, newReleases, topRated } = await getHomeData()

  return (
    <main id="main-content">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <Hero featured={featured} />

      <div className="site-container" style={{ paddingTop: '3rem' }}>
        <DiscoverySection
          title="Trending Now"
          games={trending}
          viewAllHref="/games?sort=trending"
        />

        <DiscoverySection
          title="New Releases"
          games={newReleases}
          viewAllHref="/games?sort=new"
        />

        <DiscoverySection
          title="Top Rated"
          games={topRated}
          viewAllHref="/games?sort=top-rated"
        />
      </div>
    </main>
  )
}

