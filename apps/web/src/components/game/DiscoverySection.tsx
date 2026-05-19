import type { GameSummary } from '@continue/types'
import { GameCard, GameCardSkeleton } from '@/components/game/GameCard'
import { cn } from '@/lib/utils'

interface DiscoverySectionProps {
  title: string
  games: GameSummary[]
  loading?: boolean
  skeletonCount?: number
  viewAllHref?: string
  className?: string
}

export function DiscoverySection({
  title,
  games,
  loading = false,
  skeletonCount = 6,
  viewAllHref,
  className,
}: DiscoverySectionProps) {
  return (
    <section className={cn('discovery-section', className)} aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Header */}
      <div className="discovery-section__header">
        <h2
          className="discovery-section__title"
          id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="discovery-section__view-all">
            View all
          </a>
        )}
      </div>

      {/* Grid */}
      <ul className="discovery-section__grid" role="list">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <li key={i}>
                <GameCardSkeleton variant="discovery" />
              </li>
            ))
          : games.map((game) => (
              <li key={game.id}>
                <GameCard game={game} variant="discovery" />
              </li>
            ))}
      </ul>
    </section>
  )
}
