import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare, ArrowRight } from 'lucide-react'

interface ReviewItem {
  id: string
  title: string | null
  body: string
  createdAt: string
  game: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
  }
}

interface ProfileReviewGridProps {
  reviews: ReviewItem[]
  username: string
  isOwner: boolean
}

export function ProfileReviewGrid({ reviews, username, isOwner }: ProfileReviewGridProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-surface-raised border border-border-subtle text-center min-h-[220px]">
        <MessageSquare size={32} className="text-text-muted mb-3" aria-hidden="true" />
        <h3 className="text-lg font-bold text-text-primary mb-1">No reviews yet</h3>
        <p className="text-sm text-text-muted max-w-sm mb-4">
          {isOwner
            ? "You haven't written any reviews yet. Share your thoughts on games you've completed!"
            : `${username} hasn't published any game reviews yet.`}
        </p>
        {isOwner && (
          <Link href="/games" className="btn btn--primary btn--sm">
            Explore Games
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => {
          const cleanBody = review.body.replace(/<[^>]*>/g, '').slice(0, 180)
          const hasMore = review.body.length > 180

          return (
            <div
              key={review.id}
              className="flex gap-4 p-4 rounded-xl bg-surface-raised border border-border-subtle hover:border-border transition-all hover:translate-y-[-2px]"
            >
              {/* Game Cover */}
              <Link href={`/games/${review.game.slug}`} className="relative flex-shrink-0 w-[72px] aspect-[3/4] overflow-hidden rounded-lg bg-surface-sunken border border-border-subtle group">
                {review.game.coverUrl ? (
                  <Image
                    src={review.game.coverUrl}
                    alt={`${review.game.title} cover`}
                    fill
                    sizes="72px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-100% h-100% bg-gradient-to-br from-surface-overlay to-surface-raised" />
                )}
              </Link>

              {/* Review Content */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <Link
                      href={`/games/${review.game.slug}`}
                      className="text-sm font-bold text-text-primary hover:text-accent transition-colors truncate"
                    >
                      {review.game.title}
                    </Link>
                    <time className="text-[10px] text-text-muted shrink-0" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {review.title && (
                    <h4 className="text-xs font-semibold text-text-secondary mb-1 truncate">
                      "{review.title}"
                    </h4>
                  )}

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {cleanBody}
                    {hasMore && '...'}
                  </p>
                </div>

                <div className="flex justify-end mt-2">
                  <Link
                    href={`/u/${username}/reviews`}
                    className="text-[11px] font-semibold text-accent hover:text-accent-muted transition-colors flex items-center gap-1"
                  >
                    Read review <ArrowRight size={10} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
