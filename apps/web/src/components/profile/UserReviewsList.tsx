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
      <div className="bg-surface-raised border-border-subtle flex min-h-[300px] flex-col items-center justify-center rounded-xl border p-12 text-center">
        <MessageSquare size={44} className="text-text-muted mb-4" aria-hidden="true" />
        <h2 className="text-text-primary mb-2 text-xl font-bold">No reviews in archive</h2>
        <p className="text-text-muted max-w-sm text-sm">
          There are no published reviews in this user's archive yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sorting Control Header */}
      <div className="border-border-subtle flex items-center justify-between border-b pb-4">
        <span className="text-text-muted text-xs font-bold uppercase tracking-wider">
          {sortedReviews.length} {sortedReviews.length === 1 ? 'Review' : 'Reviews'}
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-text-muted text-xs font-medium">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-raised border-border-subtle hover:border-border text-text-primary focus:ring-accent cursor-pointer appearance-none rounded-lg border py-1.5 pl-3 pr-8 text-xs font-bold transition-colors focus:outline-none focus:ring-1"
            >
              <option value="recent">Recent Reviews</option>
              <option value="oldest">Oldest Reviews</option>
              <option value="highest">Highest Curated Rating</option>
              <option value="lowest">Lowest Curated Rating</option>
            </select>
            <ChevronDown
              size={12}
              className="text-text-muted pointer-events-none absolute right-2.5 top-2.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ul className="m-0 flex list-none flex-col gap-6 p-0" role="list">
        {sortedReviews.map((review) => {
          const isSpoiler = review.isSpoiler
          const isRevealed = revealedSpoilers[review.id] ?? false
          const releaseYear = review.game.releaseDate
            ? new Date(review.game.releaseDate).getFullYear()
            : null

          return (
            <li
              key={review.id}
              className="bg-surface-raised border-border-subtle flex flex-col gap-6 rounded-xl border p-5 md:flex-row"
            >
              {/* Game Poster Column */}
              <Link
                href={`/games/${review.game.slug}`}
                className="bg-surface-sunken border-border-subtle align-self-start group relative aspect-[3/4] w-24 flex-shrink-0 overflow-hidden rounded-lg border shadow-md md:w-28"
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
                  <div className="w-100% h-100% from-surface-overlay to-surface-raised bg-gradient-to-br" />
                )}
              </Link>

              {/* Review Text Body */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/games/${review.game.slug}`}
                        className="text-text-primary hover:text-accent text-lg font-bold transition-colors"
                      >
                        {review.game.title}
                      </Link>
                      {releaseYear && (
                        <span className="text-text-muted text-xs font-medium">({releaseYear})</span>
                      )}
                    </div>

                    <time className="text-text-muted text-xs" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Rating Score Badges */}
                  <div className="mb-4 flex items-center gap-3" aria-label="Ratings info">
                    {review.userScore !== null && (
                      <div className="bg-accent-subtle text-accent border-accent/20 flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-bold">
                        <Star size={11} className="fill-current" />
                        <span>Curated {review.userScore}/10</span>
                      </div>
                    )}
                    {review.game.avgRating !== null && (
                      <div className="text-text-secondary flex items-center gap-1 text-[11px] font-semibold">
                        <span>Community avg:</span>
                        <span className="text-warning font-bold">
                          {review.game.avgRating.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {review.title && (
                    <h3 className="text-text-primary mb-2 select-text text-sm font-bold">
                      "{review.title}"
                    </h3>
                  )}

                  {/* Restrained Spoiler Blur */}
                  {isSpoiler && !isRevealed ? (
                    <div className="border-border-strong bg-surface-sunken relative overflow-hidden rounded-lg border border-dashed p-4">
                      {/* Placeholder blur */}
                      <p className="text-text-muted/10 line-clamp-3 select-none text-xs blur-sm">
                        This review contains spoilers for {review.game.title}. It can be revealed
                        cleanly by clicking the warning banner below.
                      </p>
                      {/* Spoiler Warn Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleSpoiler(review.id)}
                        className="bg-surface-sunken/80 hover:bg-surface-sunken/90 absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center gap-2 transition-colors focus:outline-none"
                      >
                        <ShieldAlert size={14} className="text-accent" />
                        <span className="text-text-secondary text-xs font-bold">
                          Review contains spoilers. Click to reveal.
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-text-secondary select-text whitespace-pre-wrap text-sm leading-relaxed transition-all duration-300">
                      {review.body}
                      {isSpoiler && (
                        <button
                          type="button"
                          onClick={() => toggleSpoiler(review.id)}
                          className="text-accent mt-3 block text-[10px] font-semibold hover:underline"
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
