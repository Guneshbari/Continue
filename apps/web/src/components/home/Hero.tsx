import Image from 'next/image'
import Link from 'next/link'
import { Star, Calendar, Monitor, Play, BookOpen } from 'lucide-react'
import type { GameDetail } from '@continue/types'
import { AmbientGlow, MotionFade, MotionReveal } from '@/components/motion'
import { Button } from '@/components/ui/Button'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'
import { GameArtwork } from '@/components/ui/GameArtwork'

type EditorialHeroProps = Readonly<{
  game: GameDetail | null
}>

export function EditorialHero({ game }: EditorialHeroProps) {
  if (!game) return null

  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const platformCount = game.platforms?.length ?? 0
  const genresToShow = game.genres?.slice(0, 3) ?? []
  const description = game.description
    ? game.description.slice(0, 200) + (game.description.length > 200 ? '…' : '')
    : null

  return (
    <section className="editorial-hero" aria-label={`Featured game: ${game.title}`}>
      {/* 1. Backdrop image layer (delay 0s) */}
      {game.bannerUrl && (
        <MotionFade direction="none" delay={0} duration={0.8} className="editorial-hero__bg">
          <Image
            src={game.bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="editorial-hero__bg-img"
          />
          {/* 2. Dark gradient overlay */}
          <div className="editorial-hero__bg-gradient" />
        </MotionFade>
      )}

      {/* 3. Static noise texture layer (static PNG blend-mode, cached) */}
      <div className="editorial-hero__noise" aria-hidden="true" />

      {/* 4. Ambient glow layer (delay 0.1s) */}
      <AmbientGlow intensity="subtle" className="editorial-hero__glow" />

      {/* 5. Content */}
      <div className="editorial-hero__content">
        {/* LEFT — editorial text */}
        <div className="editorial-hero__left">
          {/* Genre tags / metadata (delay 0.2s) */}
          {genresToShow.length > 0 && (
            <MotionFade direction="none" delay={0.2} duration={0.4}>
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

          {/* Title (delay 0.3s) */}
          <MotionReveal delay={0.3} duration={0.7}>
            <h1 className="editorial-hero__title">{game.title}</h1>
          </MotionReveal>

          {/* Editorial description (delay 0.4s) */}
          {description && (
            <MotionFade direction="up" delay={0.4} duration={0.5}>
              <p className="editorial-hero__description">{description}</p>
            </MotionFade>
          )}

          {/* Metadata row — rating, year, platforms (delay 0.45s) */}
          <MotionFade direction="up" delay={0.45} duration={0.5}>
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

          {/* CTAs / Actions (delay 0.5s) */}
          <MotionFade direction="up" delay={0.5} duration={0.5}>
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

        {/* RIGHT — hero artwork (delay 0.6s) */}
        <div className="editorial-hero__right" aria-hidden="true">
          <MotionFade direction="left" delay={0.6} duration={0.7}>
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
