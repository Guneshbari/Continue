// SSR homepage — server component, no client JS needed for initial paint

import { Hero } from '@/components/home/Hero'
import { DiscoverySection } from '@/components/game/DiscoverySection'
import { FeaturedReviewsSection } from '@/components/home/FeaturedReviewsSection'
import { CommunityCollectionsSection } from '@/components/home/CommunityCollectionsSection'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import {
  FEATURED_GAMES,
  TRENDING_GAMES,
  NEW_RELEASES,
  TOP_RATED,
  FEATURED_REVIEWS,
  COMMUNITY_COLLECTIONS,
} from '@/lib/data/seed'
import { gamesApi } from '@/lib/api/games'
import type { Metadata } from 'next'
import type { GameDetail, GameSummary } from '@continue/types'

export const metadata: Metadata = {
  title: 'Continue - Discover Your Next Game',
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
    const hasLiveData = trendingData.length > 0
    return {
      featured: hasLiveData ? (trendingData.slice(0, 3) as unknown as GameDetail[]) : FEATURED_GAMES,
      trending: hasLiveData ? trendingData : TRENDING_GAMES,
      newReleases: hasLiveData ? newData : NEW_RELEASES,
      topRated: hasLiveData ? topData : TOP_RATED,
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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Hero featured={featured} />

      <div className="homepage-sections">
        <AnimatedSection delay={0}>
          <DiscoverySection
            title="Trending Now"
            games={trending}
            viewAllHref="/games?sort=trending"
          />
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <DiscoverySection
            title="New Releases"
            games={newReleases}
            viewAllHref="/games?sort=new"
          />
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <DiscoverySection
            title="Top Rated"
            games={topRated}
            viewAllHref="/games?sort=top-rated"
          />
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <FeaturedReviewsSection reviews={FEATURED_REVIEWS} />
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <CommunityCollectionsSection collections={COMMUNITY_COLLECTIONS} />
        </AnimatedSection>
      </div>
    </main>
  )
}
