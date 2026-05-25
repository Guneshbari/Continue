import type { GameSummary } from '@continue/types'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'

type GameCardProps = Readonly<{
  game: GameSummary
  variant?: 'discovery' | 'compact' | 'hero' | 'list'
  className?: string
}>

export function GameCard({ game, variant = 'discovery', className }: GameCardProps) {
  const href = `/games/${game.slug}`
  const ariaLabel = game.avgRating
    ? `${game.title}, rated ${game.avgRating.toFixed(1)} out of 10`
    : game.title

  if (variant === 'list') {
    return (
      <Link
        href={href}
        className={cn('game-card game-card--list', className)}
        aria-label={ariaLabel}
      >
        <div className="game-card__cover-list">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={`${game.title} cover`}
              fill
              sizes="90px"
              className="game-card__img"
            />
          ) : (
            <div className="game-card__cover-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="game-card__info-list">
          <div className="game-card__main-list">
            <h3 className="game-card__title-list">{game.title}</h3>
            {game.genres?.length > 0 && (
              <MetadataBadgeGroup className="mt-1.5 mb-2">
                {game.genres.slice(0, 2).map((g) => (
                  <MetadataBadge key={g.id} variant="accent">
                    {g.name}
                  </MetadataBadge>
                ))}
              </MetadataBadgeGroup>
            )}
            {game.releaseDate && (
              <time className="game-card__date" dateTime={game.releaseDate}>
                {new Date(game.releaseDate).getFullYear()}
              </time>
            )}
          </div>
          {game.avgRating !== null && (
            <div className="game-card__rating-list">
              <MetadataBadge variant="warning" icon={<Star size={10} fill="currentColor" />}>
                {game.avgRating.toFixed(1)}
              </MetadataBadge>
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn('game-card', `game-card--${variant}`, className)}
      aria-label={ariaLabel}
    >
      {/* Cover image */}
      <div className="game-card__cover">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={`${game.title} cover`}
            fill
            sizes={
              variant === 'hero'
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            }
            className="game-card__img"
            priority={variant === 'hero'}
          />
        ) : (
          <div className="game-card__cover-placeholder" aria-hidden="true" />
        )}

        {/* Rating badge */}
        {game.avgRating !== null && (
          <div className="game-card__rating" aria-hidden="true">
            <MetadataBadge variant="warning" icon={<Star size={10} fill="currentColor" />}>
              {game.avgRating.toFixed(1)}
            </MetadataBadge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="game-card__info">
        <h3 className="game-card__title">{game.title}</h3>

        {variant !== 'compact' && game.genres?.length > 0 && (
          <MetadataBadgeGroup className="mb-2.5">
            {game.genres.slice(0, 2).map((g) => (
              <MetadataBadge key={g.id} variant="accent">
                {g.name}
              </MetadataBadge>
            ))}
          </MetadataBadgeGroup>
        )}

        {variant !== 'compact' && game.releaseDate && (
          <time
            className="game-card__date"
            dateTime={game.releaseDate}
          >
            {new Date(game.releaseDate).getFullYear()}
          </time>
        )}
      </div>
    </Link>
  )
}

/** Skeleton placeholder — same dimensions as GameCard */
export function GameCardSkeleton({ variant = 'discovery' }: Readonly<{ variant?: GameCardProps['variant'] }>) {
  if (variant === 'list') {
    return (
      <div className="game-card game-card--list game-card--skeleton" aria-hidden="true">
        <div className="game-card__cover-list skeleton-pulse" />
        <div className="game-card__info-list">
          <div className="game-card__main-list">
            <div className="skeleton-line skeleton-line--title" style={{ width: '180px' }} />
            <div className="skeleton-line skeleton-line--short" style={{ width: '100px', marginTop: '0.5rem' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('game-card', `game-card--${variant}`, 'game-card--skeleton')}
      aria-hidden="true"
    >
      <div className="game-card__cover skeleton-pulse" />
      <div className="game-card__info">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  )
}
