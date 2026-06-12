'use client'

/**
 * HomeShelf — editorial shelf for the homepage
 *
 * A horizontal scroll row of HomeGameCards with:
 * - EditorialSectionHeader (title + description + view-all link)
 * - Embla horizontal scroll with momentum + arrow controls
 * - MotionStagger card entry animations
 * - Loading skeleton state (6 placeholder cards)
 * - InView deferred rendering (Intersection Observer)
 *
 * @example
 * ```tsx
 * <HomeShelf
 *   id="trending"
 *   title="Trending Now"
 *   description="The most-played games in the community right now"
 *   games={trendingGames}
 *   viewAllHref="/games?sort=trending"
 * />
 * ```
 */

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { HomeGameCard, HomeGameCardSkeleton } from '@/components/game/HomeGameCard'
import { EditorialSectionHeader } from '@/components/ui/EditorialSectionHeader'
import { MotionFade, MotionStagger, MotionStaggerItem } from '@/components/motion'
import { getSkeletonKeys } from '@/lib/skeletonKeys'
import type { GameSummary } from '@continue/types'

type HomeShelfProps = Readonly<{
  /** Unique HTML id — used for section aria-labelledby */
  id: string
  title: string
  /** Short editorial context sentence shown beneath the title */
  description: string
  games: GameSummary[]
  viewAllHref?: string | undefined
  /** Optional label for the badge slot (e.g. "New", "Hot") */
  badge?: React.ReactNode | undefined
  loading?: boolean | undefined
  skeletonCount?: number | undefined
}>

export function HomeShelf({
  id,
  title,
  description,
  games,
  viewAllHref,
  badge,
  loading = false,
  skeletonCount = 6,
}: HomeShelfProps) {
  const headingId = `${id}-heading`

  // InView: defer rendering until section scrolls into view
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

  const viewAllAction = viewAllHref ? (
    <Link href={viewAllHref} className="home-shelf__view-all" aria-label={`View all ${title} games`}>
      View all
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  ) : undefined

  const slides =
    loading || !inView
      ? getSkeletonKeys(skeletonCount).map((key) => (
          <li key={key} className="home-shelf__slide">
            <HomeGameCardSkeleton />
          </li>
        ))
      : games.map((game, i) => (
          <MotionStaggerItem key={game.id} className="home-shelf__slide">
            <HomeGameCard game={game} priority={i < 3} />
          </MotionStaggerItem>
        ))

  return (
    <section ref={inViewRef} className="home-shelf" aria-labelledby={headingId}>
      {/* Section header */}
      <MotionFade direction="none">
        <EditorialSectionHeader
          headingId={headingId}
          title={title}
          description={description}
          badge={badge}
          action={viewAllAction}
          className="home-shelf__header"
        />
      </MotionFade>

      {/* Carousel viewport + arrow controls */}
      <div className="home-shelf__carousel-row">
        <button
          onClick={scrollPrev}
          className="home-shelf__arrow home-shelf__arrow--prev"
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        <div className="home-shelf__viewport" ref={emblaRef}>
          <MotionStagger preset="fast" className="home-shelf__track">
            {slides}
          </MotionStagger>
        </div>

        <button
          onClick={scrollNext}
          className="home-shelf__arrow home-shelf__arrow--next"
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
