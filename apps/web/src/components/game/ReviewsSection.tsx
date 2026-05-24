'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { reviewsApi } from '@/lib/api/interactions'
import { ReviewPreviewCard } from './ReviewPreviewCard'
import { ReviewComposer } from './ReviewComposer'
import { Loader2, MessageSquarePlus } from 'lucide-react'

interface Review {
  id: string
  title: string | null
  body: string
  status: 'PUBLISHED' | 'DRAFT'
  isSpoiler: boolean
  createdAt: string
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
}

interface ReviewsSectionProps {
  gameId: string
  onReviewStateChanged?: (hasReviewed: boolean, userReview?: Review) => void
}

export function ReviewsSection({ gameId, onReviewStateChanged }: ReviewsSectionProps) {
  const { user, token } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | undefined>(undefined)

  // Fetch reviews on mount
  useEffect(() => {
    setLoading(true)
    reviewsApi
      .list<Review>(gameId, 30)
      .then((res) => {
        setReviews(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [gameId])

  // Sync edits from sidebar composer
  useEffect(() => {
    const handler = (e: Event) => {
      const savedReview = (e as CustomEvent).detail
      handleCreateOrEditSuccess(savedReview)
    }
    window.addEventListener('review-saved', handler)
    return () => window.removeEventListener('review-saved', handler)
  }, [])

  // Sync user review status to parent
  useEffect(() => {
    if (!user) {
      onReviewStateChanged?.(false)
      return
    }
    const myReview = reviews.find((r) => r.user.id === user.id)
    onReviewStateChanged?.(!!myReview, myReview)
  }, [reviews, user, onReviewStateChanged])

  const handleCreateOrEditSuccess = (savedReview: Review) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.id === savedReview.id)
      if (idx !== -1) {
        // Update existing review in feed
        const updated = [...prev]
        updated[idx] = savedReview
        return updated
      }
      // Prepend new review
      return [savedReview, ...prev]
    })
  }

  const handleDelete = async (reviewId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewsApi.remove(gameId, reviewId, token)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (err) {
      alert('Failed to delete review.')
    }
  }

  const handleEditClick = (review: Review) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setEditingReview(review)
    setComposerOpen(true)
  }

  const handleWriteClick = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setEditingReview(undefined)
    setComposerOpen(true)
  }

  const myReview = user ? reviews.find((r) => r.user.id === user.id) : undefined

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-section__header">
        <h2 id="reviews-title" className="reviews-section__title">
          User Reviews
        </h2>
        <button
          onClick={myReview ? () => handleEditClick(myReview) : handleWriteClick}
          className="btn btn--secondary btn--icon"
        >
          <MessageSquarePlus size={16} />
          <span>{myReview ? 'Edit Review' : 'Write Review'}</span>
        </button>
      </div>

      {loading ? (
        <div className="reviews-section__loading">
          <Loader2 size={24} className="reviews-section__spinner" />
          <span>Fetching reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-section__empty-card">
          <p>No reviews posted yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <ul className="reviews-list">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewPreviewCard
                review={r}
                onEdit={() => handleEditClick(r)}
                onDelete={() => handleDelete(r.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Shared composer modal */}
      <ReviewComposer
        gameId={gameId}
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={handleCreateOrEditSuccess}
        editingReview={editingReview}
      />
    </section>
  )
}
