import type { GameSummary } from '@continue/types'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type CompactGameCardProps = Readonly<{
  game: GameSummary
  className?: string
  /** Position rank to display (e.g. for top rated lists) */
  rank?: number
}>

/**
 * Horizontally-oriented compact card for collections and ranked lists.
 * Cover thumbnail | title + metadata + rating in a row layout.
 * No hover image scale — keeps it performant for dense lists.
 */
export function CompactGameCard({ game, className, rank }: CompactGameCardProps) {
  const href = `/games/${game.slug}`
  const ariaLabel = game.avgRating
    ? `${game.title}, rated ${game.avgRating.toFixed(1)} out of 10`
    : game.title

  return (
    <Link
      href={href}
      className={cn('compact-game-card', className)}
      aria-label={ariaLabel}
    >
      {rank !== undefined && (
        <span className="compact-game-card__rank" aria-hidden="true">
          {rank}
        </span>
      )}

      {/* Cover thumbnail */}
      <div className="compact-game-card__cover">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={`${game.title} cover`}
            fill
            sizes="48px"
            className="compact-game-card__img"
          />
        ) : (
          <div className="compact-game-card__placeholder" aria-hidden="true" />
        )}
      </div>

      {/* Info */}
      <div className="compact-game-card__info">
        <h3 className="compact-game-card__title">{game.title}</h3>
        <div className="compact-game-card__meta">
          {game.genres.length > 0 && (
            <span className="compact-game-card__genre">{game.genres[0]?.name}</span>
          )}
          {game.releaseDate && (
            <time
              className="compact-game-card__year"
              dateTime={game.releaseDate}
            >
              {new Date(game.releaseDate).getFullYear()}
            </time>
          )}
        </div>
      </div>

      {/* Rating */}
      {game.avgRating !== null && (
        <div className="compact-game-card__rating" aria-hidden="true">
          <Star size={11} fill="currentColor" />
          <span>{game.avgRating.toFixed(1)}</span>
        </div>
      )}
    </Link>
  )
}
