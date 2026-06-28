'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X, Globe, Eye, Lock, Loader2, List } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { listsApi, type ListSummary } from '@/lib/api/lists'

type Props = Readonly<{
  initialLists: ListSummary[]
  username: string
}>

const visibilityIcon = {
  PUBLIC: <Globe size={12} aria-label="Public" />,
  UNLISTED: <Eye size={12} aria-label="Unlisted" />,
  PRIVATE: <Lock size={12} aria-label="Private" />,
}

export function UserListsManager({ initialLists, username }: Props) {
  const { user, token } = useAuth()
  const [lists, setLists] = useState<ListSummary[]>(initialLists)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'UNLISTED'>('PUBLIC')
  const [error, setError] = useState<string | null>(null)

  const isOwner = user?.username === username

  const handleCreate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token || !title.trim()) return
    setLoading(true)
    setError(null)

    try {
      const newList = await listsApi.create(token, {
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        visibility,
      })
      setLists((prev) => [newList, ...prev])
      setTitle('')
      setDescription('')
      setVisibility('PUBLIC')
      setOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-lists-manager">
      <div className="user-lists-page__header">
        <h1 className="user-lists-page__heading">
          <List size={22} aria-hidden="true" />
          {username}'s Lists
        </h1>
        <div className="user-lists-page__actions">
          {isOwner && (
            <button className="btn btn--primary btn--icon" onClick={() => setOpen(true)}>
              <Plus size={16} />
              Create List
            </button>
          )}
          <Link href={`/u/${username}`} className="user-lists-page__back">
            ← Profile
          </Link>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <dialog className="list-modal" open aria-labelledby="modal-title">
          <button
            type="button"
            className="list-modal__backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close modal"
          />
          <div className="list-modal__content">
            <div className="list-modal__header">
              <h2 id="modal-title">Create a new list</h2>
              <button
                className="list-modal__close"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="list-modal__form">
              {error && <div className="list-modal__error">{error}</div>}

              <div className="list-modal__field">
                <label htmlFor="list-title">Title</label>
                <input
                  id="list-title"
                  required
                  placeholder="e.g. My Backlog 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  autoFocus
                />
              </div>

              <div className="list-modal__field">
                <label htmlFor="list-desc">Description (optional)</label>
                <textarea
                  id="list-desc"
                  placeholder="What is this list about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={400}
                  rows={3}
                />
              </div>

              <div className="list-modal__field">
                <label htmlFor="list-vis">Visibility</label>
                <select
                  id="list-vis"
                  value={visibility}
                  onChange={(e) => {
                    setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE' | 'UNLISTED')
                  }}
                >
                  <option value="PUBLIC">Public - visible to anyone</option>
                  <option value="UNLISTED">Unlisted - link holders only</option>
                  <option value="PRIVATE">Private - only visible to you</option>
                </select>
              </div>

              <div className="list-modal__footer">
                <button type="button" className="btn btn--secondary" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading || !title.trim()}
                >
                  {loading ? <Loader2 size={16} className="add-to-list__spinner" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Grid */}
      {lists.length === 0 ? (
        <div className="user-lists-page__empty">
          <p>No lists yet.</p>
        </div>
      ) : (
        <ul className="lists-grid">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/lists/${list.slug}`} className="list-card">
                <div className="list-card__covers" aria-hidden="true">
                  <div className="list-card__cover-placeholder" />
                </div>
                <div className="list-card__body">
                  <div className="list-card__title-row">
                    <span className="list-card__title">{list.title}</span>
                    <span className="list-card__visibility">{visibilityIcon[list.visibility]}</span>
                  </div>
                  {list.description && <p className="list-card__desc">{list.description}</p>}
                  <span className="list-card__count">
                    {list._count.items} {list._count.items === 1 ? 'game' : 'games'}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
