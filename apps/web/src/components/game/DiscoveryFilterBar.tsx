'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { GameFiltersResponse } from '@/lib/api/games'
import { X } from 'lucide-react'

interface DiscoveryFilterBarProps {
  filters: GameFiltersResponse
}

export function DiscoveryFilterBar({ filters }: DiscoveryFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentGenre = searchParams.get('genre') ?? ''
  const currentPlatform = searchParams.get('platform') ?? ''
  const currentYear = searchParams.get('year') ?? ''
  const currentMinRating = searchParams.get('rating') ?? ''

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('cursor') // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = currentGenre || currentPlatform || currentYear || currentMinRating

  return (
    <div className="discovery-filter-bar">
      <div className="discovery-filter-bar__selects">
        {/* Genre filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="genre-select" className="sr-only">Genre</label>
          <select
            id="genre-select"
            className="filter-select"
            value={currentGenre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value="">All Genres</option>
            {filters.genres.map((g) => (
              <option key={g.id} value={g.slug}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Platform filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="platform-select" className="sr-only">Platform</label>
          <select
            id="platform-select"
            className="filter-select"
            value={currentPlatform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            {filters.platforms.map((p) => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Year filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="year-select" className="sr-only">Release Year</label>
          <select
            id="year-select"
            className="filter-select"
            value={currentYear}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            {filters.years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        {/* Rating filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="rating-select" className="sr-only">Minimum Rating</label>
          <select
            id="rating-select"
            className="filter-select"
            value={currentMinRating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">Any Rating</option>
            {filters.ratings.map((r) => (
              <option key={r} value={String(r)}>{r}+ Stars</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            className="filter-clear-btn"
            onClick={handleClearFilters}
            aria-label="Clear all active filters"
          >
            <X size={14} style={{ marginRight: '0.25rem' }} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
