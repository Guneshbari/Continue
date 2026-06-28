'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Globe,
  Eye,
  Lock,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
  Loader2,
  Trash2,
  Layers,
} from 'lucide-react'
import { listsApi, type ListDetail, type ListItem } from '@/lib/api/lists'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'

interface CuratedListDetailProps {
  list: ListDetail
}

const visibilityIcon = {
  PUBLIC: <Globe size={13} aria-label="Public" />,
  UNLISTED: <Eye size={13} aria-label="Unlisted" />,
  PRIVATE: <Lock size={13} aria-label="Private" />,
}

export function CuratedListDetailInteractive({ list }: CuratedListDetailProps) {
  const { user, token } = useAuth()
  const router = useRouter()

  // Edit Metadata State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [description, setDescription] = useState(list.description ?? '')
  const [visibility, setVisibility] = useState(list.visibility)
  const [saveLoading, setSaveLoading] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)

  // Reorder State
  const [isReordering, setIsReordering] = useState(false)
  const [items, setItems] = useState<ListItem[]>(list.items)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Drag State (for progressive enhancement)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const isCurator = user?.username === list.user.username

  // Reset states if list changes
  useEffect(() => {
    setTitle(list.title)
    setDescription(list.description ?? '')
    setVisibility(list.visibility)
    setItems(list.items)
  }, [list])

  // Save metadata changes
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !title.trim()) return
    setSaveLoading(true)
    setMetaError(null)

    try {
      const payload: any = {
        title: title.trim(),
        visibility,
      }
      if (description.trim()) {
        payload.description = description.trim()
      }
      await listsApi.update(list.id, token, payload)
      setIsEditingMetadata(false)
      router.refresh()
    } catch (err: unknown) {
      setMetaError(err instanceof Error ? err.message : 'Failed to update list details')
    } finally {
      setSaveLoading(false)
    }
  }

  // Atomically reorder items with optimistic UI update and rollback
  const handleReorder = async (newItems: ListItem[]) => {
    if (!token) return
    const backup = [...items]

    // 1. Update UI Optimistically
    setItems(newItems)
    setReorderError(null)
    setSyncing(true)

    try {
      const gameIds = newItems.map((item) => item.game.id)
      // 2. Dispatch atomic API transaction
      await listsApi.reorderItems(list.id, gameIds, token)
    } catch {
      // 3. Rollback on Failure
      setItems(backup)
      setReorderError('Reordering failed. Changes rolled back.')
      // Auto-clear error banner after 4 seconds
      setTimeout(() => setReorderError(null), 4000)
    } finally {
      setSyncing(false)
    }
  }

  // Keyboard reorder movements
  const moveItem = (index: number, direction: 'UP' | 'DOWN' | 'TOP' | 'BOTTOM') => {
    if (index < 0 || index >= items.length) return
    const newItems = [...items]
    const target = newItems[index]
    if (!target) return

    if (direction === 'UP' && index > 0) {
      newItems.splice(index, 1)
      newItems.splice(index - 1, 0, target)
    } else if (direction === 'DOWN' && index < items.length - 1) {
      newItems.splice(index, 1)
      newItems.splice(index + 1, 0, target)
    } else if (direction === 'TOP') {
      newItems.splice(index, 1)
      newItems.unshift(target)
    } else if (direction === 'BOTTOM') {
      newItems.splice(index, 1)
      newItems.push(target)
    }

    // Set positions index-based
    const repositionedItems = newItems.map((item, idx) => ({
      ...item,
      position: idx,
    }))

    handleReorder(repositionedItems)
  }

  // Drag and Drop (Progressive Enhancement)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isReordering) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const target = newItems[draggedIndex]
    if (!target) return

    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, target)

    const repositionedItems = newItems.map((item, idx) => ({
      ...item,
      position: idx,
    }))

    setDraggedIndex(null)
    handleReorder(repositionedItems)
  }

  const handleDeleteListItem = async (gameId: string) => {
    if (!token) return
    if (!confirm('Remove game from this collection?')) return

    try {
      await listsApi.removeItem(list.id, gameId, token)
      setItems((prev) => prev.filter((item) => item.game.id !== gameId))
      router.refresh()
    } catch {
      alert('Failed to remove game')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Reorder sync status / error banner */}
      {reorderError && (
        <div className="z-overlay bg-error text-text-primary fixed bottom-6 right-6 animate-pulse rounded-lg px-4 py-3 text-xs font-bold shadow-lg">
          {reorderError}
        </div>
      )}

      {/* Header Container */}
      <header className="bg-surface-raised border-border-subtle relative rounded-2xl border p-6 shadow-xl md:p-8">
        {isEditingMetadata ? (
          <form onSubmit={handleSaveMetadata} className="flex flex-col gap-4">
            {metaError && <div className="list-modal__error">{metaError}</div>}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="edit-title"
                className="text-text-muted text-[10px] font-bold uppercase tracking-wider"
              >
                Title
              </label>
              <input
                id="edit-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                style={{
                  background: 'var(--color-surface-sunken)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'bold',
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="edit-desc"
                className="text-text-muted text-[10px] font-bold uppercase tracking-wider"
              >
                Description
              </label>
              <textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
                rows={3}
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

            <div className="flex items-center gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <label
                  htmlFor="edit-visibility"
                  className="text-text-muted text-[10px] font-bold uppercase tracking-wider"
                >
                  Visibility
                </label>
                <select
                  id="edit-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="bg-surface-sunken border-border text-text-primary rounded-md border px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNLISTED">Unlisted</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="flex gap-2 self-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingMetadata(false)
                    setTitle(list.title)
                    setDescription(list.description ?? '')
                    setVisibility(list.visibility)
                  }}
                  className="btn btn--secondary btn--sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saveLoading}>
                  {saveLoading ? <Loader2 size={12} className="spinner" /> : <Check size={14} />}
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-text-muted flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                  {visibilityIcon[list.visibility]}
                  {list.visibility} List
                </span>
                {syncing && (
                  <span className="text-accent flex animate-pulse items-center gap-1 text-[10px] font-semibold">
                    <Loader2 size={10} className="spinner" /> Reordering synced...
                  </span>
                )}
              </div>

              <h1 className="text-text-primary mb-2 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                {list.title}
              </h1>

              {list.description ? (
                <p className="text-text-secondary max-w-2xl select-text text-sm leading-relaxed">
                  {list.description}
                </p>
              ) : (
                isCurator && (
                  <button
                    onClick={() => setIsEditingMetadata(true)}
                    className="text-text-muted text-xs italic hover:underline"
                  >
                    Add a description for this collection...
                  </button>
                )
              )}

              <div className="mt-4 flex items-center gap-3 text-xs font-medium">
                <span className="text-text-muted">Curated by</span>
                <Link
                  href={`/u/${list.user.username}`}
                  className="text-text-secondary hover:text-accent flex items-center gap-1.5 font-bold transition-colors"
                >
                  {list.user.avatarUrl && (
                    <img
                      src={list.user.avatarUrl}
                      alt=""
                      className="border-border h-5 w-5 rounded-full border object-cover"
                    />
                  )}
                  {list.user.displayName ?? list.user.username}
                </Link>
                <span className="text-border-strong">•</span>
                <span className="text-text-muted font-bold">
                  {items.length} {items.length === 1 ? 'game' : 'games'}
                </span>
              </div>
            </div>

            {/* Curator Tools Panel */}
            {isCurator && token && (
              <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto md:flex-row">
                <button
                  onClick={() => setIsEditingMetadata(true)}
                  className="btn btn--secondary btn--sm btn--icon justify-center"
                >
                  <Edit2 size={13} />
                  Edit Info
                </button>

                <button
                  onClick={() => setIsReordering(!isReordering)}
                  className={`btn btn--sm justify-center ${
                    isReordering ? 'btn--primary' : 'btn--secondary'
                  }`}
                >
                  {isReordering ? 'Finish Arrange' : 'Arrange Collection'}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="bg-surface-raised border-border-subtle flex min-h-[220px] flex-col items-center justify-center rounded-xl border p-12 text-center">
          <Layers size={36} className="text-text-muted mb-4 animate-pulse" aria-hidden="true" />
          <h3 className="text-text-primary mb-1 text-lg font-bold">List is empty</h3>
          <p className="text-text-muted max-w-sm text-sm">
            {isCurator
              ? 'Find your favorite games and click "Add to List" on their pages to build your collection!'
              : 'This curator has not added any games to this collection yet.'}
          </p>
        </div>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0" role="list">
          {items.map((item, index) => {
            const isDragging = draggedIndex === index

            return (
              <li
                key={item.id}
                draggable={isReordering}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-surface-raised flex items-center gap-4 rounded-xl border p-4 transition-all ${
                  isDragging ? 'border-accent scale-95 opacity-40' : 'border-border-subtle'
                } ${isReordering ? 'hover:border-border cursor-grab active:cursor-grabbing' : ''}`}
              >
                {/* Position Badge */}
                <span
                  className="text-text-muted w-6 select-none text-center text-sm font-extrabold"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                {/* Cover Poster */}
                <Link
                  href={`/games/${item.game.slug}`}
                  className="bg-surface-sunken border-border-subtle relative aspect-[3/4] w-12 flex-shrink-0 overflow-hidden rounded-md border shadow-md"
                >
                  {item.game.coverUrl ? (
                    <Image
                      src={item.game.coverUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-100% h-100 from-surface-overlay to-surface-raised bg-gradient-to-br" />
                  )}
                </Link>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline gap-2">
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="text-text-primary hover:text-accent truncate text-sm font-bold transition-colors"
                    >
                      {item.game.title}
                    </Link>
                    {item.game.releaseDate && (
                      <span className="text-text-muted text-[10px] font-semibold">
                        ({new Date(item.game.releaseDate).getFullYear()})
                      </span>
                    )}
                  </div>

                  {item.note ? (
                    <p className="text-text-secondary select-text truncate text-xs italic leading-relaxed">
                      "{item.note}"
                    </p>
                  ) : (
                    isCurator &&
                    !isReordering && (
                      <span className="text-text-muted text-[10px] italic">No note added.</span>
                    )
                  )}
                </div>

                {/* Score */}
                {item.game.avgRating !== null && (
                  <div
                    className="text-warning mr-2 flex select-none items-center gap-1 text-xs font-bold"
                    aria-label={`Avg score: ${item.game.avgRating.toFixed(1)}`}
                  >
                    <Star size={11} className="fill-current" />
                    <span>{item.game.avgRating.toFixed(1)}</span>
                  </div>
                )}

                {/* Keyboard Reordering Controls */}
                {isReordering && (
                  <div className="flex shrink-0 items-center gap-1.5" aria-label="Reorder actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'TOP')}
                      title="Move to Top"
                      className="bg-surface-sunken hover:bg-surface-overlay border-border-subtle text-text-secondary hover:text-accent rounded border p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                      ⤒
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'UP')}
                      title="Move Up"
                      className="bg-surface-sunken hover:bg-surface-overlay border-border-subtle text-text-secondary hover:text-accent flex items-center justify-center rounded border p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 'DOWN')}
                      title="Move Down"
                      className="bg-surface-sunken hover:bg-surface-overlay border-border-subtle text-text-secondary hover:text-accent flex items-center justify-center rounded border p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 'BOTTOM')}
                      title="Move to Bottom"
                      className="bg-surface-sunken hover:bg-surface-overlay border-border-subtle text-text-secondary hover:text-accent rounded border p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
                    >
                      ⤓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteListItem(item.game.id)}
                      title="Remove game"
                      className="bg-surface-sunken hover:bg-error/10 hover:border-error/20 border-border-subtle text-text-secondary hover:text-error flex items-center justify-center rounded border p-1.5 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
