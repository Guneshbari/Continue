'use client'

import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { GameCard } from './GameCard'
import type { GameSummary } from '@continue/types'

interface ResponsiveGameGridProps {
  games: GameSummary[]
}

export function ResponsiveGameGrid({ games }: ResponsiveGameGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className="responsive-game-grid-container">
      {/* Switcher controls */}
      <div className="grid-switcher-controls">
        <button
          onClick={() => setView('grid')}
          className={`grid-switcher-btn ${view === 'grid' ? 'grid-switcher-btn--active' : ''}`}
          aria-label="Grid view"
          aria-pressed={view === 'grid'}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => setView('list')}
          className={`grid-switcher-btn ${view === 'list' ? 'grid-switcher-btn--active' : ''}`}
          aria-label="List view"
          aria-pressed={view === 'list'}
        >
          <List size={16} />
        </button>
      </div>

      {games.length === 0 ? (
        <div className="games-grid-empty">
          <p className="games-grid-empty__title">No games found</p>
          <p className="games-grid-empty__sub">Try adjusting your active filters.</p>
        </div>
      ) : (
        <ul className={view === 'grid' ? 'games-grid' : 'games-list-view'}>
          {games.map((game) => (
            <li key={game.id} style={{ listStyle: 'none' }}>
              <GameCard game={game} variant={view === 'grid' ? 'discovery' : 'list'} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
