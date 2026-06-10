import Link from 'next/link'
import { Star, Quote } from 'lucide-react'
import type { SeedReview } from '@/test-fixtures/seed'
import { MotionFade, MotionStagger, MotionStaggerItem, MotionScale } from '@/components/motion'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { MetadataBadge } from '@/components/ui/MetadataBadgeSystem'

type FeaturedReviewsSectionProps = Readonly<{
  reviews: SeedReview[]
}>

export function FeaturedReviewsSection({ reviews }: FeaturedReviewsSectionProps) {
  if (reviews.length === 0) return null

  return (
    <section className="featured-reviews" aria-labelledby="featured-reviews-title">
      <MotionFade direction="none" className="featured-reviews__header">
        <h2 className="featured-reviews__title" id="featured-reviews-title">
          Featured Reviews
        </h2>
        <Link href="/games" className="discovery-section__view-all">
          Browse all reviews
        </Link>
      </MotionFade>

      <MotionStagger preset="editorial" className="featured-reviews__list">
        {reviews.map((review) => (
          <MotionStaggerItem key={review.id}>
            <MotionScale hoverScale={1.01} tapScale={0.99}>
              <article
                className="featured-review-card"
                aria-label={`Review of ${review.game.title} by ${review.user.displayName}`}
              >
                {/* Quote icon */}
                <Quote
                  size={20}
                  className="featured-review-card__quote-icon"
                  aria-hidden="true"
                />

                {/* Review body */}
                <blockquote className="featured-review-card__body max-w-[var(--measure-review)]">
                  <p>{review.body}</p>
                </blockquote>

                {/* Footer: game + author + rating */}
                <footer className="featured-review-card__footer">
                  <Link
                    href={`/games/${review.game.slug}`}
                    className="featured-review-card__game"
                    aria-label={`View ${review.game.title}`}
                  >
                    <div className="featured-review-card__cover">
                      <GameArtwork
                        src={review.game.coverUrl}
                        alt={review.game.title}
                        variant="cover-sm"
                        hoverable={false}
                        sizes="48px"
                      />
                    </div>
                    <span className="featured-review-card__game-title">
                      {review.game.title}
                    </span>
                  </Link>

                  <div className="featured-review-card__meta">
                    <span className="featured-review-card__author">
                      {review.user.displayName}
                    </span>
                    <MetadataBadge
                      variant="warning"
                      size="sm"
                      icon={<Star size={10} fill="currentColor" aria-hidden="true" />}
                      aria-label={`Rating: ${review.rating} out of 10`}
                    >
                      {review.rating.toFixed(1)}
                    </MetadataBadge>
                  </div>
                </footer>
              </article>
            </MotionScale>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </section>
  )
}

