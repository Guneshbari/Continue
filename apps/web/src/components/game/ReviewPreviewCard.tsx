'use client'

import { useState } from 'react'
import { Edit2, Trash2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

interface ReviewPreviewCardProps {
  review: {
    id: string
    title: string | null
    body: string
    status: 'PUBLISHED' | 'DRAFT'
    isSpoiler: boolean
    createdAt: string
    user: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
  }
  onEdit: () => void
  onDelete: () => void
}

export function ReviewPreviewCard({ review, onEdit, onDelete }: ReviewPreviewCardProps) {
  const { user } = useAuth()
  const [revealed, setRevealed] = useState(false)

  const isOwner = user?.id === review.user.id
  const isSpoiler = review.isSpoiler

  const displayTitle = review.title ?? ''
  const displayBody = review.body

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="review-card" aria-label={`Review by ${review.user.displayName ?? review.user.username}`}>
      <div className="review-card__header">
        <div className="review-card__user">
          {review.user.avatarUrl ? (
            <img
              src={review.user.avatarUrl}
              alt=""
              className="review-card__avatar"
            />
          ) : (
            <div className="review-card__avatar-placeholder">
              {(review.user.displayName ?? review.user.username).charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="review-card__user-info">
            <span className="review-card__author">
              {review.user.displayName ?? review.user.username}
            </span>
            <time className="review-card__date" dateTime={review.createdAt}>
              {formattedDate}
            </time>
          </div>
        </div>

        {/* Draft flag */}
        {review.status === 'DRAFT' && (
          <span className="review-card__draft-badge">Draft</span>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="review-card__actions">
            <button
              onClick={onEdit}
              className="review-card__action-btn"
              aria-label="Edit review"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="review-card__action-btn review-card__action-btn--delete"
              aria-label="Delete review"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content wrapper with optional spoiler blur */}
      <div className="review-card__content-wrap">
        {isSpoiler && !revealed ? (
          <div className="review-card__spoiler-gate">
            <div className="review-card__spoiler-blur" aria-hidden="true">
              {displayTitle && <h3 className="review-card__title">{displayTitle}</h3>}
              <p className="review-card__body">{displayBody}</p>
            </div>
            
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="review-card__spoiler-btn"
            >
              <ShieldAlert size={16} />
              <span>Review contains spoilers. Click to reveal.</span>
            </button>
          </div>
        ) : (
          <div className="review-card__content">
            {displayTitle && <h3 className="review-card__title">{displayTitle}</h3>}
            <p className="review-card__body">{displayBody}</p>
          </div>
        )}
      </div>
    </article>
  )
}
