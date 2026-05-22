'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, X, Loader2 } from 'lucide-react'
import { searchApi, type SearchResultItem } from '@/lib/api/search'
import { FEATURED_GAMES, NEW_RELEASES } from '@/lib/data/seed'
import type { GameSummary } from '@continue/types'

// Seed fallback search — client-side filter over seed data
function searchSeed(q: string): SearchResultItem[] {
  const all: GameSummary[] = [...FEATURED_GAMES, ...NEW_RELEASES]
  const term = q.toLowerCase()
  const seen = new Set<string>()
  return all
    .filter((g) => {
      if (seen.has(g.id)) return false
      seen.add(g.id)
      return (
        g.title.toLowerCase().includes(term) ||
        g.genres.some((genre) => genre.name.toLowerCase().includes(term))
      )
    })
    .map((g) => ({ ...g, type: 'game' as const }))
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQ = useDebounce(query, 300)

  // Autofocus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchApi.search(q)
      // If API returns results use them; otherwise fall back to seed
      setResults(res.data.length > 0 ? res.data : searchSeed(q))
    } catch {
      setResults(searchSeed(q))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { doSearch(debouncedQ) }, [debouncedQ, doSearch])

  return (
    <main className="site-container search-page">
      <div className="search-page__hero">
        <h1 className="search-page__heading">Find your next game</h1>

        {/* Search input */}
        <div className="search-bar">
          <Search className="search-bar__icon" size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            className="search-bar__input"
            placeholder="Search games, genres, developers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search games"
            aria-controls="search-results"
            aria-busy={loading}
          />
          {query && (
            <button
              className="search-bar__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {loading && <Loader2 className="search-bar__spinner" size={18} aria-hidden="true" />}
        </div>
      </div>

      {/* Results */}
      <section id="search-results" aria-label="Search results" aria-live="polite">
        {!searched && (
          <p className="search-page__hint">Type to search — results appear instantly.</p>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="search-page__empty">
            <p className="search-page__empty-title">No results for "{query}"</p>
            <p className="search-page__empty-sub">Try a different title or developer name.</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="search-page__count">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <ul className="search-results-list">
              {results.map((game) => (
                <li key={game.id}>
                  <Link href={`/games/${game.slug}`} className="search-result-card">
                    {/* Cover */}
                    <div className="search-result-card__cover">
                      {game.coverUrl ? (
                        <Image
                          src={game.coverUrl}
                          alt={`${game.title} cover`}
                          fill
                          sizes="64px"
                          className="search-result-card__img"
                        />
                      ) : (
                        <div className="search-result-card__cover-placeholder" aria-hidden="true" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="search-result-card__info">
                      <span className="search-result-card__title">{game.title}</span>
                      <div className="search-result-card__meta">
                        {game.genres.length > 0 && (
                          <span className="search-result-card__genres">
                            {game.genres.slice(0, 2).map((g) => g.name).join(' · ')}
                          </span>
                        )}
                        {game.releaseDate && (
                          <span className="search-result-card__year">
                            {new Date(game.releaseDate).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {game.avgRating !== null && (
                      <div className="search-result-card__rating" aria-label={`Rated ${game.avgRating.toFixed(1)}`}>
                        <Star size={12} aria-hidden="true" />
                        <span>{game.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
