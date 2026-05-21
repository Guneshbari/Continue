'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, X, List, ChevronDown, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { listsApi, type ListSummary } from '@/lib/api/lists'

interface Props {
  gameId: string
  gameTitle: string
}

export function AddToListButton({ gameId, gameTitle }: Props) {
  const { user, token } = useAuth()
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<ListSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  // Load user's lists when dropdown opens
  useEffect(() => {
    if (!open || !user || !token) return
    setLoading(true)
    listsApi.byUser(user.username, token)
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false))
  }, [open, user, token])

  if (!user) return null

  const handleAdd = async (listId: string) => {
    if (!token || adding) return
    setAdding(listId)
    try {
      await listsApi.addItem(listId, token, gameId)
      setAdded((prev) => new Set(prev).add(listId))
    } catch {
      // Already in list — mark as added anyway
      setAdded((prev) => new Set(prev).add(listId))
    } finally {
      setAdding(null)
    }
  }

  const handleCreate = async () => {
    if (!token || !newTitle.trim()) return
    setAdding('new')
    setCreateError(null)
    try {
      const list = await listsApi.create(token, { title: newTitle.trim() })
      setLists((prev) => [list, ...prev])
      setNewTitle('')
      setCreating(false)
      await listsApi.addItem(list.id, token, gameId)
      setAdded((prev) => new Set(prev).add(list.id))
    } catch (err) {
      console.error('[AddToList] create failed:', err)
      const msg = err instanceof Error ? err.message : 'Failed to create list'
      setCreateError(msg)
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="add-to-list" style={{ position: 'relative' }}>
      <button
        className="add-to-list__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={`Add ${gameTitle} to a list`}
      >
        <List size={16} aria-hidden="true" />
        Add to List
        <ChevronDown size={14} aria-hidden="true" className={open ? 'add-to-list__chevron--open' : ''} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="add-to-list__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="add-to-list__dropdown" role="listbox" aria-label="Your lists">
            <div className="add-to-list__header">
              <span>Your lists</span>
              <button onClick={() => setOpen(false)} className="add-to-list__close" aria-label="Close">
                <X size={14} />
              </button>
            </div>

            {loading && (
              <div className="add-to-list__loading">
                <Loader2 size={16} className="add-to-list__spinner" />
              </div>
            )}

            {!loading && lists.length === 0 && !creating && (
              <p className="add-to-list__empty">No lists yet.</p>
            )}

            {!loading && lists.map((list) => {
              const isAdded = added.has(list.id)
              const isAdding = adding === list.id
              return (
                <button
                  key={list.id}
                  className={`add-to-list__item ${isAdded ? 'add-to-list__item--added' : ''}`}
                  onClick={() => !isAdded && handleAdd(list.id)}
                  disabled={isAdding}
                  role="option"
                  aria-selected={isAdded}
                >
                  <span className="add-to-list__item-title">{list.title}</span>
                  <span className="add-to-list__item-count">{list._count.items}</span>
                  {isAdding
                    ? <Loader2 size={14} className="add-to-list__spinner" />
                    : isAdded
                      ? <Check size={14} className="add-to-list__check" />
                      : <Plus size={14} aria-hidden="true" />
                  }
                </button>
              )
            })}

            {/* Create new list */}
            {creating ? (
              <div className="add-to-list__new">
                <input
                  autoFocus
                  className="add-to-list__new-input"
                  placeholder="List name…"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setCreateError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  maxLength={80}
                />
                {createError && (
                  <p className="add-to-list__new-error">{createError}</p>
                )}
                <div className="add-to-list__new-actions">
                  <button 
                    type="button" 
                    className="add-to-list__new-cancel" 
                    onClick={() => { setCreating(false); setCreateError(null) }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="add-to-list__new-save"
                    onClick={handleCreate}
                    disabled={!newTitle.trim() || adding === 'new'}
                  >
                    {adding === 'new' ? <Loader2 size={14} className="add-to-list__spinner" /> : 'Create'}
                  </button>
                </div>
              </div>
            ) : (
              <button className="add-to-list__create" onClick={() => setCreating(true)}>
                <Plus size={14} aria-hidden="true" />
                New list
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
