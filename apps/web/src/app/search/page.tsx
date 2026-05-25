'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Star, X, Loader2 } from 'lucide-react'
import { searchApi, type SearchResultItem } from '@/lib/api/search'
import { FEATURED_GAMES, NEW_RELEASES } from '@/lib/data/seed'
import type { GameSummary } from '@continue/types'
import { SearchSuggestionsDropdown } from '@/components/game/SearchSuggestionsDropdown'

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
        g.genres?.some((genre) => genre.name.toLowerCase().includes(term))
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
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQ = useDebounce(query, 300)

  // Autocomplete / suggest states
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<GameSummary[]>([])
  const [suggestsLoading, setSuggestsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync recent searches state on mount and update
  const loadRecentSearches = useCallback(() => {
    const stored = localStorage.getItem('recent_searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored) as string[])
      } catch {
        setRecentSearches([])
      }
    } else {
      setRecentSearches([])
    }
  }, [])

  useEffect(() => {
    loadRecentSearches()
  }, [dropdownOpen, loadRecentSearches])

  // Save successful searches to local recent cache
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed || trimmed.length < 2) return

    const stored = localStorage.getItem('recent_searches')
    let list: string[] = []
    if (stored) {
      try {
        list = JSON.parse(stored) as string[]
      } catch {
        list = []
      }
    }
    list = [trimmed, ...list.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5)
    localStorage.setItem('recent_searches', JSON.stringify(list))
    loadRecentSearches()
  }

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
      setResults(res.data.length > 0 ? res.data : searchSeed(q))
    } catch {
      setResults(searchSeed(q))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    doSearch(debouncedQ)
  }, [debouncedQ, doSearch])

  // Fetch dynamic suggestions debounced
  useEffect(() => {
    const fetchSuggests = async () => {
      if (debouncedQ.trim().length < 2) {
        setSuggestions([])
        return
      }
      setSuggestsLoading(true)
      try {
        const res = await searchApi.suggestions(debouncedQ, 5)
        setSuggestions(res.data)
      } catch {
        setSuggestions([])
      } finally {
        setSuggestsLoading(false)
      }
    }
    fetchSuggests()
  }, [debouncedQ])

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const itemsCount = query.trim().length === 0
      ? recentSearches.length
      : suggestions.length

    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setDropdownOpen(true)
        setHighlightedIndex(-1)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : itemsCount - 1))
    } else if (e.key === 'Escape') {
      setDropdownOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault()
        if (query.trim().length === 0) {
          const selected = recentSearches[highlightedIndex]
          if (selected) handleSelectSuggestion(selected)
        } else {
          const selected = suggestions[highlightedIndex]
          if (selected) handleSelectSuggestion(selected.title, selected.slug)
        }
      } else {
        // Normal text enter search
        saveRecentSearch(query)
        setDropdownOpen(false)
      }
    }
  }

  const handleSelectSuggestion = (title: string, slug?: string) => {
    saveRecentSearch(title)
    if (slug) {
      setDropdownOpen(false)
      router.push(`/games/${slug}`)
    } else {
      setQuery(title)
      setDropdownOpen(false)
      doSearch(title)
    }
  }

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <main className="site-container search-page" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="search-page__hero">
        <h1 className="search-page__heading">Find your next game</h1>

        {/* Search input container */}
        <div ref={containerRef} className="search-bar" style={{ position: 'relative', width: '100%' }}>
          <Search className="search-bar__icon" size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            className="search-bar__input"
            placeholder="Search games, genres, developers…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setDropdownOpen(true)
              setHighlightedIndex(-1)
            }}
            onFocus={() => {
              setDropdownOpen(true)
              setHighlightedIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search games"
            aria-controls="search-results"
            aria-busy={loading}
          />
          {query && (
            <button
              className="search-bar__clear"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
                setDropdownOpen(true)
                setHighlightedIndex(-1)
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {loading && <Loader2 className="search-bar__spinner" size={18} aria-hidden="true" />}

          {/* Autocomplete dropdown suggest popup */}
          <SearchSuggestionsDropdown
            isOpen={dropdownOpen}
            query={query}
            suggestions={suggestions}
            loading={suggestsLoading}
            highlightedIndex={highlightedIndex}
            onSelectSuggestion={handleSelectSuggestion}
          />
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
            <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
              {results.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/games/${game.slug}`}
                    onClick={() => saveRecentSearch(game.title)}
                    className="search-result-card"
                  >
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
                        {game.genres?.length > 0 && (
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
