'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Star, X, Loader2 } from 'lucide-react'
import { useSearch } from '@/hooks/api/useSearch'
import { useSearchSuggestions } from '@/hooks/api/useSearchSuggestions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SearchSuggestionsDropdown } from '@/components/game/SearchSuggestionsDropdown'
import { SearchEmptyState } from '@/components/game/SearchEmptyState'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'
import { GlobalErrorState } from '@/components/ui/GlobalErrorState'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQ = useDebouncedValue(query, 300)

  // Autocomplete / suggest states
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Fetch results and suggestions using hooks
  const {
    data: searchResponse,
    isLoading: loading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearch(debouncedQ, 20)

  const { data: suggestionsResponse, isLoading: suggestsLoading } = useSearchSuggestions(
    debouncedQ,
    5,
  )

  const results = searchResponse?.data ?? []
  const suggestions = suggestionsResponse?.data ?? []
  const searched = debouncedQ.trim().length >= 2

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

  const handleSelectSuggestion = (title: string, slug?: string) => {
    saveRecentSearch(title)
    if (slug) {
      setDropdownOpen(false)
      router.push(`/games/${slug}`)
    } else {
      setQuery(title)
      setDropdownOpen(false)
    }
  }

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const itemsCount = query.trim().length === 0 ? recentSearches.length : suggestions.length

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
    <main
      className="site-container search-page"
      style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
    >
      <div className="search-page__hero">
        <h1 className="search-page__heading">Find your next game</h1>

        {/* Search input container */}
        <div
          ref={containerRef}
          className="search-bar"
          style={{ position: 'relative', width: '100%' }}
        >
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

        {isSearchError && searched && (
          <div style={{ marginTop: '2rem' }}>
            <GlobalErrorState onRetry={refetchSearch} />
          </div>
        )}

        {searched && !loading && !isSearchError && results.length === 0 && (
          <SearchEmptyState
            query={query}
            onClear={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
          />
        )}

        {searched && !isSearchError && results.length > 0 && (
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
                      <MetadataBadgeGroup className="mt-1">
                        {game.genres?.slice(0, 2).map((g) => (
                          <MetadataBadge key={g.id} variant="accent">
                            {g.name}
                          </MetadataBadge>
                        ))}
                        {game.releaseDate && (
                          <MetadataBadge variant="muted">
                            {new Date(game.releaseDate).getFullYear()}
                          </MetadataBadge>
                        )}
                      </MetadataBadgeGroup>
                    </div>

                    {/* Rating */}
                    {game.avgRating !== null && (
                      <div className="search-result-card__rating">
                        <MetadataBadge
                          variant="warning"
                          icon={<Star size={10} fill="currentColor" />}
                        >
                          {game.avgRating.toFixed(1)}
                        </MetadataBadge>
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
