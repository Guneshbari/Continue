'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { searchApi } from '@/lib/api/search'
import type { GameSummary } from '@continue/types'
import { SearchSuggestionsDropdown } from '@/components/game/SearchSuggestionsDropdown'

/**
 * Editorial Search Command Palette
 * Global, keyboard-activated (Ctrl+K or /) discover portal.
 * Restrained dark slate overlay style preserving cinematic calm.
 */
export function SearchCommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GameSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const [mounted, setMounted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const latestQueryRef = useRef('')

  // Sync mounted flag to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync/load recent searches from localStorage
  const loadRecentSearches = useCallback(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('recent_searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored) as string[])
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadRecentSearches()
      setQuery('')
      setSuggestions([])
      setHighlightedIndex(-1)
      // Standard page overflow lock when overlay is active
      document.body.style.overflow = 'hidden'

      // Delay focus slightly to allow visual render fade-in transition
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
      return () => {}
    }
  }, [isOpen, loadRecentSearches])

  // Global scope-governed key listener (Ctrl+K and / triggers)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.hasAttribute('contenteditable'))

      if (isTyping) return

      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '/') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Listen for custom trigger events (e.g. from header navbar button)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('search:open', handleOpen)
    return () => window.removeEventListener('search:open', handleOpen)
  }, [])

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Debounced search suggestions and race-condition sequence tracking
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    latestQueryRef.current = term
    setLoading(true)

    const timeoutId = setTimeout(async () => {
      try {
        const res = await searchApi.suggestions(term, 5)
        // Verify this matches the latest query initiated to cancel stale race requests
        if (latestQueryRef.current === term) {
          setSuggestions(res.data)
        }
      } catch {
        if (latestQueryRef.current === term) {
          setSuggestions([])
        }
      } finally {
        if (latestQueryRef.current === term) {
          setLoading(false)
        }
      }
    }, 200) // 200ms debounce interval

    return () => clearTimeout(timeoutId)
  }, [query])

  // Save selection deduplicated to localStorage history cache (limit 5)
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
    // Deduplicate and slice down to last 5 entries only
    list = [trimmed, ...list.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5)
    localStorage.setItem('recent_searches', JSON.stringify(list))
    loadRecentSearches()
  }

  const handleSelectSuggestion = (title: string, slug?: string) => {
    saveRecentSearch(title)
    setIsOpen(false)
    if (slug) {
      router.push(`/games/${slug}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(title)}`)
    }
  }

  // Keyboard navigation inside Suggestions listbox
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const listCount = query.trim().length === 0 ? recentSearches.length : suggestions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < listCount - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : listCount - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) {
        if (query.trim().length === 0) {
          const selected = recentSearches[highlightedIndex]
          if (selected) handleSelectSuggestion(selected)
        } else {
          const selected = suggestions[highlightedIndex]
          if (selected) handleSelectSuggestion(selected.title, selected.slug)
        }
      } else if (query.trim().length >= 2) {
        handleSelectSuggestion(query)
      }
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="search-palette-overlay" onClick={() => setIsOpen(false)}>
      {/* Search dialog panel container */}
      <div
        ref={containerRef}
        className="search-palette-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global search discovery"
      >
        <div className="search-palette-header">
          <Search className="search-palette-icon" size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            className="search-palette-input"
            placeholder="Type to search games or genres (Press Esc to close)…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlightedIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search inputs"
            aria-controls="palette-suggestions"
          />
          {loading && <Loader2 className="search-palette-spinner" size={16} aria-hidden="true" />}
          {query && !loading && (
            <button
              className="search-palette-clear"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear query text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div id="palette-suggestions" className="search-palette-results">
          <SearchSuggestionsDropdown
            isOpen={true}
            query={query}
            suggestions={suggestions}
            loading={loading}
            highlightedIndex={highlightedIndex}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
      </div>
    </div>
  )
}
