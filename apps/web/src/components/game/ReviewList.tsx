'use client'

import { useState, useEffect } from 'react'
import { useInteractionPermissions } from '@/hooks/useInteractionPermissions'
import { useReviews } from '@/hooks/api/useReviews'
import { useDeleteReview } from '@/hooks/api/useDeleteReview'
import { ReviewCard } from './ReviewCard'
import { ReviewEditor } from './ReviewEditor'
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

interface ReviewListProps {
  gameId: string
  onReviewStateChanged?: (hasReviewed: boolean, userReview?: Review) => void
}

export function ReviewList({ gameId, onReviewStateChanged }: ReviewListProps) {
  const { isAuthenticated, userId, token } = useInteractionPermissions()
  const { data: response, isLoading: loading } = useReviews(gameId)
  const reviews = response?.data ?? []

  const deleteMutation = useDeleteReview(gameId, token)

  const [composerOpen, setComposerOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | undefined>(undefined)

  // Sync user review status to parent
  useEffect(() => {
    if (!isAuthenticated) {
      onReviewStateChanged?.(false)
      return
    }
    const myReview = reviews.find((r) => r.user.id === userId)
    onReviewStateChanged?.(!!myReview, myReview as any)
  }, [reviews, isAuthenticated, userId, onReviewStateChanged])

  const handleDelete = async (reviewId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteMutation.mutateAsync(reviewId)
    } catch {
      alert('Failed to delete review.')
    }
  }

  const handleEditClick = (review: Review) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setEditingReview(review)
    setComposerOpen(true)
  }

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setEditingReview(undefined)
    setComposerOpen(true)
  }

  const myReview = userId ? reviews.find((r) => r.user.id === userId) : undefined

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-section__header">
        <h2 id="reviews-title" className="reviews-section__title">
          User Reviews
        </h2>
        <button
          onClick={myReview ? () => handleEditClick(myReview as any) : handleWriteClick}
          className="btn btn--secondary btn--icon"
        >
          <MessageSquarePlus size={16} />
          <span>{myReview ? 'Edit Review' : 'Write Review'}</span>
        </button>
      </div>

      {loading ? (
        <div className="reviews-section__loading">
          <Loader2 size={24} className="reviews-section__spinner search-spin" style={{ animation: 'search-spin 0.8s linear infinite' }} />
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
              <ReviewCard
                review={r as any}
                onEdit={() => handleEditClick(r as any)}
                onDelete={() => handleDelete(r.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Shared composer modal */}
      <ReviewEditor
        gameId={gameId}
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        editingReview={editingReview}
      />
    </section>
  )
}
