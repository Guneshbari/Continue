import { Suspense } from 'react'
import type { Metadata } from 'next'
import { gamesApi } from '@/lib/api/games'
import type { GamesListParams } from '@/lib/api/games'
import { GameCard, GameCardSkeleton } from '@/components/game/GameCard'
import { TRENDING_GAMES } from '@/lib/data/seed'
import type { GameSummary } from '@continue/types'

export const metadata: Metadata = {
  title: 'Discover Games',
  description: 'Browse and discover games by genre, platform, rating and more.',
}

interface PageProps {
  searchParams: Promise<{ sort?: string; genre?: string; platform?: string; q?: string; cursor?: string }>
}

async function GameGrid({ sort, genre, platform, q }: {
  sort?: string; genre?: string; platform?: string; q?: string
}) {
  let games: GameSummary[] = []
  try {
    const typedSort = SORT_OPTIONS.some((opt) => opt.value === sort)
      ? (sort as GamesListParams['sort'])
      : undefined
    const res = await gamesApi.list({
      ...(typedSort ? { sort: typedSort } : {}),
      ...(genre ? { genre } : {}),
      ...(platform ? { platform } : {}),
      ...(q ? { q } : {}),
      limit: 24,
    })
    games = res.data.length > 0 ? res.data : TRENDING_GAMES
  } catch {
    games = TRENDING_GAMES
  }

  return (
    <ul className="games-grid" role="list">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  )
}

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'new', label: 'New Releases' },
  { value: 'upcoming', label: 'Upcoming' },
] as const

export default async function GamesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sort = params.sort ?? 'trending'

  return (
    <main className="site-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="games-page__header">
        <h1 className="games-page__title">Discover Games</h1>

        {/* Sort tabs */}
        <nav className="games-page__sort" aria-label="Sort games">
          {SORT_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={`/games?sort=${opt.value}`}
              className={`games-page__sort-btn${sort === opt.value ? ' games-page__sort-btn--active' : ''}`}
            >
              {opt.label}
            </a>
          ))}
        </nav>
      </div>

      <Suspense fallback={
        <ul className="games-grid" role="list">
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i}>
              <GameCardSkeleton />
            </li>
          ))}
        </ul>
      }>
        <GameGrid
          sort={sort}
          {...(params.genre ? { genre: params.genre } : {})}
          {...(params.platform ? { platform: params.platform } : {})}
          {...(params.q ? { q: params.q } : {})}
        />
      </Suspense>
    </main>
  )
}
