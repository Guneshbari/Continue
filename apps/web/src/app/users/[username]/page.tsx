import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { usersApi } from '@/lib/api/users'
import { Star, MessageSquare, List, Calendar } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await usersApi.profile(username)
    return {
      title: `${user.displayName ?? user.username}'s Profile`,
      description: user.bio ?? `${user.username}'s gaming profile on Continue.`,
    }
  } catch {
    return { title: 'User Not Found' }
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params

  let user
  try {
    user = await usersApi.profile(username)
  } catch {
    notFound()
  }

  const joinYear = new Date(user.createdAt).getFullYear()

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      {/* Profile header */}
      <div className="profile-header">
        {/* Avatar */}
        <div className="profile-header__avatar">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.username}'s avatar`}
              className="profile-header__avatar-img"
            />
          ) : (
            <div className="profile-header__avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-header__info">
          <h1 className="profile-header__name">
            {user.displayName ?? user.username}
          </h1>
          <p className="profile-header__username">@{user.username}</p>
          {user.bio && <p className="profile-header__bio">{user.bio}</p>}

          <div className="profile-header__meta">
            <span className="profile-header__meta-item">
              <Calendar size={13} aria-hidden="true" />
              Joined {joinYear}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-header__stats">
          <div className="profile-stat">
            <Star size={18} className="profile-stat__icon" aria-hidden="true" />
            <span className="profile-stat__value">{user.ratingCount}</span>
            <span className="profile-stat__label">Ratings</span>
          </div>
          <div className="profile-stat">
            <MessageSquare size={18} className="profile-stat__icon" aria-hidden="true" />
            <span className="profile-stat__value">{user.reviewCount}</span>
            <span className="profile-stat__label">Reviews</span>
          </div>
          <div className="profile-stat">
            <List size={18} className="profile-stat__icon" aria-hidden="true" />
            <span className="profile-stat__value">{user.listCount}</span>
            <span className="profile-stat__label">Lists</span>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder — Phase 5 will populate these */}
      <div className="profile-sections">
        <section className="profile-section">
          <h2 className="profile-section__title">Recent Reviews</h2>
          <p className="reviews-section__empty">No reviews yet.</p>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">Recent Ratings</h2>
          <p className="reviews-section__empty">No ratings yet.</p>
        </section>
      </div>
    </main>
  )
}
