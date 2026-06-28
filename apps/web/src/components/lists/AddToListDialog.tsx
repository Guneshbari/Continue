'use client'

import { useState } from 'react'
import { Plus, Check, X, Loader2 } from 'lucide-react'
import { useInteractionPermissions } from '@/hooks/useInteractionPermissions'
import { useQuery } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'
import { useAddGameToList } from '@/hooks/api/useAddGameToList'
import { useCreateList } from '@/hooks/api/useCreateList'

interface Props {
  gameId: string
  gameTitle: string
  isOpen: boolean
  onClose: () => void
}

export function AddToListDialog({ gameId, gameTitle, isOpen, onClose }: Props) {
  const { username, token } = useInteractionPermissions()
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const {
    data: lists = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users', username, 'lists', { gameId }],
    queryFn: () => {
      if (!username) return []
      return listsApi.byUser(username, token, gameId)
    },
    enabled: isOpen && !!username,
  })

  const { addGame, removeGame, isAdding, isRemoving } = useAddGameToList(username, token)
  const createListMutation = useCreateList(username, token)

  const handleToggle = async (listId: string, hasGame: boolean) => {
    try {
      if (hasGame) {
        await removeGame({ listId, gameId })
      } else {
        await addGame({ listId, gameId })
      }
      refetch()
    } catch {
      // ignore mutation errors
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreateError(null)
    try {
      const list = await createListMutation.mutateAsync({
        title: newTitle.trim(),
        visibility: 'PRIVATE',
      })
      setNewTitle('')
      setCreating(false)
      await addGame({ listId: list.id, gameId })
      refetch()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create list')
    }
  }

  if (!isOpen) return null

  return (
    <dialog className="list-modal" open aria-labelledby="add-to-list-title">
      <button
        type="button"
        className="list-modal__backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="list-modal__content">
        <div className="list-modal__header">
          <h2 id="add-to-list-title">Collect "{gameTitle}"</h2>
          <button className="list-modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="list-modal__form">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2
                className="spinner search-spin"
                style={{ animation: 'search-spin 0.8s linear infinite' }}
              />
            </div>
          ) : (
            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
              {lists.map((list) => {
                const hasGame = list.items && list.items.length > 0
                return (
                  <button
                    key={list.id}
                    className={`add-to-list__item ${hasGame ? 'add-to-list__item--added' : ''}`}
                    onClick={() => handleToggle(list.id, !!hasGame)}
                    disabled={isAdding || isRemoving}
                  >
                    <span className="add-to-list__item-title">{list.title}</span>
                    <span className="add-to-list__item-count">{list._count.items}</span>
                    {hasGame ? (
                      <Check size={14} className="add-to-list__check" />
                    ) : (
                      <Plus size={14} />
                    )}
                  </button>
                )
              })}
              {lists.length === 0 && !creating && (
                <p className="text-text-muted py-6 text-center text-xs">
                  You have no collections yet.
                </p>
              )}
            </div>
          )}

          {creating ? (
            <div
              className="add-to-list__new"
              style={{
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '1rem',
                marginTop: '1rem',
              }}
            >
              <input
                autoFocus
                className="add-to-list__new-input"
                placeholder="Collection name…"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value)
                  setCreateError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                maxLength={80}
              />
              {createError && <p className="add-to-list__new-error">{createError}</p>}
              <div className="add-to-list__new-actions">
                <button
                  type="button"
                  className="add-to-list__new-cancel"
                  onClick={() => {
                    setCreating(false)
                    setCreateError(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="add-to-list__new-save"
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || createListMutation.isPending}
                >
                  {createListMutation.isPending ? (
                    <Loader2
                      size={14}
                      className="spinner search-spin"
                      style={{ animation: 'search-spin 0.8s linear infinite' }}
                    />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="add-to-list__create"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setCreating(true)}
            >
              <Plus size={14} aria-hidden="true" />
              New Collection
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
