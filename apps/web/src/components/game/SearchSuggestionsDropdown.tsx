'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Trash2 } from 'lucide-react'
import type { GameSummary } from '@continue/types'

interface SearchSuggestionsDropdownProps {
  isOpen: boolean
  query: string
  suggestions: GameSummary[]
  loading: boolean
  highlightedIndex: number
  onSelectSuggestion: (title: string, slug?: string) => void
}

export function SearchSuggestionsDropdown({
  isOpen,
  query,
  suggestions,
  loading,
  highlightedIndex,
  onSelectSuggestion,
}: SearchSuggestionsDropdownProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches on mount or when visibility changes
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('recent_searches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored) as string[])
        } catch {
          setRecentSearches([])
        }
      }
    }
  }, [isOpen])

  const handleClearRecents = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    localStorage.removeItem('recent_searches')
    setRecentSearches([])
  }

  if (!isOpen) return null

  const isQueryEmpty = query.trim().length === 0

  return (
    <div
      className="search-suggest-dropdown animate-fade-in"
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* ─── Recent Searches (when input is empty) ─── */}
      {isQueryEmpty && (
        <div className="search-recent-container">
          <div className="search-recent-header" style={{ padding: '0.25rem 0.75rem' }}>
            <h3 className="search-suggest-title" style={{ display: 'inline-block' }}>
              Recent Searches
            </h3>
            {recentSearches.length > 0 && (
              <button
                onClick={handleClearRecents}
                className="search-recent-clear"
                aria-label="Clear recent searches"
              >
                <Trash2
                  size={12}
                  style={{ display: 'inline', marginRight: '0.25rem', marginTop: '-2px' }}
                />
                Clear All
              </button>
            )}
          </div>

          {recentSearches.length === 0 ? (
            <p
              className="search-page__hint"
              style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}
            >
              No recent searches.
            </p>
          ) : (
            <ul className="search-suggest-list">
              {recentSearches.map((term, index) => {
                const highlighted = index === highlightedIndex
                return (
                  <li key={term} role="option" aria-selected={highlighted}>
                    <button
                      type="button"
                      onClick={() => onSelectSuggestion(term)}
                      className={`search-suggest-item ${
                        highlighted ? 'search-suggest-item--highlighted' : ''
                      }`}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                      }}
                    >
                      <Clock
                        size={14}
                        style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
                      />
                      <span className="search-suggest-item__title">{term}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* ─── Autocomplete Suggestions (when typing) ─── */}
      {!isQueryEmpty && (
        <div>
          <h3 className="search-suggest-title">Suggestions</h3>

          {loading && suggestions.length === 0 && (
            <p
              className="search-page__hint"
              style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}
            >
              Fetching suggestions…
            </p>
          )}

          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <p
              className="search-page__hint"
              style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}
            >
              No matching suggestions. Press enter to search.
            </p>
          )}

          {suggestions.length > 0 && (
            <ul className="search-suggest-list">
              {suggestions.map((game, index) => {
                const highlighted = index === highlightedIndex
                return (
                  <li key={game.id} role="option" aria-selected={highlighted}>
                    <Link
                      href={`/games/${game.slug}`}
                      onClick={() => onSelectSuggestion(game.title, game.slug)}
                      className={`search-suggest-item ${
                        highlighted ? 'search-suggest-item--highlighted' : ''
                      }`}
                    >
                      {/* Cover */}
                      <div className="search-suggest-item__cover">
                        {game.coverUrl ? (
                          <Image
                            src={game.coverUrl}
                            alt=""
                            fill
                            sizes="28px"
                            className="search-result-card__img"
                          />
                        ) : (
                          <div
                            className="search-result-card__cover-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="search-suggest-item__info">
                        <span className="search-suggest-item__title">{game.title}</span>
                        <span className="search-suggest-item__meta">
                          {game.releaseDate && `${new Date(game.releaseDate).getFullYear()} · `}
                          {game.genres
                            ?.slice(0, 1)
                            .map((g) => g.name)
                            .join('')}
                        </span>
                      </div>

                      {/* Rating */}
                      {game.avgRating !== null && (
                        <div
                          className="search-result-card__rating"
                          style={{ position: 'relative', top: 'auto', right: 'auto' }}
                        >
                          <Star size={10} fill="currentColor" />
                          <span>{game.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
