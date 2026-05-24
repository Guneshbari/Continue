'use client'

import { useState, useEffect, SyntheticEvent } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { reviewsApi } from '@/lib/api/interactions'

interface ReviewComposerProps {
  gameId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (review: any) => void
  editingReview?: {
    id: string
    title: string | null
    body: string
    status: 'PUBLISHED' | 'DRAFT'
    isSpoiler?: boolean
  } | undefined
}

export function ReviewComposer({
  gameId,
  isOpen,
  onClose,
  onSuccess,
  editingReview,
}: ReviewComposerProps) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load draft from sessionStorage if not editing
  useEffect(() => {
    if (!isOpen) return
    if (!editingReview) {
      const saved = sessionStorage.getItem(`draft-review-${gameId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setTitle(parsed.title ?? '')
          setBody(parsed.body ?? '')
          setStatus(parsed.status ?? 'PUBLISHED')
          setIsSpoiler(parsed.isSpoiler ?? false)
        } catch (e) {
          // ignore invalid draft
        }
      } else {
        setTitle('')
        setBody('')
        setStatus('PUBLISHED')
        setIsSpoiler(false)
      }
    } else {
      setTitle(editingReview.title ?? '')
      setBody(editingReview.body)
      setStatus(editingReview.status)
      setIsSpoiler(editingReview.isSpoiler ?? false)
    }
    setError(null)
  }, [editingReview, isOpen, gameId])

  // Persist draft on changes if not editing
  useEffect(() => {
    if (isOpen && !editingReview) {
      const draft = { title, body, status, isSpoiler }
      sessionStorage.setItem(`draft-review-${gameId}`, JSON.stringify(draft))
    }
  }, [title, body, status, isSpoiler, gameId, editingReview, isOpen])

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    if (body.trim().length < 10) {
      setError('Review body must be at least 10 characters long.')
      return
    }

    setSubmitting(true)
    setError(null)

    const finalTitle = title.trim()
    const finalBody = body.trim()

    try {
      if (editingReview) {
        const res = await reviewsApi.update<any>(
          gameId,
          editingReview.id,
          {
            title: finalTitle || undefined,
            body: finalBody,
            status,
            isSpoiler,
          },
          token,
        )
        onSuccess(res)
      } else {
        const res = await reviewsApi.create<any>(
          gameId,
          {
            title: finalTitle || undefined,
            body: finalBody,
            status,
            isSpoiler,
          },
          token,
        )
        sessionStorage.removeItem(`draft-review-${gameId}`)
        onSuccess(res)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <dialog className="list-modal" open aria-labelledby="composer-title">
      <button
        type="button"
        className="list-modal__backdrop"
        onClick={onClose}
        aria-label="Close review composer"
      />
      <div className="list-modal__content list-modal__content--large">
        <div className="list-modal__header">
          <h2 id="composer-title">
            {editingReview ? 'Edit your review' : 'Write a review'}
          </h2>
          <button className="list-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="list-modal__form">
          {error && <div className="list-modal__error">{error}</div>}

          {/* Title */}
          <div className="list-modal__field">
            <label htmlFor="review-title">Title (optional)</label>
            <input
              id="review-title"
              placeholder="Sum it up in a dynamic headline..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={submitting}
            />
          </div>

          {/* Body */}
          <div className="list-modal__field">
            <label htmlFor="review-body">
              Your Review <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="review-body"
              required
              rows={6}
              placeholder="Share your thoughts on game mechanics, art design, story pacing..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={10}
              maxLength={10000}
              disabled={submitting}
            />
            <span className="review-composer__counter">
              {body.length} / 10000 characters (minimum 10)
            </span>
          </div>

          {/* Configuration Grid */}
          <div className="review-composer__config">
            {/* Status */}
            <div className="list-modal__field">
              <label htmlFor="review-status">Publish Status</label>
              <select
                id="review-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                disabled={submitting}
              >
                <option value="PUBLISHED">Published - visible to everyone</option>
                <option value="DRAFT">Draft - save privately for editing</option>
              </select>
            </div>

            {/* Spoiler Toggle */}
            <div className="review-composer__spoiler-wrap">
              <label className="composer-checkbox-label">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  disabled={submitting}
                />
                <span>Contain Spoilers</span>
              </label>
              <span className="composer-checkbox-hint">
                Adds a premium click-to-reveal blur card to protect other players.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="list-modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--icon"
              disabled={submitting || body.trim().length < 10}
            >
              {submitting ? (
                <Loader2 size={16} className="add-to-list__spinner" />
              ) : (
                <Save size={16} />
              )}
              {editingReview ? 'Save Changes' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

