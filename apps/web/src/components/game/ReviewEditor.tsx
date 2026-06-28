'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { useInteractionPermissions } from '@/hooks/useInteractionPermissions'
import { useCreateReview } from '@/hooks/api/useCreateReview'
import { useUpdateReview } from '@/hooks/api/useUpdateReview'
import { draftStorageService } from '@/services/draft-storage.service'

interface ReviewEditorProps {
  gameId: string
  isOpen: boolean
  onClose: () => void
  editingReview?:
    | {
        id: string
        title: string | null
        body: string
        status: 'PUBLISHED' | 'DRAFT'
        isSpoiler?: boolean
      }
    | undefined
}

export function ReviewEditor({ gameId, isOpen, onClose, editingReview }: ReviewEditorProps) {
  const { token } = useInteractionPermissions()
  const createMutation = useCreateReview(gameId, token)
  const updateMutation = useUpdateReview(gameId, token)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitting = createMutation.isPending || updateMutation.isPending

  // Load draft from storage if not editing
  useEffect(() => {
    if (!isOpen) return
    if (!editingReview) {
      const saved = draftStorageService.getDraft(gameId)
      if (saved) {
        setTitle(saved.title ?? '')
        setBody(saved.body ?? '')
        setStatus(saved.status ?? 'PUBLISHED')
        setIsSpoiler(saved.isSpoiler ?? false)
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
      draftStorageService.saveDraft(gameId, { title, body, status, isSpoiler })
    }
  }, [title, body, status, isSpoiler, gameId, editingReview, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    if (body.trim().length < 10) {
      setError('Review body must be at least 10 characters long.')
      return
    }

    setError(null)
    const finalTitle = title.trim()
    const finalBody = body.trim()

    try {
      const payload: any = {
        body: finalBody,
        status,
        isSpoiler,
      }
      if (finalTitle) {
        payload.title = finalTitle
      }

      if (editingReview) {
        await updateMutation.mutateAsync({
          reviewId: editingReview.id,
          payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
        draftStorageService.clearDraft(gameId)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.')
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
          <h2 id="composer-title">{editingReview ? 'Edit your review' : 'Write a review'}</h2>
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
                Adds a premium blur card to protect other players from spoilers.
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
                <Loader2
                  size={16}
                  className="spinner search-spin"
                  style={{ animation: 'search-spin 0.8s linear infinite' }}
                />
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
