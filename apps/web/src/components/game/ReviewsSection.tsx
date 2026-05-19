'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { reviewsApi } from '@/lib/api/interactions'
import { Loader2 } from 'lucide-react'

interface Review {
  id: string
  title: string | null
  body: string
  createdAt: string
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
}

export function ReviewsSection({ gameId }: { gameId: string }) {
  const { user, accessToken } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reviewsApi.list(gameId, 10).then((res: { data: Review[] }) => {
      setReviews(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [gameId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return
    setSubmitting(true)
    setError(null)
    try {
      const review = await reviewsApi.create(gameId, { title: title || undefined, body }, accessToken) as Review
      setReviews((prev) => [review, ...prev])
      setShowForm(false)
      setBody('')
      setTitle('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post review'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="reviews-section" aria-label="Reviews">
      <div className="reviews-section__header">
        <h2 className="reviews-section__title">Reviews</h2>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="reviews-section__write-btn">
            Write a review
          </button>
        )}
        {!user && (
          <a href="/login" className="reviews-section__write-btn reviews-section__write-btn--ghost">
            Sign in to review
          </a>
        )}
      </div>

      {/* Write form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          {error && <p className="auth-form__error">{error}</p>}
          <div className="form-field">
            <label htmlFor="review-title" className="form-label">Title (optional)</label>
            <input
              id="review-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Sum it up in a line..."
            />
          </div>
          <div className="form-field">
            <label htmlFor="review-body" className="form-label">Review <span aria-hidden="true">*</span></label>
            <textarea
              id="review-body"
              className="form-input review-form__textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={10}
              maxLength={10000}
              required
              placeholder="Share your thoughts..."
            />
          </div>
          <div className="review-form__actions">
            <button type="button" onClick={() => setShowForm(false)} className="review-form__cancel">
              Cancel
            </button>
            <button type="submit" disabled={submitting || body.length < 10} className="auth-form__submit review-form__submit">
              {submitting ? <><Loader2 size={14} className="spin" /> Posting…</> : 'Post review'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="reviews-section__empty">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="reviews-section__empty">No reviews yet. Be the first!</p>
      ) : (
        <ul className="reviews-list" role="list">
          {reviews.map((r) => (
            <li key={r.id} className="review-card">
              <div className="review-card__meta">
                <span className="review-card__author">
                  <a href={`/users/${r.user.username}`} className="review-card__author-link">
                    {r.user.displayName ?? r.user.username}
                  </a>
                </span>
                <time className="review-card__date" dateTime={r.createdAt}>
                  {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>
              </div>
              {r.title && <h3 className="review-card__title">{r.title}</h3>}
              <p className="review-card__body">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
