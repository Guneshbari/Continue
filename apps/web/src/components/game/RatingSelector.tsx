'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { ratingsApi } from '@/lib/api/interactions'

const STAR_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

interface RatingSelectorProps {
  gameId: string
  onRatingChanged?: (newAvgRating: number, newCount: number) => void
}

export function RatingSelector({ gameId, onRatingChanged }: RatingSelectorProps) {
  const { user, token } = useAuth()
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user rating if logged in
  useEffect(() => {
    if (!token) return
    setLoading(true)
    ratingsApi
      .myRating(gameId, token)
      .then((res) => {
        if (res) setSelected(res.score)
      })
      .catch(() => {
        // Silent catch for loaded states
      })
      .finally(() => {
        setLoading(false)
      })
  }, [gameId, token])

  const handleRate = async (score: number) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (!token) return
    const prevSelected = selected
    setSaving(true)
    setError(null)
    
    // Optimistic Update
    setSelected(score)

    try {
      const res = await ratingsApi.upsert(gameId, score, token)
      setSelected(res.score)
    } catch {
      // Rollback on error
      setSelected(prevSelected)
      setError('Failed to save rating.')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (!token || selected === 0) return
    const prevSelected = selected
    setSaving(true)
    setError(null)

    // Optimistic Update
    setSelected(0)

    try {
      await ratingsApi.remove(gameId, token)
    } catch {
      // Rollback on error
      setSelected(prevSelected)
      setError('Failed to remove rating.')
    } finally {
      setSaving(false)
    }
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
          <Loader2 size={16} className="rating-selector__spinner" />
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
      {!user && (
        <span className="rating-selector__guest-hint" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.25rem', fontWeight: 500 }}>
          Click a star to sign in and rate
        </span>
      )}
    </div>
  )
}
