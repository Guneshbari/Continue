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
  Layers
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
        <div className="fixed bottom-6 right-6 z-overlay bg-error text-text-primary px-4 py-3 rounded-lg shadow-lg text-xs font-bold animate-pulse">
          {reorderError}
        </div>
      )}

      {/* Header Container */}
      <header className="relative p-6 md:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-xl">
        {isEditingMetadata ? (
          <form onSubmit={handleSaveMetadata} className="flex flex-col gap-4">
            {metaError && <div className="list-modal__error">{metaError}</div>}
            
            <div className="flex flex-col gap-1">
              <label htmlFor="edit-title" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Title</label>
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
              <label htmlFor="edit-desc" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</label>
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
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="edit-visibility" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Visibility</label>
                <select
                  id="edit-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="bg-surface-sunken border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
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
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  {visibilityIcon[list.visibility]}
                  {list.visibility} List
                </span>
                {syncing && (
                  <span className="text-[10px] text-accent font-semibold animate-pulse flex items-center gap-1">
                    <Loader2 size={10} className="spinner" /> Reordering synced...
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight mb-2">
                {list.title}
              </h1>

              {list.description ? (
                <p className="text-sm text-text-secondary leading-relaxed max-w-2xl select-text">
                  {list.description}
                </p>
              ) : (
                isCurator && (
                  <button
                    onClick={() => setIsEditingMetadata(true)}
                    className="text-xs text-text-muted italic hover:underline"
                  >
                    Add a description for this collection...
                  </button>
                )
              )}

              <div className="flex items-center gap-3 mt-4 text-xs font-medium">
                <span className="text-text-muted">Curated by</span>
                <Link href={`/u/${list.user.username}`} className="font-bold text-text-secondary hover:text-accent transition-colors flex items-center gap-1.5">
                  {list.user.avatarUrl && (
                    <img src={list.user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover border border-border" />
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
              <div className="flex flex-col md:flex-row gap-2 shrink-0 w-full md:w-auto">
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
        <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-surface-raised border border-border-subtle text-center min-h-[220px]">
          <Layers size={36} className="text-text-muted mb-4 animate-pulse" aria-hidden="true" />
          <h3 className="text-lg font-bold text-text-primary mb-1">List is empty</h3>
          <p className="text-sm text-text-muted max-w-sm">
            {isCurator
              ? 'Find your favorite games and click "Add to List" on their pages to build your collection!'
              : 'This curator has not added any games to this collection yet.'}
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-4 list-none m-0 p-0" role="list">
          {items.map((item, index) => {
            const isDragging = draggedIndex === index

            return (
              <li
                key={item.id}
                draggable={isReordering}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-4 p-4 rounded-xl bg-surface-raised border transition-all ${
                  isDragging ? 'opacity-40 scale-95 border-accent' : 'border-border-subtle'
                } ${isReordering ? 'cursor-grab active:cursor-grabbing hover:border-border' : ''}`}
              >
                {/* Position Badge */}
                <span className="text-sm font-extrabold text-text-muted w-6 text-center select-none" aria-hidden="true">
                  {index + 1}
                </span>

                {/* Cover Poster */}
                <Link
                  href={`/games/${item.game.slug}`}
                  className="relative flex-shrink-0 w-12 aspect-[3/4] rounded-md overflow-hidden bg-surface-sunken border border-border-subtle shadow-md"
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
                    <div className="w-100% h-100 bg-gradient-to-br from-surface-overlay to-surface-raised" />
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="text-sm font-bold text-text-primary hover:text-accent transition-colors truncate"
                    >
                      {item.game.title}
                    </Link>
                    {item.game.releaseDate && (
                      <span className="text-[10px] text-text-muted font-semibold">
                        ({new Date(item.game.releaseDate).getFullYear()})
                      </span>
                    )}
                  </div>

                  {item.note ? (
                    <p className="text-xs text-text-secondary italic leading-relaxed truncate select-text">
                      "{item.note}"
                    </p>
                  ) : (
                    isCurator && !isReordering && (
                      <span className="text-[10px] text-text-muted italic">No note added.</span>
                    )
                  )}
                </div>

                {/* Score */}
                {item.game.avgRating !== null && (
                  <div className="flex items-center gap-1 text-xs text-warning font-bold mr-2 select-none" aria-label={`Avg score: ${item.game.avgRating.toFixed(1)}`}>
                    <Star size={11} className="fill-current" />
                    <span>{item.game.avgRating.toFixed(1)}</span>
                  </div>
                )}

                {/* Keyboard Reordering Controls */}
                {isReordering && (
                  <div className="flex items-center gap-1.5 shrink-0" aria-label="Reorder actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'TOP')}
                      title="Move to Top"
                      className="p-1.5 rounded bg-surface-sunken hover:bg-surface-overlay border border-border-subtle disabled:opacity-30 disabled:pointer-events-none text-text-secondary hover:text-accent transition-colors"
                    >
                      ⤒
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'UP')}
                      title="Move Up"
                      className="p-1.5 rounded bg-surface-sunken hover:bg-surface-overlay border border-border-subtle disabled:opacity-30 disabled:pointer-events-none text-text-secondary hover:text-accent transition-colors flex items-center justify-center"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 'DOWN')}
                      title="Move Down"
                      className="p-1.5 rounded bg-surface-sunken hover:bg-surface-overlay border border-border-subtle disabled:opacity-30 disabled:pointer-events-none text-text-secondary hover:text-accent transition-colors flex items-center justify-center"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 'BOTTOM')}
                      title="Move to Bottom"
                      className="p-1.5 rounded bg-surface-sunken hover:bg-surface-overlay border border-border-subtle disabled:opacity-30 disabled:pointer-events-none text-text-secondary hover:text-accent transition-colors"
                    >
                      ⤓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteListItem(item.game.id)}
                      title="Remove game"
                      className="p-1.5 rounded bg-surface-sunken hover:bg-error/10 hover:border-error/20 border border-border-subtle text-text-secondary hover:text-error transition-colors flex items-center justify-center"
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
