// SSR homepage — server component, no client JS needed for initial paint
// Phase 2.6.2: editorial hero redesign + premium shelf architecture + community pulse

import { EditorialHero } from '@/components/home/Hero'
import { HomeShelf } from '@/components/home/HomeShelf'
import { FeaturedReviewSpotlight } from '@/components/home/FeaturedReviewSpotlight'
import { CommunityPulse } from '@/components/home/CommunityPulse'
import { RouteTransition, MotionFade } from '@/components/motion'
import { selectHeroGame } from '@/lib/hero-selection'
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

// ─── Featured Review Editorial Selection Logic ──────────────────────────────
// Evaluates review body length and rating value to select the most engaging item.
function selectSpotlightReview(reviews: SeedReview[]): SeedReview | null {
  if (reviews.length === 0) return null

  const scored = reviews.map((r) => {
    // Score length (longer reviews usually contain more high-quality context)
    const lengthScore = Math.min(15.0, r.body.length / 40.0)
    // Score rating confidence (strong opinions rated 8+ or under 3 are favored)
    const confidenceScore = r.rating >= 8.5 || r.rating <= 3.0 ? 5.0 : 2.0

    return {
      review: r,
      score: lengthScore + confidenceScore,
    }
  })

  // Sort descending by calculated score
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.review ?? null
}

// ─── Main data loader — all fetches run in parallel ──────────────────────────
async function getHomeData() {
  const [trendingShelf, recentReleasesShelf, topRatedShelf, featuredReviews, collections] =
    await Promise.all([
      fetchDiscovery<GameShelf>('/shelves/trending?limit=10'),
      fetchDiscovery<GameShelf>('/shelves/recent-releases?limit=10'),
      fetchDiscovery<GameShelf>('/shelves/top-rated?limit=10'),
      fetchDiscovery<FeaturedReview[]>('/reviews/featured?limit=5'),
      fetchDiscovery<DiscoveryCollection[]>('/lists/discovery?limit=3'),
    ])

  const trending = trendingShelf?.items ?? []
  const newReleases = recentReleasesShelf?.items ?? []
  const topRated = topRatedShelf?.items ?? []

  const hasLiveGames = trending.length > 0

  // 1. Hero candidates: use live trending games or seed fallback
  const heroCandidates = hasLiveGames
    ? (trending.slice(0, 5) as unknown as GameDetail[])
    : FEATURED_GAMES

  // Cache selected hero game on the server at load time (runs once per ISR cycle)
  const heroGame = selectHeroGame(heroCandidates)

  // 2. Reviews adapter
  const adaptedReviews =
    (featuredReviews?.length ?? 0) > 0
      ? adaptFeaturedReviews(featuredReviews ?? [])
      : FEATURED_REVIEWS

  // Cache/select best review for the editorial Spotlight spotlight
  const spotlightReview = selectSpotlightReview(adaptedReviews)

  // 3. Collections adapter
  const adaptedCollections =
    (collections?.length ?? 0) > 0 ? adaptCollections(collections ?? []) : COMMUNITY_COLLECTIONS

  return {
    heroGame,
    trending: hasLiveGames ? trending : TRENDING_GAMES,
    newReleases: newReleases.length > 0 ? newReleases : NEW_RELEASES,
    topRated: topRated.length > 0 ? topRated : TOP_RATED,
    spotlightReview,
    reviews: adaptedReviews,
    collections: adaptedCollections,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const { heroGame, trending, newReleases, topRated, spotlightReview, reviews, collections } =
    await getHomeData()

  return (
    <RouteTransition>
      <main id="main-content">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Editorial Hero — artwork-first, premium split layout (pre-scored hero selection cached) */}
        <EditorialHero game={heroGame} />

        {/* ── Trending Now shelf (Rhythm: trending - subtle accent ambient tint) ── */}
        <MotionFade direction="up" delay={0}>
          <HomeShelf
            id="trending"
            title="Trending Now"
            description="The most-played and most-discussed games in the community right now"
            games={trending}
            viewAllHref="/discover?sort=trending"
            rhythm="trending"
          />
        </MotionFade>

        {/* ── New Releases shelf (Rhythm: new_releases - neutral raised backdrop) ── */}
        <MotionFade direction="up" delay={0.04}>
          <HomeShelf
            id="new-releases"
            title="New Releases"
            description="Fresh titles worth your attention — reviewed and rated by the community"
            games={newReleases}
            viewAllHref="/discover?sort=new"
            rhythm="new_releases"
          />
        </MotionFade>

        {/* ── Top Rated shelf (Rhythm: top_rated - sunken editorial panel) ── */}
        <MotionFade direction="up" delay={0.08}>
          <HomeShelf
            id="top-rated"
            title="Top Rated"
            description="The highest-rated games across all genres — as scored by the Continue community"
            games={topRated}
            viewAllHref="/discover?sort=top-rated"
            rhythm="top_rated"
            badge={
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
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
        </MotionFade>

        {/* ── Featured Review Spotlight (Editorial highlight of review text + game cover) ── */}
        {spotlightReview && (
          <MotionFade direction="up" delay={0.12}>
            <FeaturedReviewSpotlight review={spotlightReview} />
          </MotionFade>
        )}

        {/* ── Community Pulse (Dashboard of live activity streams and curated lists) ── */}
        <MotionFade direction="up" delay={0.16}>
          <CommunityPulse reviews={reviews} collections={collections} />
        </MotionFade>
      </main>
    </RouteTransition>
  )
}
