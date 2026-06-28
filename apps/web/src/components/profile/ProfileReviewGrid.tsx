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
      <div className="bg-surface-raised border-border-subtle flex min-h-[220px] flex-col items-center justify-center rounded-xl border p-8 text-center">
        <MessageSquare size={32} className="text-text-muted mb-3" aria-hidden="true" />
        <h3 className="text-text-primary mb-1 text-lg font-bold">No reviews yet</h3>
        <p className="text-text-muted mb-4 max-w-sm text-sm">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reviews.map((review) => {
          const cleanBody = review.body.replace(/<[^>]*>/g, '').slice(0, 180)
          const hasMore = review.body.length > 180

          return (
            <div
              key={review.id}
              className="bg-surface-raised border-border-subtle hover:border-border flex gap-4 rounded-xl border p-4 transition-all hover:translate-y-[-2px]"
            >
              {/* Game Cover */}
              <Link
                href={`/games/${review.game.slug}`}
                className="bg-surface-sunken border-border-subtle group relative aspect-[3/4] w-[72px] flex-shrink-0 overflow-hidden rounded-lg border"
              >
                {review.game.coverUrl ? (
                  <Image
                    src={review.game.coverUrl}
                    alt={`${review.game.title} cover`}
                    fill
                    sizes="72px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-100% h-100% from-surface-overlay to-surface-raised bg-gradient-to-br" />
                )}
              </Link>

              {/* Review Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <Link
                      href={`/games/${review.game.slug}`}
                      className="text-text-primary hover:text-accent truncate text-sm font-bold transition-colors"
                    >
                      {review.game.title}
                    </Link>
                    <time
                      className="text-text-muted shrink-0 text-[10px]"
                      dateTime={review.createdAt}
                    >
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {review.title && (
                    <h4 className="text-text-secondary mb-1 truncate text-xs font-semibold">
                      "{review.title}"
                    </h4>
                  )}

                  <p className="text-text-muted line-clamp-3 text-xs leading-relaxed">
                    {cleanBody}
                    {hasMore && '...'}
                  </p>
                </div>

                <div className="mt-2 flex justify-end">
                  <Link
                    href={`/u/${username}/reviews`}
                    className="text-accent hover:text-accent-muted flex items-center gap-1 text-[11px] font-semibold transition-colors"
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
