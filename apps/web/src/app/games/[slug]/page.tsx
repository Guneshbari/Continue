import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { gamesApi } from '@/lib/api/games'
import { findSeedGame } from '@/lib/data/seed'
import { ReviewsSection } from '@/components/game/ReviewsSection'
import { RatingWidget } from '@/components/game/RatingWidget'
import { AddToListButton } from '@/components/lists/AddToListButton'
import { Star, Calendar, Building2, Tag } from 'lucide-react'
import type { GameDetail } from '@continue/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let game: GameDetail | undefined
  try {
    game = await gamesApi.get(slug)
  } catch {
    game = findSeedGame(slug)
  }
  if (!game) return { title: 'Game Not Found' }
  return {
    title: game.title,
    description: game.description ?? `Discover ${game.title} on Continue.`,
    openGraph: { images: game.bannerUrl ? [game.bannerUrl] : [] },
  }
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params

  let game: GameDetail | undefined
  try {
    game = await gamesApi.get(slug)
  } catch {
    game = findSeedGame(slug)
  }

  if (!game) {
    notFound()
  }
  const g = game

  const releaseYear = g.releaseDate
    ? new Date(g.releaseDate).getFullYear()
    : null

  return (
    <main>
      {/* Banner */}
      <div className="game-detail__banner">
        {g.bannerUrl ? (
          <Image
            src={g.bannerUrl}
            alt=""
            fill
            className="game-detail__banner-img"
            priority
          />
        ) : null}
        <div className="game-detail__banner-overlay" />
      </div>

      <div className="site-container">
        <div className="game-detail__layout">
          {/* Cover */}
          <aside className="game-detail__aside">
            <div className="game-detail__cover-wrap">
              {g.coverUrl ? (
                <Image
                  src={g.coverUrl}
                  alt={`${g.title} cover`}
                  width={220}
                  height={293}
                  className="game-detail__cover"
                />
              ) : (
                <div className="game-detail__cover-placeholder" />
              )}
            </div>

            {/* Rating widget — client component */}
            <RatingWidget gameId={g.id} avgRating={g.avgRating} ratingCount={g.ratingCount} />

            {/* Add to list — client component */}
            <AddToListButton gameId={g.id} gameTitle={g.title} />
          </aside>

          {/* Main info */}
          <div className="game-detail__main">
            {/* Genres */}
            {g.genres.length > 0 && (
              <ul className="game-detail__genres" aria-label="Genres">
                {g.genres.map((genre) => (
                  <li key={genre.id}>
                    <a href={`/games?genre=${genre.slug}`} className="hero__genre-tag">
                      {genre.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <h1 className="game-detail__title">{g.title}</h1>

            {/* Meta row */}
            <div className="game-detail__meta">
              {g.avgRating && (
                <span className="game-detail__meta-item">
                  <Star size={14} aria-hidden="true" />
                  {g.avgRating.toFixed(1)} ({g.ratingCount})
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

            {g.description && (
              <p className="game-detail__description">{g.description}</p>
            )}

            {/* Platforms */}
            {g.platforms.length > 0 && (
              <div className="game-detail__platforms">
                <span className="game-detail__label">Platforms</span>
                <div className="game-detail__tags">
                  {g.platforms.map((p) => (
                    <span key={p.id} className="game-detail__tag">{p.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {g.tags && g.tags.length > 0 && (
              <div className="game-detail__platforms">
                <span className="game-detail__label">
                  <Tag size={12} aria-hidden="true" /> Tags
                </span>
                <div className="game-detail__tags">
                  {g.tags.map((t) => (
                    <span key={t.id} className="game-detail__tag">{t.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection gameId={g.id} />
      </div>
    </main>
  )
}
