'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameDetail } from '@continue/types'

type HeroProps = Readonly<{
  featured: GameDetail[]
}>

const AUTO_ROTATE_MS = 6000

export function Hero({ featured }: HeroProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    setActiveIdx(((idx % featured.length) + featured.length) % featured.length)
  }, [featured.length])

  const prev = useCallback(() => goTo(activeIdx - 1), [activeIdx, goTo])
  const next = useCallback(() => goTo(activeIdx + 1), [activeIdx, goTo])

  // Auto-rotation
  useEffect(() => {
    if (paused || featured.length <= 1) return
    intervalRef.current = setInterval(next, AUTO_ROTATE_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, next, featured.length])

  const active = featured[activeIdx]
  if (!active) return null

  return (
    <section
      className="hero"
      aria-label="Featured games"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div className="hero__bg" aria-hidden="true">
        {featured.map((game, i) => (
          <div
            key={game.id}
            className={cn('hero__bg-slide', i === activeIdx && 'hero__bg-slide--active')}
          >
            {game.bannerUrl && (
              <Image
                src={game.bannerUrl}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="hero__bg-img"
              />
            )}
          </div>
        ))}
        <div className="hero__bg-gradient" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__meta" aria-live="polite" aria-atomic="true">
          {/* Genres */}
          {active.genres?.length > 0 && (
            <ul className="hero__genres" aria-label="Genres">
              {active.genres.slice(0, 3).map((g) => (
                <li key={g.id} className="hero__genre-tag">{g.name}</li>
              ))}
            </ul>
          )}

          {/* Title */}
          <h1 className="hero__title">{active.title}</h1>

          {/* Description */}
          {active.description && (
            <p className="hero__description">
              {active.description.slice(0, 180)}
              {active.description.length > 180 ? '...' : ''}
            </p>
          )}

          {/* CTAs */}
          <div className="hero__ctas">
            <Link
              href="/games"
              className="hero__cta-primary"
            >
              <Play size={16} aria-hidden="true" fill="currentColor" />
              Discover Games
            </Link>
            <Link
              href={`/games/${active.slug}`}
              className="hero__cta-secondary"
            >
              Browse Reviews
            </Link>
          </div>
        </div>

        {/* Cover thumbnail */}
        {active.coverUrl && (
          <div className="hero__cover" aria-hidden="true">
            <Image
              src={active.coverUrl}
              alt={`${active.title} cover`}
              width={220}
              height={300}
              className="hero__cover-img"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {featured.length > 1 && (
        <div className="hero__controls">
          <button
            onClick={prev}
            className="hero__control-btn"
            aria-label="Previous featured game"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          {/* Dots */}
          <div className="hero__dots" role="tablist" aria-label="Featured game slides">
            {featured.map((game, i) => (
              <button
                key={game.id}
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Slide ${i + 1}: ${game.title}`}
                className={cn('hero__dot', i === activeIdx && 'hero__dot--active')}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="hero__control-btn"
            aria-label="Next featured game"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Progress bar */}
      {!paused && featured.length > 1 && (
        <div className="hero__progress" aria-hidden="true">
          <div
            key={activeIdx}
            className="hero__progress-bar"
            style={{ animationDuration: `${AUTO_ROTATE_MS}ms` }}
          />
        </div>
      )}
    </section>
  )
}
