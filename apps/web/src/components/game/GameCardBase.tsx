import type { GameSummary } from '@continue/types'
import Link from 'next/link'
import { Star, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'
import { GameArtwork } from '@/components/ui/GameArtwork'

type GameCardBaseProps = Readonly<{
  game: GameSummary
  variant?: 'discovery' | 'compact' | 'hero' | 'list' | 'homepage'
  className?: string
  priority?: boolean
}>

export function GameCardBase({ game, variant = 'discovery', className, priority = false }: GameCardBaseProps) {
  const href = `/games/${game.slug}`
  const ariaLabel = game.avgRating
    ? `${game.title}, rated ${game.avgRating.toFixed(1)} out of 10`
    : game.title

  // 1. List Variant
  if (variant === 'list') {
    return (
      <Link
        href={href}
        className={cn('game-card game-card--list', className)}
        aria-label={ariaLabel}
      >
        <div className="game-card__cover-list">
          <GameArtwork
            src={game.coverUrl}
            alt={game.title}
            variant="cover-sm"
            hoverable={false}
            sizes="90px"
          />
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

  // 2. Homepage Variant (Artwork-first, 2:3 ratio, hover overlay metadata)
  if (variant === 'homepage') {
    const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
    const platformCount = game.platforms?.length ?? 0
    return (
      <Link
        href={href}
        className={cn('game-card game-card--homepage', className)}
        aria-label={ariaLabel}
      >
        <div className="game-card__cover">
          <GameArtwork
            src={game.coverUrl}
            alt={game.title}
            variant="cover-lg"
            hoverable={false}
            priority={priority}
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
            className="game-card__artwork"
          />

          {game.avgRating !== null && (
            <div className="game-card__rating" aria-hidden="true">
              <MetadataBadge
                variant="warning"
                size="sm"
                icon={<Star size={9} fill="currentColor" aria-hidden="true" />}
              >
                {game.avgRating.toFixed(1)}
              </MetadataBadge>
            </div>
          )}

          <div className="game-card__overlay" aria-hidden="true">
            <p className="game-card__title">{game.title}</p>
            <div className="game-card__meta">
              {year && (
                <time className="game-card__year" dateTime={game.releaseDate ?? undefined}>
                  {year}
                </time>
              )}
              {platformCount > 0 && (
                <span className="game-card__platforms">
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

  // 3. Default card states (discovery, compact, hero)
  return (
    <Link
      href={href}
      className={cn('game-card', `game-card--${variant}`, className)}
      aria-label={ariaLabel}
    >
      <div className="game-card__cover">
        <GameArtwork
          src={game.coverUrl}
          alt={game.title}
          variant={variant === 'hero' ? 'backdrop' : 'cover-md'}
          hoverable={false}
          priority={variant === 'hero' || priority}
          sizes={
            variant === 'hero'
              ? '(max-width: 768px) 100vw, 50vw'
              : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          }
        />

        {game.avgRating !== null && (
          <div className="game-card__rating" aria-hidden="true">
            <MetadataBadge variant="warning" icon={<Star size={10} fill="currentColor" />}>
              {game.avgRating.toFixed(1)}
            </MetadataBadge>
          </div>
        )}
      </div>

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
          <time className="game-card__date" dateTime={game.releaseDate}>
            {new Date(game.releaseDate).getFullYear()}
          </time>
        )}
      </div>
    </Link>
  )
}

/** Skeleton placeholder for GameCardBase */
export function GameCardBaseSkeleton({
  variant = 'discovery',
  className,
}: Readonly<{ variant?: GameCardBaseProps['variant']; className?: string }>) {
  if (variant === 'list') {
    return (
      <div className={cn('game-card game-card--list game-card--skeleton', className)} aria-hidden="true">
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

  if (variant === 'homepage') {
    return (
      <div className={cn('game-card game-card--homepage game-card--skeleton', className)} aria-hidden="true">
        <div className="game-card__cover">
          <div className="game-card__artwork skeleton-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('game-card', `game-card--${variant}`, 'game-card--skeleton', className)} aria-hidden="true">
      <div className="game-card__cover skeleton-pulse" />
      <div className="game-card__info">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  )
}
