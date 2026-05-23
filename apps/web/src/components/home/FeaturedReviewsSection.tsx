import Image from 'next/image'
import Link from 'next/link'
import { Star, Quote } from 'lucide-react'
import type { SeedReview } from '@/lib/data/seed'

type FeaturedReviewsSectionProps = Readonly<{
  reviews: SeedReview[]
}>

export function FeaturedReviewsSection({ reviews }: FeaturedReviewsSectionProps) {
  if (reviews.length === 0) return null

  return (
    <section className="featured-reviews" aria-labelledby="featured-reviews-title">
      <div className="featured-reviews__header">
        <h2 className="featured-reviews__title" id="featured-reviews-title">
          Featured Reviews
        </h2>
        <Link href="/games" className="discovery-section__view-all">
          Browse all reviews
        </Link>
      </div>

      <ul className="featured-reviews__list">
        {reviews.map((review) => (
          <li key={review.id}>
            <article className="featured-review-card" aria-label={`Review of ${review.game.title} by ${review.user.displayName}`}>
              {/* Quote icon */}
              <Quote
                size={20}
                className="featured-review-card__quote-icon"
                aria-hidden="true"
              />

              {/* Review body */}
              <blockquote className="featured-review-card__body">
                <p>{review.body}</p>
              </blockquote>

              {/* Footer: game + author + rating */}
              <footer className="featured-review-card__footer">
                <Link
                  href={`/games/${review.game.slug}`}
                  className="featured-review-card__game"
                  aria-label={`View ${review.game.title}`}
                >
                  {review.game.coverUrl && (
                    <div className="featured-review-card__cover">
                      <Image
                        src={review.game.coverUrl}
                        alt={`${review.game.title} cover`}
                        fill
                        sizes="48px"
                        className="featured-review-card__cover-img"
                      />
                    </div>
                  )}
                  <span className="featured-review-card__game-title">
                    {review.game.title}
                  </span>
                </Link>

                <div className="featured-review-card__meta">
                  <span className="featured-review-card__author">
                    {review.user.displayName}
                  </span>
                  <div className="featured-review-card__rating" aria-label={`Rating: ${review.rating} out of 10`}>
                    <Star size={12} fill="currentColor" aria-hidden="true" />
                    <span>{review.rating.toFixed(1)}</span>
                  </div>
                </div>
              </footer>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
