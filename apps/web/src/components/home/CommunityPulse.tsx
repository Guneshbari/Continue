'use client'

import Link from 'next/link'
import { Star, Layers, MessageSquare } from 'lucide-react'
import type { SeedReview, SeedCollection } from '@/test-fixtures/seed'
import { MotionFade, MotionStagger, MotionStaggerItem, MotionScale } from '@/components/motion'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { MetadataBadge } from '@/components/ui/MetadataBadgeSystem'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

// Extend review type to support optional date
interface PulseReview extends SeedReview {
  createdAt?: string | null | undefined
}

type CommunityPulseProps = Readonly<{
  reviews: PulseReview[]
  collections: SeedCollection[]
}>

function getBucket(dateStr?: string | null): 'today' | 'yesterday' | 'this_week' | 'older' {
  if (!dateStr) return 'this_week'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'this_week'
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (compareDate.getTime() === today.getTime()) return 'today'
  if (compareDate.getTime() === yesterday.getTime()) return 'yesterday'
  if (compareDate.getTime() >= oneWeekAgo.getTime()) return 'this_week'
  return 'older'
}

export function CommunityPulse({ reviews, collections }: CommunityPulseProps) {
  // If reviews don't have createdAt, assign mock ones to test visual time buckets
  const pulseReviews = reviews.map((rev, i) => {
    if (rev.createdAt) return rev
    // mock values: index 0 is today, 1 is yesterday, 2 is this week
    const now = new Date()
    if (i === 0) return { ...rev, createdAt: now.toISOString() }
    if (i === 1) {
      const yes = new Date()
      yes.setDate(yes.getDate() - 1)
      return { ...rev, createdAt: yes.toISOString() }
    }
    const week = new Date()
    week.setDate(week.getDate() - 3)
    return { ...rev, createdAt: week.toISOString() }
  })

  // Bucketing reviews
  const bucketedReviews = {
    today: pulseReviews.filter(r => getBucket(r.createdAt) === 'today'),
    yesterday: pulseReviews.filter(r => getBucket(r.createdAt) === 'yesterday'),
    this_week: pulseReviews.filter(r => getBucket(r.createdAt) === 'this_week'),
    older: pulseReviews.filter(r => getBucket(r.createdAt) === 'older'),
  }

  const renderReviewItem = (review: PulseReview) => (
    <div key={review.id} className="pulse-activity-item">
      <div className="pulse-activity-item__top">
        <Link href={`/games/${review.game.slug}`} className="pulse-activity-item__cover">
          <GameArtwork
            src={review.game.coverUrl}
            alt={review.game.title}
            variant="cover-sm"
            hoverable={false}
            sizes="40px"
          />
        </Link>
        <div className="pulse-activity-item__meta">
          <span className="pulse-activity-item__user">{review.user.displayName}</span>
          <span className="pulse-activity-item__action">
            reviewed <Link href={`/games/${review.game.slug}`} className="pulse-activity-item__game-link">{review.game.title}</Link>
          </span>
        </div>
        {review.rating > 0 && (
          <div className="pulse-activity-item__rating">
            <MetadataBadge variant="warning" size="sm" icon={<Star size={9} fill="currentColor" />}>
              {review.rating.toFixed(1)}
            </MetadataBadge>
          </div>
        )}
      </div>
      <p className="pulse-activity-item__body">
        “{review.body.slice(0, 140)}{review.body.length > 140 ? '…' : ''}”
      </p>
    </div>
  )

  return (
    <section className="community-pulse" aria-labelledby="community-pulse-title">
      <ResponsiveContainer className="py-12 md:py-16">
        <MotionFade direction="none" className="mb-8">
          <div className="community-pulse__header">
            <h2 id="community-pulse-title" className="community-pulse__title">
              Community Pulse
            </h2>
            <p className="community-pulse__subtitle">
              See what is trending and curation logs from players right now
            </p>
          </div>
        </MotionFade>

        <div className="community-pulse__grid">
          {/* LEFT: Live Activity Stream */}
          <div className="community-pulse__column">
            <div className="community-pulse__col-header">
              <MessageSquare size={16} className="text-accent" aria-hidden="true" />
              <h3>Recent Ratings & Reviews</h3>
            </div>

            <div className="community-pulse__feed">
              <MotionStagger preset="fast">
                {/* Today */}
                {bucketedReviews.today.length > 0 && (
                  <MotionStaggerItem className="pulse-bucket">
                    <span className="pulse-bucket__label">TODAY</span>
                    <div className="pulse-bucket__items">
                      {bucketedReviews.today.map(renderReviewItem)}
                    </div>
                  </MotionStaggerItem>
                )}

                {/* Yesterday */}
                {bucketedReviews.yesterday.length > 0 && (
                  <MotionStaggerItem className="pulse-bucket">
                    <span className="pulse-bucket__label">YESTERDAY</span>
                    <div className="pulse-bucket__items">
                      {bucketedReviews.yesterday.map(renderReviewItem)}
                    </div>
                  </MotionStaggerItem>
                )}

                {/* This Week */}
                {bucketedReviews.this_week.length > 0 && (
                  <MotionStaggerItem className="pulse-bucket">
                    <span className="pulse-bucket__label">THIS WEEK</span>
                    <div className="pulse-bucket__items">
                      {bucketedReviews.this_week.map(renderReviewItem)}
                    </div>
                  </MotionStaggerItem>
                )}

                {/* Older */}
                {bucketedReviews.older.length > 0 && (
                  <MotionStaggerItem className="pulse-bucket">
                    <span className="pulse-bucket__label">OLDER</span>
                    <div className="pulse-bucket__items">
                      {bucketedReviews.older.map(renderReviewItem)}
                    </div>
                  </MotionStaggerItem>
                )}
              </MotionStagger>
            </div>
          </div>

          {/* RIGHT: Curated Collections */}
          <div className="community-pulse__column">
            <div className="community-pulse__col-header">
              <Layers size={16} className="text-accent" aria-hidden="true" />
              <h3>Popular Collections</h3>
            </div>

            <div className="community-pulse__collections">
              <MotionStagger preset="standard">
                {collections.map((collection) => (
                  <MotionStaggerItem key={collection.id}>
                    <MotionScale hoverScale={1.015} tapScale={0.99}>
                      <Link href="/lists" className="pulse-collection-card">
                        <div className="pulse-collection-card__mosaic">
                          {collection.covers.slice(0, 3).map((cover, i) => (
                            <div key={i} className="pulse-collection-card__mosaic-slot">
                              <GameArtwork
                                src={cover}
                                alt=""
                                variant="cover-sm"
                                hoverable={false}
                                sizes="60px"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="pulse-collection-card__info">
                          <h4 className="pulse-collection-card__title">{collection.title}</h4>
                          <p className="pulse-collection-card__desc">{collection.description}</p>
                          <div className="pulse-collection-card__meta">
                            <span className="pulse-collection-card__curator">
                              by {collection.curator.displayName}
                            </span>
                            <span className="pulse-collection-card__count">
                              {collection.gameCount} games
                            </span>
                          </div>
                        </div>
                      </Link>
                    </MotionScale>
                  </MotionStaggerItem>
                ))}
              </MotionStagger>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  )
}
