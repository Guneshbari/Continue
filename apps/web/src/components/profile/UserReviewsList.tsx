'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShieldAlert, ChevronDown, MessageSquare } from 'lucide-react'

interface ReviewItem {
  id: string
  title: string | null
  body: string
  isSpoiler: boolean
  createdAt: string
  game: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    avgRating: number | null
    releaseDate: string | null
    ratings?: { score: number }[]
  }
}

interface UserReviewsListProps {
  initialReviews: ReviewItem[]
  username: string
}

export function UserReviewsList({ initialReviews, username: _username }: UserReviewsListProps) {
  const [reviews] = useState<ReviewItem[]>(initialReviews)
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'highest' | 'lowest'>('recent')
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({})

  // Compute the score given by user if available
  const reviewsWithScores = useMemo(() => {
    return reviews.map((rev) => {
      const score = rev.game.ratings?.[0]?.score ?? null
      return { ...rev, userScore: score }
    })
  }, [reviews])

  // Client-side sorting
  const sortedReviews = useMemo(() => {
    const items = [...reviewsWithScores]
    if (sortBy === 'recent') {
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    if (sortBy === 'oldest') {
      return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    if (sortBy === 'highest') {
      return items.sort((a, b) => (b.userScore ?? 0) - (a.userScore ?? 0))
    }
    if (sortBy === 'lowest') {
      return items.sort((a, b) => (a.userScore ?? 11) - (b.userScore ?? 11))
    }
    return items
  }, [reviewsWithScores, sortBy])

  const toggleSpoiler = (reviewId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  if (sortedReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-surface-raised border border-border-subtle text-center min-h-[300px]">
        <MessageSquare size={44} className="text-text-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-text-primary mb-2">No reviews in archive</h2>
        <p className="text-sm text-text-muted max-w-sm">
          There are no published reviews in this user's archive yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sorting Control Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {sortedReviews.length} {sortedReviews.length === 1 ? 'Review' : 'Reviews'}
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-text-muted font-medium">Sort by:</label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-surface-raised border border-border-subtle hover:border-border text-xs text-text-primary font-bold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="recent">Recent Reviews</option>
              <option value="oldest">Oldest Reviews</option>
              <option value="highest">Highest Curated Rating</option>
              <option value="lowest">Lowest Curated Rating</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-text-muted pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ul className="flex flex-col gap-6 list-none m-0 p-0" role="list">
        {sortedReviews.map((review) => {
          const isSpoiler = review.isSpoiler
          const isRevealed = revealedSpoilers[review.id] ?? false
          const releaseYear = review.game.releaseDate
            ? new Date(review.game.releaseDate).getFullYear()
            : null

          return (
            <li
              key={review.id}
              className="flex flex-col md:flex-row gap-6 p-5 rounded-xl bg-surface-raised border border-border-subtle"
            >
              {/* Game Poster Column */}
              <Link
                href={`/games/${review.game.slug}`}
                className="relative flex-shrink-0 w-24 md:w-28 aspect-[3/4] rounded-lg overflow-hidden bg-surface-sunken border border-border-subtle shadow-md group align-self-start"
              >
                {review.game.coverUrl ? (
                  <Image
                    src={review.game.coverUrl}
                    alt={`${review.game.title} cover`}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-100% h-100% bg-gradient-to-br from-surface-overlay to-surface-raised" />
                )}
              </Link>

              {/* Review Text Body */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/games/${review.game.slug}`}
                        className="text-lg font-bold text-text-primary hover:text-accent transition-colors"
                      >
                        {review.game.title}
                      </Link>
                      {releaseYear && (
                        <span className="text-xs text-text-muted font-medium">({releaseYear})</span>
                      )}
                    </div>

                    <time className="text-xs text-text-muted" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Rating Score Badges */}
                  <div className="flex items-center gap-3 mb-4" aria-label="Ratings info">
                    {review.userScore !== null && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-subtle text-accent text-xs font-bold border border-accent/20">
                        <Star size={11} className="fill-current" />
                        <span>Curated {review.userScore}/10</span>
                      </div>
                    )}
                    {review.game.avgRating !== null && (
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary font-semibold">
                        <span>Community avg:</span>
                        <span className="text-warning font-bold">{review.game.avgRating.toFixed(1)}/10</span>
                      </div>
                    )}
                  </div>

                  {review.title && (
                    <h3 className="text-sm font-bold text-text-primary mb-2 select-text">
                      "{review.title}"
                    </h3>
                  )}

                  {/* Restrained Spoiler Blur */}
                  {isSpoiler && !isRevealed ? (
                    <div className="relative rounded-lg overflow-hidden border border-dashed border-border-strong bg-surface-sunken p-4">
                      {/* Placeholder blur */}
                      <p className="text-xs text-text-muted/10 blur-sm select-none line-clamp-3">
                        This review contains spoilers for {review.game.title}. It can be revealed cleanly by clicking the warning banner below.
                      </p>
                      {/* Spoiler Warn Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleSpoiler(review.id)}
                        className="absolute inset-0 w-full h-full bg-surface-sunken/80 flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-surface-sunken/90 focus:outline-none"
                      >
                        <ShieldAlert size={14} className="text-accent" />
                        <span className="text-xs font-bold text-text-secondary">
                          Review contains spoilers. Click to reveal.
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap select-text transition-all duration-300">
                      {review.body}
                      {isSpoiler && (
                        <button
                          type="button"
                          onClick={() => toggleSpoiler(review.id)}
                          className="text-[10px] text-accent hover:underline font-semibold block mt-3"
                        >
                          Hide spoilers
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
