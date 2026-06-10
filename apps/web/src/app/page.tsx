// SSR homepage — server component, no client JS needed for initial paint
// Phase 2: parallel discovery fetches with ISR revalidation + graceful fallback

import { Hero } from '@/components/home/Hero'
import { DiscoveryCarousel } from '@/components/game/DiscoveryCarousel'
import { FeaturedReviewsSection } from '@/components/home/FeaturedReviewsSection'
import { CommunityCollectionsSection } from '@/components/home/CommunityCollectionsSection'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { EditorialSectionWrapper } from '@/components/ui/EditorialSectionWrapper'
import { RouteTransition, MotionFade } from '@/components/motion'
import {
  FEATURED_GAMES,
  TRENDING_GAMES,
  NEW_RELEASES,
  TOP_RATED,
  FEATURED_REVIEWS,
  COMMUNITY_COLLECTIONS,
  type SeedReview,
  type SeedCollection,
} from '@/test-fixtures/seed'
import { env } from '@/lib/env'
import type { Metadata } from 'next'
import type { GameDetail, FeaturedReview, DiscoveryCollection } from '@continue/types'
import type { GameShelf } from '@/lib/api/shelves-api'

export const metadata: Metadata = {
  title: 'Continue — Discover Your Next Game',
  description:
    'Discover, rate, and collect games. A cinematic game discovery platform for players who care about quality.',
}

// 5-minute ISR — discovery content is semi-static, avoids per-request SSR pressure
export const revalidate = 300

// ─── Server-side discovery fetch helpers ─────────────────────────────────────
// Uses internal API URL to avoid external networking overhead in Docker.

async function fetchDiscovery<T>(path: string): Promise<T | null> {
  try {
    const url = `${env.internalApiUrl}${path}`
    const res = await fetch(url, {
      // Next.js cache tag for future on-demand revalidation
      next: { revalidate: 300, tags: ['discovery'] },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

// ─── Shape adapters — bridge API types ↔ component prop types ────────────────

function adaptFeaturedReviews(apiReviews: FeaturedReview[]): SeedReview[] {
  return apiReviews.map((r) => ({
    id: r.id,
    body: r.body,
    rating: 0, // no rating on review model; use 0 as sentinel — UI shows stars only when > 0
    game: {
      title: r.game.title,
      slug: r.game.slug,
      coverUrl: r.game.coverUrl,
    },
    user: {
      username: r.user.username,
      displayName: r.user.displayName ?? r.user.username,
    },
  }))
}

function adaptCollections(apiCollections: DiscoveryCollection[]): SeedCollection[] {
  return apiCollections.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? '',
    curator: c.curator,
    gameCount: c.gameCount,
    covers: c.covers,
  }))
}

// ─── Main data loader — all fetches run in parallel ──────────────────────────

async function getHomeData() {
  const [trendingShelf, recentReleasesShelf, topRatedShelf, featuredReviews, collections] =
    await Promise.all([
      fetchDiscovery<GameShelf>('/shelves/trending?limit=6'),
      fetchDiscovery<GameShelf>('/shelves/recent-releases?limit=6'),
      fetchDiscovery<GameShelf>('/shelves/top-rated?limit=6'),
      fetchDiscovery<FeaturedReview[]>('/reviews/featured?limit=3'),
      fetchDiscovery<DiscoveryCollection[]>('/lists/discovery?limit=3'),
    ])

  const trending = trendingShelf?.items ?? []
  const newReleases = recentReleasesShelf?.items ?? []
  const topRated = topRatedShelf?.items ?? []

  const hasLiveGames = trending.length > 0

  return {
    // Hero takes GameDetail[] — cast from GameSummary if live data available
    featured: hasLiveGames
      ? (trending.slice(0, 3) as unknown as GameDetail[])
      : FEATURED_GAMES,

    trending: hasLiveGames ? trending : TRENDING_GAMES,
    newReleases: newReleases.length > 0 ? newReleases : NEW_RELEASES,
    topRated: topRated.length > 0 ? topRated : TOP_RATED,

    reviews:
      (featuredReviews?.length ?? 0) > 0
        ? adaptFeaturedReviews(featuredReviews ?? [])
        : FEATURED_REVIEWS,

    collections:
      (collections?.length ?? 0) > 0
        ? adaptCollections(collections ?? [])
        : COMMUNITY_COLLECTIONS,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { featured, trending, newReleases, topRated, reviews, collections } =
    await getHomeData()

  return (
    <RouteTransition>
      <main id="main-content">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Hero featured={featured} />

        <ResponsiveContainer className="pb-16 md:pb-24">
          <MotionFade direction="up" delay={0}>
            <EditorialSectionWrapper hasDivider>
              <DiscoveryCarousel
                title="Trending Now"
                games={trending}
                viewAllHref="/games?sort=trending"
              />
            </EditorialSectionWrapper>
          </MotionFade>

          <MotionFade direction="up" delay={0.05}>
            <EditorialSectionWrapper hasDivider>
              <DiscoveryCarousel
                title="New Releases"
                games={newReleases}
                viewAllHref="/games?sort=new"
              />
            </EditorialSectionWrapper>
          </MotionFade>

          <MotionFade direction="up" delay={0.1}>
            <EditorialSectionWrapper hasDivider>
              <DiscoveryCarousel
                title="Top Rated"
                games={topRated}
                viewAllHref="/games?sort=top-rated"
              />
            </EditorialSectionWrapper>
          </MotionFade>

          <MotionFade direction="up" delay={0.15}>
            <EditorialSectionWrapper hasDivider>
              <FeaturedReviewsSection reviews={reviews} />
            </EditorialSectionWrapper>
          </MotionFade>

          <MotionFade direction="up" delay={0.2}>
            <EditorialSectionWrapper>
              <CommunityCollectionsSection collections={collections} />
            </EditorialSectionWrapper>
          </MotionFade>
        </ResponsiveContainer>
      </main>
    </RouteTransition>
  )
}
