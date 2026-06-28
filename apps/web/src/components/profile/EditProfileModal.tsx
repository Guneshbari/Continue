'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { usersApi } from '@/lib/api/users'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
  initialProfile: {
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  }
  onSave: (updatedProfile: {
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  }) => void
}

export function EditProfileModal({
  isOpen,
  onClose,
  token,
  initialProfile,
  onSave,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName ?? '')
  const [bio, setBio] = useState(initialProfile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Escape key close listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: any = {}
      if (displayName.trim()) payload.displayName = displayName.trim()
      if (bio.trim()) payload.bio = bio.trim()
      if (avatarUrl.trim()) payload.avatarUrl = avatarUrl.trim()

      const updated = await usersApi.updateProfile(token, payload)
      onSave({
        displayName: updated.displayName,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="list-modal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <button
        type="button"
        className="list-modal__backdrop"
        onClick={onClose}
        aria-label="Close edit profile modal"
      />
      <div className="list-modal__content" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="list-modal__header">
          <h2
            id="edit-profile-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              letterSpacing: '0.03em',
            }}
          >
            Edit Profile
          </h2>
          <button className="list-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="list-modal__form">
          {error && <div className="list-modal__error">{error}</div>}

          <div className="list-modal__field">
            <label
              htmlFor="display-name"
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem',
              }}
            >
              Display Name
            </label>
            <input
              id="display-name"
              placeholder="Your public name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={64}
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="list-modal__field">
            <label
              htmlFor="bio-input"
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem',
              }}
            >
              Bio
            </label>
            <textarea
              id="bio-input"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-text-primary)',
                resize: 'none',
              }}
            />
          </div>

          <div className="list-modal__field">
            <label
              htmlFor="avatar-url"
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem',
              }}
            >
              Avatar URL
            </label>
            <input
              id="avatar-url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              maxLength={2000}
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="list-modal__footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
