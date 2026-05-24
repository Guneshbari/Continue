'use client'

import { useState } from 'react'
import { Star, CheckCircle, Flame, Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { RatingSelector } from './RatingSelector'
import { AddToListButton } from '../lists/AddToListButton'

interface GameActionPanelProps {
  gameId: string
  gameTitle: string
  avgRating: number | null
  ratingCount: number
  onWriteReview: () => void
  hasReviewed: boolean
}

type PlayStatus = 'backlog' | 'playing' | 'played' | 'none'

export function GameActionPanel({
  gameId,
  gameTitle,
  avgRating,
  ratingCount,
  onWriteReview,
  hasReviewed,
}: GameActionPanelProps) {
  const { user } = useAuth()
  const [playStatus, setPlayStatus] = useState<PlayStatus>('none')
  const [isFavorite, setIsFavorite] = useState(false)

  const formattedAvg = avgRating ? avgRating.toFixed(1) : '—'

  const handleStatusChange = (status: PlayStatus) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setPlayStatus((prev) => (prev === status ? 'none' : status))
  }

  const handleFavoriteClick = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setIsFavorite((f) => !f)
  }

  const handleReviewClick = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    onWriteReview()
  }

  return (
    <div className="game-action-panel">
      {/* Primary Community score card */}
      <div className="action-panel__score-card">
        <div className="score-card__circle">
          <Star size={24} fill="currentColor" className="score-card__star-icon" />
          <span className="score-card__value">{formattedAvg}</span>
        </div>
        <div className="score-card__stats">
          <span className="score-card__count">
            {ratingCount > 0 ? `${ratingCount} ratings` : 'No ratings yet'}
          </span>
          <span className="score-card__tagline">Community Average</span>
        </div>
      </div>

      {/* Interactive Controls (Unconditional) */}
      <div className="action-panel__content">
        {/* Rating picker */}
        <div className="action-panel__section">
          <RatingSelector gameId={gameId} />
        </div>

        {/* List adder */}
        <div className="action-panel__section">
          <span className="metadata-label metadata-label--panel">Collections</span>
          <AddToListButton gameId={gameId} gameTitle={gameTitle} />
        </div>

        {/* Play status toggles */}
        <div className="action-panel__section">
          <span className="metadata-label metadata-label--panel">Your Catalog</span>
          <div className="catalog-toggles">
            <button
              type="button"
              onClick={() => handleStatusChange('played')}
              className={`catalog-btn ${playStatus === 'played' ? 'catalog-btn--active' : ''}`}
              title="Mark Played"
            >
              <CheckCircle size={16} />
              <span>Played</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('playing')}
              className={`catalog-btn ${playStatus === 'playing' ? 'catalog-btn--active' : ''}`}
              title="Currently Playing"
            >
              <Flame size={16} />
              <span>Playing</span>
            </button>
          </div>
        </div>

        {/* Favoriting and Review trigger */}
        <div className="action-panel__footer-actions">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
            aria-label="Add to favorites"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            onClick={handleReviewClick}
            className="btn btn--primary btn--full review-trigger-btn"
          >
            {hasReviewed ? 'Edit your review' : 'Write a review'}
          </button>
        </div>

        {/* Non-intrusive Guest Banner Prompt */}
        {!user && (
          <div className="action-panel__guest-prompt" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Sign in to rate, review and build lists.
            </span>
            <a href="/login" className="btn btn--secondary btn--full btn--small" style={{ fontSize: '0.78rem', padding: '0.35rem' }}>
              Sign In / Register
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
