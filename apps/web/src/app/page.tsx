// SSR homepage — server component, no client JS needed for initial paint
// Phase 2: parallel discovery fetches with ISR revalidation + graceful fallback

import { Hero } from '@/components/home/Hero'
import { DiscoveryCarousel } from '@/components/game/DiscoveryCarousel'
import { FeaturedReviewsSection } from '@/components/home/FeaturedReviewsSection'
import { CommunityCollectionsSection } from '@/components/home/CommunityCollectionsSection'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { EditorialSectionWrapper } from '@/components/ui/EditorialSectionWrapper'
import {
  FEATURED_GAMES,
  TRENDING_GAMES,
  NEW_RELEASES,
  TOP_RATED,
  FEATURED_REVIEWS,
  COMMUNITY_COLLECTIONS,
  type SeedReview,
  type SeedCollection,
} from '@/lib/data/seed'
import { env } from '@/lib/env'
import type { Metadata } from 'next'
import type { GameSummary, GameDetail, FeaturedReview, DiscoveryCollection } from '@continue/types'

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
  const [trending, newReleases, topRated, featuredReviews, collections] =
    await Promise.all([
      fetchDiscovery<GameSummary[]>('/games/trending?limit=6'),
      fetchDiscovery<GameSummary[]>('/games/new-releases?limit=6'),
      fetchDiscovery<GameSummary[]>('/games/top-rated?limit=6'),
      fetchDiscovery<FeaturedReview[]>('/reviews/featured?limit=3'),
      fetchDiscovery<DiscoveryCollection[]>('/lists/discovery?limit=3'),
    ])

  const hasLiveGames = (trending?.length ?? 0) > 0
  const liveGames = trending ?? []

  return {
    // Hero takes GameDetail[] — cast from GameSummary if live data available
    featured: hasLiveGames
      ? (liveGames.slice(0, 3) as unknown as GameDetail[])
      : FEATURED_GAMES,

    trending: hasLiveGames ? liveGames : TRENDING_GAMES,
    newReleases: (newReleases?.length ?? 0) > 0 ? (newReleases ?? []) : NEW_RELEASES,
    topRated: (topRated?.length ?? 0) > 0 ? (topRated ?? []) : TOP_RATED,

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
    <main id="main-content">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Hero featured={featured} />

      <ResponsiveContainer className="pb-16 md:pb-24">
        <AnimatedSection delay={0}>
          <EditorialSectionWrapper hasDivider>
            <DiscoveryCarousel
              title="Trending Now"
              games={trending}
              viewAllHref="/games?sort=trending"
            />
          </EditorialSectionWrapper>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <EditorialSectionWrapper hasDivider>
            <DiscoveryCarousel
              title="New Releases"
              games={newReleases}
              viewAllHref="/games?sort=new"
            />
          </EditorialSectionWrapper>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <EditorialSectionWrapper hasDivider>
            <DiscoveryCarousel
              title="Top Rated"
              games={topRated}
              viewAllHref="/games?sort=top-rated"
            />
          </EditorialSectionWrapper>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <EditorialSectionWrapper hasDivider>
            <FeaturedReviewsSection reviews={reviews} />
          </EditorialSectionWrapper>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <EditorialSectionWrapper>
            <CommunityCollectionsSection collections={collections} />
          </EditorialSectionWrapper>
        </AnimatedSection>
      </ResponsiveContainer>
    </main>
  )
}
