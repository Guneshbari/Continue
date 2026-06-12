// SSR homepage — server component, no client JS needed for initial paint
// Phase 2.6.2: editorial hero redesign + premium shelf architecture

import { EditorialHero } from '@/components/home/Hero'
import { HomeShelf } from '@/components/home/HomeShelf'
import { FeaturedReviewsSection } from '@/components/home/FeaturedReviewsSection'
import { CommunityCollectionsSection } from '@/components/home/CommunityCollectionsSection'
import { EditorialSectionHeader } from '@/components/ui/EditorialSectionHeader'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
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
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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

// ─── Hero candidate selection ─────────────────────────────────────────────────
// Hero game = highest avgRating among candidates, not a random pick.
// Falls back to first item if no ratings exist.

function selectHeroCandidates(games: GameDetail[]): GameDetail[] {
  if (games.length === 0) return FEATURED_GAMES
  return [...games].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
}

// ─── Main data loader — all fetches run in parallel ──────────────────────────

async function getHomeData() {
  const [trendingShelf, recentReleasesShelf, topRatedShelf, featuredReviews, collections] =
    await Promise.all([
      fetchDiscovery<GameShelf>('/shelves/trending?limit=10'),
      fetchDiscovery<GameShelf>('/shelves/recent-releases?limit=10'),
      fetchDiscovery<GameShelf>('/shelves/top-rated?limit=10'),
      fetchDiscovery<FeaturedReview[]>('/reviews/featured?limit=3'),
      fetchDiscovery<DiscoveryCollection[]>('/lists/discovery?limit=3'),
    ])

  const trending = trendingShelf?.items ?? []
  const newReleases = recentReleasesShelf?.items ?? []
  const topRated = topRatedShelf?.items ?? []

  const hasLiveGames = trending.length > 0

  // Hero candidates: use live trending games (cast to GameDetail) or seed fallback
  const heroCandidates = hasLiveGames
    ? (trending.slice(0, 5) as unknown as GameDetail[])
    : FEATURED_GAMES

  return {
    // Hero takes sorted GameDetail[] — best rating wins
    featured: selectHeroCandidates(heroCandidates),

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

        {/* Editorial Hero — artwork-first, premium split layout */}
        <EditorialHero featured={featured} />

        {/* Homepage Content — shelves + editorial sections */}
        <ResponsiveContainer className="pb-16 md:pb-24 pt-12 md:pt-16">

          {/* ── Trending Now shelf ── */}
          <MotionFade direction="up" delay={0}>
            <HomeShelf
              id="trending"
              title="Trending Now"
              description="The most-played and most-discussed games in the community right now"
              games={trending}
              viewAllHref="/discover?sort=trending"
            />
          </MotionFade>

          <hr className="editorial-divider" />

          {/* ── New Releases shelf ── */}
          <MotionFade direction="up" delay={0.04}>
            <div className="mt-section">
              <HomeShelf
                id="new-releases"
                title="New Releases"
                description="Fresh titles worth your attention — reviewed and rated by the community"
                games={newReleases}
                viewAllHref="/discover?sort=new"
              />
            </div>
          </MotionFade>

          <hr className="editorial-divider" />

          {/* ── Top Rated shelf ── */}
          <MotionFade direction="up" delay={0.08}>
            <div className="mt-section">
              <HomeShelf
                id="top-rated"
                title="Top Rated"
                description="The highest-rated games across all genres — as scored by the Continue community"
                games={topRated}
                viewAllHref="/discover?sort=top-rated"
                badge={
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded"
                    style={{
                      background: 'oklch(20% 0.05 70)',
                      color: 'var(--color-warning)',
                      border: '1px solid oklch(30% 0.08 70)',
                    }}
                  >
                    ★ Community Pick
                  </span>
                }
              />
            </div>
          </MotionFade>

          <hr className="editorial-divider" />

          {/* ── Featured Reviews ── */}
          <MotionFade direction="up" delay={0.12}>
            <div className="mt-section">
              <EditorialSectionHeader
                title="Featured Reviews"
                description="In-depth takes from the community on the games that matter most"
                action={
                  <Link
                    href="/discover"
                    className="home-shelf__view-all"
                    aria-label="Browse all reviews"
                  >
                    Browse all
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                }
                className="mb-6"
              />
              <FeaturedReviewsSection reviews={reviews} hideHeader />
            </div>
          </MotionFade>

          <hr className="editorial-divider" />

          {/* ── Community Collections ── */}
          <MotionFade direction="up" delay={0.16}>
            <div className="mt-section">
              <EditorialSectionHeader
                title="Community Collections"
                description="Curated lists built by passionate players — handpicked game journeys"
                action={
                  <Link
                    href="/lists"
                    className="home-shelf__view-all"
                    aria-label="Browse all collections"
                  >
                    Browse all
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                }
                className="mb-6"
              />
              <CommunityCollectionsSection collections={collections} hideHeader />
            </div>
          </MotionFade>

        </ResponsiveContainer>
      </main>
    </RouteTransition>
  )
}
