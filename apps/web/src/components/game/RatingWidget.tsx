'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { ratingsApi } from '@/lib/api/interactions'

const STAR_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

interface Props {
  gameId: string
  avgRating: number | null
  ratingCount: number
}

export function RatingWidget({ gameId, avgRating, ratingCount }: Props) {
  const { user, accessToken } = useAuth()
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleRate = async (score: number) => {
    if (!accessToken) return
    setSaving(true)
    try {
      await ratingsApi.upsert(gameId, score, accessToken)
      setSelected(score)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rating-widget">
      {/* Community avg */}
      <div className="rating-widget__avg">
        <Star size={16} className="rating-widget__star-icon" aria-hidden="true" />
        <span className="rating-widget__score">
          {avgRating ? avgRating.toFixed(1) : '-'}
        </span>
        <span className="rating-widget__count">
          {ratingCount > 0 ? `${ratingCount} ratings` : 'No ratings yet'}
        </span>
      </div>

      {/* User rating */}
      {user ? (
        <div className="rating-widget__picker" aria-label="Rate this game">
          <p className="rating-widget__label">Your rating</p>
          <div className="rating-widget__stars" role="group">
            {STAR_VALUES.map((n) => (
              <button
                key={n}
                disabled={saving}
                className={`rating-widget__star-btn${(hovered || selected) >= n ? ' rating-widget__star-btn--lit' : ''}`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => handleRate(n)}
                aria-label={`Rate ${n} out of 10`}
              >
                <Star size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
          {selected > 0 && (
            <p className="rating-widget__selected">{selected}/10</p>
          )}
        </div>
      ) : (
        <a href="/login" className="rating-widget__login-cta">
          Sign in to rate
        </a>
      )}
    </div>
  )
}
