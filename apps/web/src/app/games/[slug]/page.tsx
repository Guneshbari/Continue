import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { gamesApi } from '@/lib/api/games'
import { findSeedGame } from '@/lib/data/seed'
import { GameMetadataGrid } from '@/components/game/GameMetadataGrid'
import { GameDetailInteractive } from '@/components/game/GameDetailInteractive'
import { CompactGameCard } from '@/components/game/CompactGameCard'
import { Star, Calendar, Building2, Eye, Layout } from 'lucide-react'
import type { GameDetail, GameSummary } from '@continue/types'

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
    title: `${game.title} — Reviews and Collections | Continue`,
    description: game.description ?? `Discover, rate and review ${game.title} on Continue.`,
    openGraph: { images: game.bannerUrl ? [game.bannerUrl] : [] },
  }
}

// 4 high-end mockup games for the related section
const SUGGESTED_GAMES: GameSummary[] = [
  {
    id: '1',
    slug: 'elden-ring',
    title: 'Elden Ring',
    coverUrl: 'https://images.unsplash.com/photo-1655821888788-6107699e173b?w=400&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&q=80',
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

  // Filter out the current game from suggestions
  const relatedSuggestions = SUGGESTED_GAMES.filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <main className="game-detail-page-wrapper">
      {/* Cinematic landscape hero banner */}
      <div className="game-detail__banner" aria-hidden="true">
        {g.bannerUrl ? (
          <Image
            src={g.bannerUrl}
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

            {/* Bento screenshots grid placeholder */}
            <section className="game-detail__gallery" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="gallery-section-title">
                <Layout size={16} aria-hidden="true" />
                Visual Atmosphere
              </h2>
              <div className="bento-gallery">
                <div className="bento-gallery__slot bento-gallery__slot--main">
                  <div className="bento-placeholder-bg" />
                  <span className="bento-gallery__label">Cinematic Gameplay</span>
                </div>
                <div className="bento-gallery__slot">
                  <div className="bento-placeholder-bg" />
                  <span className="bento-gallery__label">Environmental Art</span>
                </div>
                <div className="bento-gallery__slot">
                  <div className="bento-placeholder-bg" />
                  <span className="bento-gallery__label">Combat Mechanics</span>
                </div>
              </div>
            </section>

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
    </main>
  )
}
