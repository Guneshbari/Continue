/**
 * EditorialHero — homepage hero, server component
 *
 * Premium editorial hero with split layout:
 * - Left: genre tags, display title, description, metadata badges, dual CTAs
 * - Right: large 2:3 cover artwork with entry animation
 * - Background: faint blurred banner image as ambient backdrop
 * - AmbientGlow: single instance, subtle intensity (< 10% opacity)
 *
 * Architecture decisions:
 * - Server component — no autoplay, no setInterval, no client state
 * - Hero candidate = game with highest avgRating in the featured array
 * - Respects SSR — all data flows from props, zero client fetches
 * - Motion is handled by MotionReveal/MotionFade (client islands)
 *
 * @example
 * ```tsx
 * <EditorialHero featured={featuredGames} />
 * ```
 */

import Image from 'next/image'
import Link from 'next/link'
import { Star, Calendar, Monitor, Play, BookOpen } from 'lucide-react'
import type { GameDetail } from '@continue/types'
import { AmbientGlow, MotionFade, MotionReveal } from '@/components/motion'
import { Button } from '@/components/ui/Button'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'
import { GameArtwork } from '@/components/ui/GameArtwork'

type EditorialHeroProps = Readonly<{
  featured: GameDetail[]
}>

/** Select the best hero candidate: highest avgRating, or first as fallback */
function selectHeroGame(games: GameDetail[]): GameDetail | null {
  if (games.length === 0) return null
  const first = games[0]
  if (!first) return null
  return games.reduce<GameDetail>((best, game) => {
    const bestRating = best.avgRating ?? 0
    const gameRating = game.avgRating ?? 0
    return gameRating > bestRating ? game : best
  }, first)
}

export function EditorialHero({ featured }: EditorialHeroProps) {
  const game = selectHeroGame(featured)
  if (!game) return null

  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const platformCount = game.platforms?.length ?? 0
  const genresToShow = game.genres?.slice(0, 3) ?? []
  const description = game.description
    ? game.description.slice(0, 200) + (game.description.length > 200 ? '…' : '')
    : null

  return (
    <section className="editorial-hero" aria-label={`Featured game: ${game.title}`}>
      {/* Ambient background — blurred banner at low opacity */}
      {game.bannerUrl && (
        <div className="editorial-hero__bg" aria-hidden="true">
          <Image
            src={game.bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="editorial-hero__bg-img"
          />
          <div className="editorial-hero__bg-gradient" />
        </div>
      )}

      {/* Ambient glow — max 1 instance, opacity < 10% */}
      <AmbientGlow intensity="subtle" className="editorial-hero__glow" />

      {/* Main content */}
      <div className="editorial-hero__content">
        {/* LEFT — editorial text */}
        <div className="editorial-hero__left">
          {/* Genre tags */}
          {genresToShow.length > 0 && (
            <MotionFade direction="none" delay={0}>
              <ul className="editorial-hero__genres" aria-label="Genres">
                {genresToShow.map((g) => (
                  <li key={g.id}>
                    <MetadataBadge variant="accent" size="sm">
                      {g.name}
                    </MetadataBadge>
                  </li>
                ))}
              </ul>
            </MotionFade>
          )}

          {/* Title */}
          <MotionReveal duration={0.7}>
            <h1 className="editorial-hero__title">{game.title}</h1>
          </MotionReveal>

          {/* Editorial description */}
          {description && (
            <MotionFade direction="up" delay={0.1} duration={0.5}>
              <p className="editorial-hero__description">{description}</p>
            </MotionFade>
          )}

          {/* Metadata row — rating, year, platforms */}
          <MotionFade direction="up" delay={0.15} duration={0.5}>
            <MetadataBadgeGroup className="editorial-hero__metadata">
              {game.avgRating !== null && (
                <MetadataBadge
                  variant="warning"
                  icon={<Star size={11} fill="currentColor" aria-hidden="true" />}
                  aria-label={`Community rating: ${game.avgRating.toFixed(1)}`}
                >
                  {game.avgRating.toFixed(1)}
                </MetadataBadge>
              )}
              {year && (
                <MetadataBadge
                  variant="muted"
                  icon={<Calendar size={11} aria-hidden="true" />}
                  aria-label={`Released ${year}`}
                >
                  {year}
                </MetadataBadge>
              )}
              {platformCount > 0 && (
                <MetadataBadge
                  variant="muted"
                  icon={<Monitor size={11} aria-hidden="true" />}
                  aria-label={`Available on ${platformCount} platform${platformCount !== 1 ? 's' : ''}`}
                >
                  {platformCount} {platformCount === 1 ? 'platform' : 'platforms'}
                </MetadataBadge>
              )}
              {game.developer && (
                <MetadataBadge variant="muted" aria-label={`Developed by ${game.developer}`}>
                  {game.developer}
                </MetadataBadge>
              )}
            </MetadataBadgeGroup>
          </MotionFade>

          {/* CTAs */}
          <MotionFade direction="up" delay={0.22} duration={0.5}>
            <div className="editorial-hero__ctas">
              <Button
                as={Link}
                href={`/games/${game.slug}`}
                variant="primary"
                size="lg"
                aria-label={`View ${game.title}`}
              >
                <Play size={15} fill="currentColor" aria-hidden="true" />
                View Game
              </Button>
              <Button
                as={Link}
                href="/discover"
                variant="secondary"
                size="lg"
                aria-label="Browse all games"
              >
                <BookOpen size={15} aria-hidden="true" />
                Browse All
              </Button>
            </div>
          </MotionFade>
        </div>

        {/* RIGHT — hero artwork */}
        <div className="editorial-hero__right" aria-hidden="true">
          <MotionFade direction="left" delay={0.05} duration={0.7}>
            <div className="editorial-hero__artwork-wrap">
              <GameArtwork
                src={game.coverUrl}
                alt={`${game.title} cover art`}
                variant="cover-lg"
                hoverable
                priority
                sizes="(max-width: 768px) 0px, (max-width: 1280px) 240px, 280px"
                className="editorial-hero__artwork"
              />
            </div>
          </MotionFade>
        </div>
      </div>
    </section>
  )
}

/** Skeleton while SSR data loads / Suspense boundary */
export function EditorialHeroSkeleton() {
  return (
    <div className="editorial-hero editorial-hero--skeleton" aria-hidden="true">
      <div className="editorial-hero__content">
        <div className="editorial-hero__left">
          <div className="skeleton-pulse" style={{ width: '120px', height: '22px', borderRadius: '4px', marginBottom: '1rem' }} />
          <div className="skeleton-pulse" style={{ width: '70%', height: '80px', borderRadius: '6px', marginBottom: '1rem' }} />
          <div className="skeleton-pulse" style={{ width: '85%', height: '48px', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
            {[80, 70, 100].map((w, i) => (
              <div key={i} className="skeleton-pulse" style={{ width: `${w}px`, height: '22px', borderRadius: '4px' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="skeleton-pulse" style={{ width: '140px', height: '44px', borderRadius: '8px' }} />
            <div className="skeleton-pulse" style={{ width: '120px', height: '44px', borderRadius: '8px' }} />
          </div>
        </div>
        <div className="editorial-hero__right">
          <div className="skeleton-pulse editorial-hero__artwork" />
        </div>
      </div>
    </div>
  )
}
