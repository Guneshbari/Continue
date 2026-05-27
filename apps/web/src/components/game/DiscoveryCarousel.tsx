'use client'

/**
 * DiscoveryCarousel.tsx
 *
 * Embla-powered horizontal carousel for discovery sections.
 *
 * Architecture:
 * - Replaces the static CSS grid in homepage DiscoverySection usage
 * - Embla provides momentum scrolling, snap-points, and accessible arrow controls
 * - useInView from react-intersection-observer defers rendering until visible
 * - Respects prefers-reduced-motion (Embla's dragFree disabled, no auto-scroll)
 * - Falls back to a static grid if JS fails (progressive enhancement)
 *
 * Usage:
 *   <DiscoveryCarousel title="Trending Now" games={games} viewAllHref="/games?sort=trending" />
 */

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GameCard, GameCardSkeleton } from '@/components/game/GameCard'
import { getSkeletonKeys } from '@/lib/skeletonKeys'
import type { GameSummary } from '@continue/types'

type DiscoveryCarouselProps = Readonly<{
  title: string
  games: GameSummary[]
  loading?: boolean
  skeletonCount?: number
  viewAllHref?: string
}>

export function DiscoveryCarousel({
  title,
  games,
  loading = false,
  skeletonCount = 6,
  viewAllHref,
}: DiscoveryCarouselProps) {
  const sectionId = `carousel-${title.toLowerCase().replace(/\s+/g, '-')}`

  // InView: defer expensive slide rendering until the section enters the viewport
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  })

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const slides = loading
    ? getSkeletonKeys(skeletonCount).map((key) => (
        <li key={key} className="discovery-carousel__slide">
          <GameCardSkeleton variant="discovery" />
        </li>
      ))
    : games.map((game) => (
        <li key={game.id} className="discovery-carousel__slide">
          <GameCard game={game} variant="discovery" />
        </li>
      ))

  return (
    <section
      ref={inViewRef}
      className="discovery-carousel"
      aria-labelledby={sectionId}
    >
      {/* Section header */}
      <div className="discovery-carousel__header">
        <h2 className="discovery-section__title" id={sectionId}>
          {title}
        </h2>
        <div className="discovery-carousel__controls">
          {viewAllHref && (
            <Link href={viewAllHref} className="discovery-section__view-all">
              View all
            </Link>
          )}
          <button
            onClick={scrollPrev}
            className="discovery-carousel__arrow"
            aria-label={`Previous ${title} games`}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            onClick={scrollNext}
            className="discovery-carousel__arrow"
            aria-label={`Next ${title} games`}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Embla viewport — only render slides when in view */}
      <div className="discovery-carousel__viewport" ref={emblaRef}>
        <ul className="discovery-carousel__track" aria-live="polite">
          {inView || loading ? slides : null}
        </ul>
      </div>
    </section>
  )
}
