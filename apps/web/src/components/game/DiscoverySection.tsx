import Link from 'next/link'
import type { GameSummary } from '@continue/types'
import { GameCardBase, GameCardBaseSkeleton } from '@/components/game/GameCardBase'
import { cn } from '@/lib/utils'
import { getSkeletonKeys } from '@/lib/skeletonKeys'

type DiscoverySectionProps = Readonly<{
  title: string
  games: GameSummary[]
  loading?: boolean
  skeletonCount?: number
  viewAllHref?: string
  className?: string
}>

export function DiscoverySection({
  title,
  games,
  loading = false,
  skeletonCount = 6,
  viewAllHref,
  className,
}: DiscoverySectionProps) {
  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`
  const skeletonItems = loading
    ? getSkeletonKeys(skeletonCount).map((skeletonKey) => (
        <li key={skeletonKey}>
          <GameCardBaseSkeleton variant="discovery" />
        </li>
      ))
    : games.map((game) => (
        <li key={game.id}>
          <GameCardBase game={game} variant="discovery" />
        </li>
      ))

  return (
    <section className={cn('discovery-section', className)} aria-labelledby={sectionId}>
      {/* Header */}
      <div className="discovery-section__header">
        <h2 className="discovery-section__title" id={sectionId}>
          {title}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="discovery-section__view-all">
            View all
          </Link>
        )}
      </div>

      <ul className="discovery-section__grid">{skeletonItems}</ul>
    </section>
  )
}
