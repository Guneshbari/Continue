import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { gamesApi } from '@/lib/api/games-api'
import { findSeedGame } from '@/test-fixtures/seed'
import { GameDetailClient } from '@/components/game/GameDetailClient'
import type { GameDetail } from '@/types/api'

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description ?? `Rate and review ${game.title} on Continue.`,
    ...(game.coverUrl && { image: game.coverUrl }),
    ...(game.releaseDate && { datePublished: game.releaseDate }),
    ...(game.developer && { author: { '@type': 'Organization', name: game.developer } }),
    ...(game.publisher && { publisher: { '@type': 'Organization', name: game.publisher } }),
    ...(game.avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: game.avgRating,
        bestRating: 10,
        worstRating: 1,
        ratingCount: game.ratingCount || 1,
      },
    }),
  }

  return (
    <main className="game-detail-page-wrapper">
      {/* Schema.org VideoGame JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GameDetailClient slug={slug} />
    </main>
  )
}
