'use client'

import Link from 'next/link'
import { Star, Quote as QuoteIcon } from 'lucide-react'
import type { SeedReview } from '@/test-fixtures/seed'
import { MotionFade, MotionScale } from '@/components/motion'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { MetadataBadge } from '@/components/ui/MetadataBadgeSystem'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

type FeaturedReviewSpotlightProps = Readonly<{
  review: SeedReview | null
}>

export function FeaturedReviewSpotlight({ review }: FeaturedReviewSpotlightProps) {
  if (!review) return null

  const ariaLabel = `Featured review of ${review.game.title} by ${review.user.displayName}, rated ${review.rating.toFixed(1)} out of 10`

  return (
    <section className="featured-review-spotlight" aria-label="Featured review spotlight">
      <ResponsiveContainer className="py-16 md:py-24">
        <div className="featured-review-spotlight__grid">
          {/* Left: Review Content */}
          <div className="featured-review-spotlight__content">
            <MotionFade direction="up" delay={0.1}>
              <span className="featured-review-spotlight__label">COMMUNITY SPOTLIGHT</span>
            </MotionFade>

            <MotionFade direction="up" delay={0.2}>
              <div className="featured-review-spotlight__quote-wrap">
                <QuoteIcon className="featured-review-spotlight__quote-icon" size={48} aria-hidden="true" />
                <blockquote className="featured-review-spotlight__quote">
                  <p>“{review.body}”</p>
                </blockquote>
              </div>
            </MotionFade>

            <MotionFade direction="up" delay={0.3}>
              <div className="featured-review-spotlight__author-row">
                <div className="featured-review-spotlight__author-info">
                  <span className="featured-review-spotlight__author-name">
                    {review.user.displayName}
                  </span>
                  <span className="featured-review-spotlight__author-title">
                    Continue Reviewer
                  </span>
                </div>

                <div className="featured-review-spotlight__rating-wrap">
                  <span className="featured-review-spotlight__rating-label">SCORE</span>
                  <MetadataBadge
                    variant="warning"
                    size="md"
                    icon={<Star size={12} fill="currentColor" aria-hidden="true" />}
                  >
                    {review.rating.toFixed(1)}
                  </MetadataBadge>
                </div>
              </div>
            </MotionFade>

            <MotionFade direction="up" delay={0.4}>
              <Link
                href={`/games/${review.game.slug}`}
                className="featured-review-spotlight__game-link"
              >
                Read all reviews for {review.game.title}
              </Link>
            </MotionFade>
          </div>

          {/* Right: Game Cover Art */}
          <div className="featured-review-spotlight__artwork-col">
            <MotionFade direction="left" delay={0.25} duration={0.8}>
              <MotionScale hoverScale={1.03}>
                <Link
                  href={`/games/${review.game.slug}`}
                  className="featured-review-spotlight__cover-link"
                  aria-label={ariaLabel}
                >
                  <div className="featured-review-spotlight__artwork-container">
                    <GameArtwork
                      src={review.game.coverUrl}
                      alt={`${review.game.title} cover`}
                      variant="cover-lg"
                      hoverable={false}
                      sizes="(max-width: 768px) 160px, (max-width: 1280px) 240px, 300px"
                      className="featured-review-spotlight__img"
                    />
                    <div className="featured-review-spotlight__game-badge">
                      <span className="featured-review-spotlight__game-title">{review.game.title}</span>
                    </div>
                  </div>
                </Link>
              </MotionScale>
            </MotionFade>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  )
}
