/**
 * HomeGameCard — homepage-specific game card
 *
 * Artwork-first 2:3 card designed for the homepage shelves.
 * Displays cover art as the dominant element with overlaid metadata.
 *
 * Design principles:
 * - 2:3 cover art ratio (portrait — matches game box art standard)
 * - Rating badge always visible (top-right corner)
 * - Title + year + platform count revealed in footer overlay
 * - On hover: artwork zoom, surface elevation, full metadata opacity
 * - No inline styles — all CSS-driven
 *
 * @example
 * ```tsx
 * <HomeGameCard game={gameSummary} priority={false} />
 * ```
 */

import Link from 'next/link'
import { Star, Monitor } from 'lucide-react'
import type { GameSummary } from '@continue/types'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { MetadataBadge } from '@/components/ui/MetadataBadgeSystem'
import { cn } from '@/lib/utils'

type HomeGameCardProps = Readonly<{
  game: GameSummary
  priority?: boolean | undefined
  className?: string | undefined
}>

export function HomeGameCard({ game, priority = false, className }: HomeGameCardProps) {
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const platformCount = game.platforms?.length ?? 0
  const ariaLabel = [
    game.title,
    game.avgRating ? `rated ${game.avgRating.toFixed(1)}` : null,
    year,
    platformCount > 0 ? `${platformCount} platform${platformCount !== 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn('home-game-card', className)}
      aria-label={ariaLabel}
    >
      {/* Cover artwork — 2:3 ratio, primary visual */}
      <div className="home-game-card__cover">
        <GameArtwork
          src={game.coverUrl}
          alt={game.title}
          variant="cover-lg"
          hoverable={false}
          priority={priority}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
          className="home-game-card__artwork"
        />

        {/* Rating badge — always visible */}
        {game.avgRating !== null && (
          <div className="home-game-card__rating" aria-hidden="true">
            <MetadataBadge
              variant="warning"
              size="sm"
              icon={<Star size={9} fill="currentColor" aria-hidden="true" />}
            >
              {game.avgRating.toFixed(1)}
            </MetadataBadge>
          </div>
        )}

        {/* Metadata overlay — appears on hover */}
        <div className="home-game-card__overlay" aria-hidden="true">
          <p className="home-game-card__title">{game.title}</p>
          <div className="home-game-card__meta">
            {year && (
              <time className="home-game-card__year" dateTime={game.releaseDate ?? undefined}>
                {year}
              </time>
            )}
            {platformCount > 0 && (
              <span className="home-game-card__platforms">
                <Monitor size={10} aria-hidden="true" />
                {platformCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Skeleton placeholder matching HomeGameCard dimensions */
export function HomeGameCardSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn('home-game-card home-game-card--skeleton', className)} aria-hidden="true">
      <div className="home-game-card__cover">
        <div className="home-game-card__artwork skeleton-pulse" />
      </div>
    </div>
  )
}
