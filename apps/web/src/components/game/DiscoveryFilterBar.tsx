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
  const currentMaxRating = searchParams.get('maxRating') ?? ''
  const currentMinReviewCount = searchParams.get('minReviewCount') ?? ''

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('cursor') // reset pagination on filter change

    // Enforce crawler-safe alphabetical parameter ordering
    params.sort()

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push(pathname)
  }

  const hasFilters =
    currentGenre ||
    currentPlatform ||
    currentYear ||
    currentMinRating ||
    currentMaxRating ||
    currentMinReviewCount

  return (
    <div className="discovery-filter-bar">
      <div className="discovery-filter-bar__selects">
        {/* Genre filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="genre-select" className="sr-only">
            Genre
          </label>
          <select
            id="genre-select"
            className="filter-select"
            value={currentGenre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value="">All Genres</option>
            {filters.genres.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="platform-select" className="sr-only">
            Platform
          </label>
          <select
            id="platform-select"
            className="filter-select"
            value={currentPlatform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            {filters.platforms.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="year-select" className="sr-only">
            Release Year
          </label>
          <select
            id="year-select"
            className="filter-select"
            value={currentYear}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            {filters.years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Rating filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="rating-select" className="sr-only">
            Minimum Rating
          </label>
          <select
            id="rating-select"
            className="filter-select"
            value={currentMinRating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">Min Rating</option>
            {filters.ratings.map((r) => (
              <option key={r} value={String(r)}>
                {r}+ Stars
              </option>
            ))}
          </select>
        </div>

        {/* Max Rating filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="max-rating-select" className="sr-only">
            Maximum Rating
          </label>
          <select
            id="max-rating-select"
            className="filter-select"
            value={currentMaxRating}
            onChange={(e) => handleFilterChange('maxRating', e.target.value)}
          >
            <option value="">Max Rating</option>
            {filters.ratings.map((r) => (
              <option key={r} value={String(r)}>
                Up to {r} Stars
              </option>
            ))}
          </select>
        </div>

        {/* Review Count filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="reviews-select" className="sr-only">
            Minimum Review Count
          </label>
          <select
            id="reviews-select"
            className="filter-select"
            value={currentMinReviewCount}
            onChange={(e) => handleFilterChange('minReviewCount', e.target.value)}
          >
            <option value="">Review Count</option>
            <option value="5">5+ Reviews</option>
            <option value="10">10+ Reviews</option>
            <option value="25">25+ Reviews</option>
            <option value="50">50+ Reviews</option>
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
