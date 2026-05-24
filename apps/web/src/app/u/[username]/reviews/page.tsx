import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import { UserReviewsList } from '@/components/profile/UserReviewsList'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await usersApi.profile(username)
    const name = user.displayName ?? user.username
    return {
      title: `${name}'s Review Archive — Continue`,
      description: `Browse all gaming reviews, analytical writeups, and backlog curations published by ${name}.`,
    }
  } catch {
    return { title: 'Reviews Not Found — Continue' }
  }
}

export default async function UserReviewsPage({ params }: PageProps) {
  const { username } = await params

  let user: any
  let reviewsData: any

  try {
    const [userRes, reviewsRes] = await Promise.all([
      usersApi.profile(username),
      usersApi.reviews(username, 100), // load up to 100 reviews for clean archive paging/sorting
    ])
    user = userRes
    reviewsData = reviewsRes
  } catch {
    notFound()
  }

  const name = user.displayName ?? user.username

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Back Link */}
      <Link
        href={`/u/${username}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to {name}'s Profile
      </Link>

      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {name}'s Review Archive
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
          Analytical reflections, editorial impressions, and game diaries written by @{user.username}.
        </p>
      </header>

      {/* Review Interactive Container */}
      <UserReviewsList initialReviews={reviewsData.data} username={username} />
    </main>
  )
}
