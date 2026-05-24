'use client'

import { useState } from 'react'
import { GameActionPanel } from './GameActionPanel'
import { ReviewsSection } from './ReviewsSection'
import { ReviewComposer } from './ReviewComposer'

interface Review {
  id: string
  title: string | null
  body: string
  status: 'PUBLISHED' | 'DRAFT'
  createdAt: string
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
}

interface GameDetailInteractiveProps {
  gameId: string
  gameTitle: string
  initialAvgRating: number | null
  initialRatingCount: number
}

export function GameDetailInteractive({
  gameId,
  gameTitle,
  initialAvgRating,
  initialRatingCount,
}: GameDetailInteractiveProps) {
  const [hasReviewed, setHasReviewed] = useState(false)
  const [userReview, setUserReview] = useState<Review | undefined>(undefined)
  const [composerOpen, setComposerOpen] = useState(false)

  // Averages local states (for real-time optimistic update support in future)
  const [avgRating, setAvgRating] = useState<number | null>(initialAvgRating)
  const [ratingCount, setRatingCount] = useState<number>(initialRatingCount)

  const handleReviewStateChanged = (reviewed: boolean, myReview?: Review) => {
    setHasReviewed(reviewed)
    setUserReview(myReview)
  }

  const handleWriteOrEditReview = () => {
    setComposerOpen(true)
  }

  const handleComposerSuccess = (savedReview: Review) => {
    window.dispatchEvent(new CustomEvent('review-saved', { detail: savedReview }))
  }

  return (
    <div className="game-detail__interactive-grid">
      {/* Sidebar with all catalog/rating/lists controls */}
      <aside className="game-detail__aside">
        <GameActionPanel
          gameId={gameId}
          gameTitle={gameTitle}
          avgRating={avgRating}
          ratingCount={ratingCount}
          onWriteReview={handleWriteOrEditReview}
          hasReviewed={hasReviewed}
        />
      </aside>

      {/* Reviews feed at the bottom fold */}
      <div className="game-detail__interactive-content">
        <ReviewsSection
          gameId={gameId}
          onReviewStateChanged={handleReviewStateChanged}
        />
      </div>

      {/* Shared review modal */}
      <ReviewComposer
        gameId={gameId}
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={handleComposerSuccess}
        editingReview={userReview}
      />
    </div>
  )
}
