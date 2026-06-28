import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { usersApi } from '@/lib/api/users'
import { listsApi } from '@/lib/api/lists'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ActivityOverview } from '@/components/profile/ActivityOverview'
import { ProfileReviewGrid } from '@/components/profile/ProfileReviewGrid'
import { ProfileListGrid } from '@/components/profile/ProfileListGrid'
import Link from 'next/link'
import { ArrowRight, Layers, MessageSquare } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await usersApi.profile(username)
    const displayName = user.displayName ?? user.username
    return {
      title: `${displayName} (@${user.username}) — Continue`,
      description:
        user.bio ?? `${displayName}'s personal curated gaming profile and collections on Continue.`,
      openGraph: {
        title: `${displayName}'s Curator Profile — Continue`,
        description:
          user.bio ?? `Explore collections, reviews, and game ratings by ${displayName}.`,
        type: 'profile',
        username: user.username,
      },
    }
  } catch {
    return { title: 'Curator Not Found — Continue' }
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params

  let user: any
  let reviewsData: any
  let ratingsData: any
  let listsData: any

  try {
    const [userRes, reviewsRes, ratingsRes, listsRes] = await Promise.all([
      usersApi.profile(username),
      usersApi.reviews(username, 4),
      usersApi.ratings(username, 4),
      listsApi.byUser(username),
    ])
    user = userRes
    reviewsData = reviewsRes
    ratingsData = ratingsRes
    listsData = listsRes
  } catch {
    notFound()
  }

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Cinematic Hero */}
      <ProfileHero profile={user} />

      {/* Stats Counter Row */}
      <ProfileStats
        ratingCount={user.ratingCount}
        reviewCount={user.reviewCount}
        listCount={user.listCount}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Areas */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Curated Collections */}
          <section className="flex flex-col gap-4" aria-labelledby="collections-heading">
            <div className="border-border-subtle flex items-center justify-between border-b pb-2">
              <h2
                id="collections-heading"
                className="text-text-primary flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                <Layers size={18} className="text-accent" aria-hidden="true" />
                Curated Collections
              </h2>
              {listsData.length > 0 && (
                <Link
                  href={`/u/${username}/lists`}
                  className="text-accent hover:text-accent-muted flex items-center gap-1 text-xs font-semibold transition-colors"
                >
                  View all <ArrowRight size={12} aria-hidden="true" />
                </Link>
              )}
            </div>
            <ProfileListGrid lists={listsData.slice(0, 3)} username={username} isOwner={false} />
          </section>

          {/* Recent Reviews */}
          <section className="flex flex-col gap-4" aria-labelledby="reviews-heading">
            <div className="border-border-subtle flex items-center justify-between border-b pb-2">
              <h2
                id="reviews-heading"
                className="text-text-primary flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                <MessageSquare size={18} className="text-accent" aria-hidden="true" />
                Recent Reviews
              </h2>
              {reviewsData.data.length > 0 && (
                <Link
                  href={`/u/${username}/reviews`}
                  className="text-accent hover:text-accent-muted flex items-center gap-1 text-xs font-semibold transition-colors"
                >
                  Full Archive <ArrowRight size={12} aria-hidden="true" />
                </Link>
              )}
            </div>
            <ProfileReviewGrid
              reviews={reviewsData.data.slice(0, 4)}
              username={username}
              isOwner={false}
            />
          </section>
        </div>

        {/* Sidebar Activity & Details */}
        <div className="flex flex-col gap-6">
          <section aria-label="Activity overview timeline">
            <ActivityOverview
              ratings={ratingsData.data}
              reviews={reviewsData.data}
              lists={listsData}
              username={username}
              isOwner={false}
            />
          </section>

          {/* Cinematic details section */}
          <section className="bg-surface-raised border-border-subtle flex flex-col gap-3 rounded-xl border p-5">
            <h4 className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
              Tastes & Identity
            </h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              This curator is actively building their catalog on Continue, helping players discover
              classic gems and brand-new interactive releases.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
