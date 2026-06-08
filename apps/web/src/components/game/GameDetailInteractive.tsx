'use client'

import { useState } from 'react'
import { GameActionPanel } from './GameActionPanel'
import { ReviewList } from './ReviewList'
import { ReviewEditor } from './ReviewEditor'

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
  slug: string
  gameTitle: string
  initialAvgRating: number | null
  initialRatingCount: number
}

export function GameDetailInteractive({
  gameId,
  slug,
  gameTitle,
  initialAvgRating,
  initialRatingCount,
}: GameDetailInteractiveProps) {
  const [hasReviewed, setHasReviewed] = useState(false)
  const [userReview, setUserReview] = useState<Review | undefined>(undefined)
  const [composerOpen, setComposerOpen] = useState(false)

  const handleReviewStateChanged = (reviewed: boolean, myReview?: Review) => {
    setHasReviewed(reviewed)
    setUserReview(myReview)
  }

  const handleWriteOrEditReview = () => {
    setComposerOpen(true)
  }

  return (
    <div className="game-detail__interactive-grid">
      {/* Sidebar with all catalog/rating/lists controls */}
      <aside className="game-detail__aside">
        <GameActionPanel
          gameId={gameId}
          slug={slug}
          gameTitle={gameTitle}
          avgRating={initialAvgRating}
          ratingCount={initialRatingCount}
          onWriteReview={handleWriteOrEditReview}
          hasReviewed={hasReviewed}
        />
      </aside>

      {/* Reviews feed at the bottom fold */}
      <div className="game-detail__interactive-content">
        <ReviewList
          gameId={gameId}
          onReviewStateChanged={handleReviewStateChanged}
        />
      </div>

      {/* Shared review modal */}
      <ReviewEditor
        gameId={gameId}
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        editingReview={userReview}
      />
    </div>
  )
}
