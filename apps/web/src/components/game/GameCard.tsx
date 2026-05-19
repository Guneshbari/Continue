import type { GameSummary } from '@continue/types'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: GameSummary
  variant?: 'discovery' | 'compact' | 'hero'
  className?: string
}

export function GameCard({ game, variant = 'discovery', className }: GameCardProps) {
  const href = `/games/${game.slug}`

  return (
    <Link
      href={href}
      className={cn('game-card', `game-card--${variant}`, className)}
      aria-label={`${game.title}${game.avgRating ? `, rated ${game.avgRating.toFixed(1)} out of 10` : ''}`}
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
            <Star size={10} fill="currentColor" />
            <span>{game.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="game-card__info">
        <h3 className="game-card__title">{game.title}</h3>

        {variant !== 'compact' && game.genres.length > 0 && (
          <ul className="game-card__genres" role="list" aria-label="Genres">
            {game.genres.slice(0, 2).map((g) => (
              <li key={g.id} className="game-card__genre-tag">
                {g.name}
              </li>
            ))}
          </ul>
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
export function GameCardSkeleton({ variant = 'discovery' }: { variant?: GameCardProps['variant'] }) {
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
