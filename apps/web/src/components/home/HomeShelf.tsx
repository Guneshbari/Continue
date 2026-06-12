'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { GameCardBase, GameCardBaseSkeleton } from '@/components/game/GameCardBase'
import { EditorialSectionHeader } from '@/components/ui/EditorialSectionHeader'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'
import { MotionFade, MotionStagger, MotionStaggerItem } from '@/components/motion'
import { getSkeletonKeys } from '@/lib/skeletonKeys'
import type { GameSummary } from '@continue/types'
import { cn } from '@/lib/utils'

type HomeShelfProps = Readonly<{
  id: string
  title: string
  description: string
  games: GameSummary[]
  viewAllHref?: string | undefined
  badge?: React.ReactNode | undefined
  loading?: boolean | undefined
  skeletonCount?: number | undefined
  /** Alternating visual rhythm styles */
  rhythm?: 'trending' | 'new_releases' | 'top_rated' | 'base' | undefined
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
  rhythm = 'base',
}: HomeShelfProps) {
  const headingId = `${id}-heading`

  // InView: defer rendering of slides to keep viewport lightweight
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  })

  // Embla carousel configuration: snap points are enabled (dragFree: false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Keyboard navigation on the viewport
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        emblaApi?.scrollPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        emblaApi?.scrollNext()
      }
    },
    [emblaApi]
  )

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
            <GameCardBaseSkeleton variant="homepage" />
          </li>
        ))
      : games.map((game, i) => (
          <MotionStaggerItem key={game.id} className="home-shelf__slide">
            {/* Focus listener to scroll card into view when focused */}
            <div onFocus={() => emblaApi?.scrollTo(i)}>
              <GameCardBase game={game} variant="homepage" priority={i < 3} />
            </div>
          </MotionStaggerItem>
        ))

  return (
    <section
      ref={inViewRef}
      className={cn('home-shelf', `home-shelf--${rhythm}`)}
      aria-labelledby={headingId}
    >
      <ResponsiveContainer className="py-12 md:py-16">
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

          <div
            className="home-shelf__viewport"
            ref={emblaRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="region"
            aria-roledescription="carousel"
            aria-label={title}
          >
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
      </ResponsiveContainer>
    </section>
  )
}
