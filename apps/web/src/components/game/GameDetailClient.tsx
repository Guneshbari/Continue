'use client'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useGame } from '@/hooks/api/useGame'
import { GameMetadataGrid } from '@/components/game/GameMetadataGrid'
import { GameDetailInteractive } from '@/components/game/GameDetailInteractive'
import { CompactGameCard } from '@/components/game/CompactGameCard'
import { Star, Calendar, Building2, Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/LoadingSkeletonSystem'
import { GlobalErrorState } from '@/components/ui/GlobalErrorState'
import type { GameSummary } from '@/types/api'

interface GameDetailClientProps {
  slug: string
}

// 4 high-end mockup games for the related section
const SUGGESTED_GAMES: GameSummary[] = [
  {
    id: '1',
    slug: 'elden-ring',
    title: 'Elden Ring',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
    avgRating: 9.6,
    ratingCount: 140,
    releaseDate: '2022-02-25',
    genres: [{ id: 'rpg', name: 'RPG', slug: 'rpg' }],
    platforms: [],
  },
  {
    id: '2',
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    avgRating: 9.7,
    ratingCount: 88,
    releaseDate: '2023-08-03',
    genres: [{ id: 'rpg', name: 'RPG', slug: 'rpg' }],
    platforms: [],
  },
  {
    id: '3',
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    avgRating: 8.4,
    ratingCount: 65,
    releaseDate: '2020-12-10',
    genres: [{ id: 'rpg', name: 'RPG', slug: 'rpg' }],
    platforms: [],
  },
  {
    id: '4',
    slug: 'hades',
    title: 'Hades',
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    avgRating: 9.3,
    ratingCount: 52,
    releaseDate: '2020-09-17',
    genres: [{ id: 'action', name: 'Action', slug: 'action' }],
    platforms: [],
  },
]

export function GameDetailClient({ slug }: GameDetailClientProps) {
  const { data: game, isLoading, isError, refetch } = useGame(slug)

  if (isLoading) {
    return (
      <div className="game-detail-page-wrapper">
        {/* Cinematic landscape hero banner skeleton */}
        <div className="game-detail__banner" aria-hidden="true">
          <div className="game-detail__banner-fallback skeleton-pulse" />
        </div>

        <div className="site-container" style={{ opacity: 0.8 }}>
          <div className="game-detail__layout">
            {/* Left aspect cover skeleton */}
            <div className="game-detail__sidebar-group">
              <div className="game-detail__cover-wrap">
                <Skeleton className="game-detail__cover-placeholder" style={{ aspectRatio: '3/4', width: '220px', borderRadius: 'var(--radius-lg)' }} />
              </div>
              <div className="interactive-card-skeleton" style={{ height: '140px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem' }} />
            </div>

            {/* Right aspect details skeleton */}
            <div className="game-detail__main">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Skeleton className="skeleton-line" style={{ width: '80px', height: '1.5rem', borderRadius: 'var(--radius-sm)' }} />
                <Skeleton className="skeleton-line" style={{ width: '100px', height: '1.5rem', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <Skeleton className="skeleton-line" style={{ width: '60%', height: '3rem', marginBottom: '1.5rem' }} />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <Skeleton className="skeleton-line" style={{ width: '60px', height: '1rem' }} />
                <Skeleton className="skeleton-line" style={{ width: '80px', height: '1rem' }} />
                <Skeleton className="skeleton-line" style={{ width: '120px', height: '1rem' }} />
              </div>
              <div className="game-detail__description-box">
                <Skeleton className="skeleton-line" style={{ width: '100%', height: '1rem', marginBottom: '0.75rem' }} />
                <Skeleton className="skeleton-line" style={{ width: '95%', height: '1rem', marginBottom: '0.75rem' }} />
                <Skeleton className="skeleton-line" style={{ width: '80%', height: '1rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="site-container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <GlobalErrorState title="Failed to load game" onRetry={refetch} />
      </div>
    )
  }

  if (!game) {
    notFound()
  }

  const g = game
  const releaseYear = g.releaseDate
    ? new Date(g.releaseDate).getFullYear()
    : null

  // Filter out the current game from suggestions
  const relatedSuggestions = SUGGESTED_GAMES.filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <div className="game-detail-page-wrapper">
      {/* Cinematic landscape hero banner */}
      <div className="game-detail__banner" aria-hidden="true">
        {g.coverUrl || g.bannerUrl ? (
          <Image
            src={g.bannerUrl || g.coverUrl || ''}
            alt=""
            fill
            sizes="100vw"
            className="game-detail__banner-img"
            priority
          />
        ) : (
          <div className="game-detail__banner-fallback" />
        )}
        <div className="game-detail__banner-overlay" />
      </div>

      <div className="site-container">
        {/* Upper split: cover + metadata descriptions */}
        <div className="game-detail__layout">
          {/* Left aspect: cover & interactive controls sidebar */}
          <div className="game-detail__sidebar-group">
            <div className="game-detail__cover-wrap" aria-label={`${g.title} cover`}>
              {g.coverUrl ? (
                <Image
                  src={g.coverUrl}
                  alt=""
                  width={220}
                  height={293}
                  className="game-detail__cover"
                  priority
                />
              ) : (
                <div className="game-detail__cover-placeholder" />
              )}
            </div>

            {/* Interactive sidebar card (Rating picker, lists buttons) */}
            <GameDetailInteractive
              gameId={g.id}
              slug={slug}
              gameTitle={g.title}
              initialAvgRating={g.avgRating}
              initialRatingCount={g.ratingCount}
            />
          </div>

          {/* Right aspect: broad typography editorial headers & grids */}
          <div className="game-detail__main">
            {/* Genres list */}
            {g.genres && g.genres.length > 0 && (
              <ul className="game-detail__genres" aria-label="Genres">
                {g.genres.map((genre) => (
                  <li key={genre.id}>
                    <span className="hero__genre-tag">{genre.name}</span>
                  </li>
                ))}
              </ul>
            )}

            <h1 className="game-detail__title">{g.title}</h1>

            {/* Micro stats banner */}
            <div className="game-detail__meta">
              {g.avgRating && (
                <span className="game-detail__meta-item" aria-label={`Rating score: ${g.avgRating.toFixed(1)} out of 10`}>
                  <Star size={14} fill="currentColor" aria-hidden="true" />
                  {g.avgRating.toFixed(1)}
                </span>
              )}
              {releaseYear && (
                <span className="game-detail__meta-item">
                  <Calendar size={14} aria-hidden="true" />
                  {releaseYear}
                </span>
              )}
              {g.developer && (
                <span className="game-detail__meta-item">
                  <Building2 size={14} aria-hidden="true" />
                  {g.developer}
                </span>
              )}
            </div>

            {/* Detailed editorial review body description */}
            {g.description && (
              <div className="game-detail__description-box">
                <p className="game-detail__description">{g.description}</p>
              </div>
            )}

            {/* Detailed metadata specs grid */}
            <div className="game-detail__specs-section">
              <GameMetadataGrid game={g} />
            </div>

            {/* Related games slider */}
            {relatedSuggestions.length > 0 && (
              <section className="game-detail__related" aria-labelledby="related-heading">
                <h2 id="related-heading" className="gallery-section-title">
                  <Eye size={16} aria-hidden="true" />
                  Explore Similar Journeys
                </h2>
                <div className="related-slider">
                  {relatedSuggestions.map((game) => (
                    <CompactGameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
