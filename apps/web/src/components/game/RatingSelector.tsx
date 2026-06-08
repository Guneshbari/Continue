'use client'

import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { useInteractionPermissions } from '@/hooks/useInteractionPermissions'
import { useMyRating } from '@/hooks/api/useMyRating'
import { useRateGame } from '@/hooks/api/useRateGame'

const STAR_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

interface RatingSelectorProps {
  gameId: string
  slug: string
}

export function RatingSelector({ gameId, slug }: RatingSelectorProps) {
  const { guardAction, token, isAuthenticated } = useInteractionPermissions()
  const { data: myRating, isLoading: loading } = useMyRating(gameId, token)
  const { rateGame, isRating, deleteRating, isDeleting } = useRateGame(gameId, slug, token)

  const [hovered, setHovered] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const selected = myRating?.score ?? 0
  const saving = isRating || isDeleting

  const handleRate = async (score: number) => {
    setError(null)
    guardAction(async () => {
      try {
        await rateGame(score)
      } catch {
        setError('Failed to save rating.')
      }
    })
  }

  const handleClear = async () => {
    if (selected === 0) return
    setError(null)
    guardAction(async () => {
      try {
        await deleteRating()
      } catch {
        setError('Failed to remove rating.')
      }
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, val: number) => {
    if (e.key === 'ArrowRight' && val < 10) {
      const nextBtn = document.getElementById(`star-btn-${val + 1}`)
      nextBtn?.focus()
    } else if (e.key === 'ArrowLeft' && val > 1) {
      const prevBtn = document.getElementById(`star-btn-${val - 1}`)
      prevBtn?.focus()
    }
  }

  return (
    <div className="rating-selector">
      <div className="rating-selector__header">
        <span className="rating-selector__label">Your Rating</span>
        {selected > 0 && !saving && (
          <button
            onClick={handleClear}
            className="rating-selector__clear-btn"
            aria-label="Remove rating"
            disabled={saving}
          >
            <X size={12} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="rating-selector__loading">
          <Loader2 size={16} className="rating-selector__spinner search-spin" style={{ animation: 'search-spin 0.8s linear infinite' }} />
          <span>Fetching rating...</span>
        </div>
      ) : (
        <div className="rating-selector__body">
          <div
            className="rating-selector__stars"
            role="radiogroup"
            aria-label="Rate 1 to 10 stars"
          >
            {STAR_VALUES.map((n) => {
              const active = (hovered || selected) >= n
              return (
                <button
                  key={n}
                  id={`star-btn-${n}`}
                  type="button"
                  role="radio"
                  aria-checked={selected === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  className={`rating-selector__star-btn ${active ? 'rating-selector__star-btn--lit' : ''}`}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleRate(n)}
                  onKeyDown={(e) => handleKeyDown(e, n)}
                  disabled={saving}
                >
                  <Star size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <div className="rating-selector__display">
            {saving ? (
              <span className="rating-selector__saving">Saving...</span>
            ) : selected > 0 ? (
              <span className="rating-selector__value">{selected} / 10</span>
            ) : (
              <span className="rating-selector__hint">Not rated yet</span>
            )}
          </div>
        </div>
      )}

      {error && <span className="rating-selector__error" role="alert">{error}</span>}
      {!isAuthenticated && (
        <span className="rating-selector__guest-hint" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.25rem', fontWeight: 500 }}>
          Click a star to sign in and rate
        </span>
      )}
    </div>
  )
}
