'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Loader2, Bookmark, Flame, CheckCircle, Trash2 } from 'lucide-react'
import { useLibraryStatus } from '@/hooks/api/useLibraryStatus'
import { useInteractionPermissions } from '@/hooks/useInteractionPermissions'
import type { LibraryStatus } from '@/lib/api/library-api'

interface LibraryStatusSelectorProps {
  gameId: string
}

export function LibraryStatusSelector({ gameId }: LibraryStatusSelectorProps) {
  const { guardAction, username, token } = useInteractionPermissions()
  const { status, setStatus, isSettingStatus, isLoading } = useLibraryStatus(gameId, username, token)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const statusOptions: { value: LibraryStatus; label: string; icon: any }[] = [
    { value: 'backlog', label: 'Backlog', icon: <Bookmark size={14} /> },
    { value: 'playing', label: 'Playing', icon: <Flame size={14} /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
    { value: 'dropped', label: 'Dropped', icon: <Trash2 size={14} /> },
    { value: 'wishlist', label: 'Wishlist', icon: <Bookmark size={14} style={{ opacity: 0.7 }} /> },
  ]

  const currentOption = statusOptions.find((o) => o.value === status)

  const handleSelect = async (val: LibraryStatus) => {
    setDropdownOpen(false)
    guardAction(() => {
      const nextStatus = status === val ? 'none' : val
      setStatus(nextStatus).catch(() => {})
    })
  }

  // Handle outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  if (isLoading) {
    return (
      <div className="library-status-loading">
        <Loader2 size={14} className="spinner search-spin" style={{ animation: 'search-spin 0.8s linear infinite' }} />
        <span>Syncing catalog...</span>
      </div>
    )
  }

  return (
    <div className="library-status-selector" ref={menuRef}>
      <div className="catalog-toggles-dropdown">
        <button
          type="button"
          onClick={() => guardAction(() => setDropdownOpen((v) => !v))}
          className={`catalog-trigger-btn ${status !== 'none' ? 'catalog-trigger-btn--active' : ''}`}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
        >
          {isSettingStatus ? (
            <Loader2 size={14} className="spinner search-spin" style={{ animation: 'search-spin 0.8s linear infinite' }} />
          ) : (
            currentOption?.icon ?? <Bookmark size={14} />
          )}
          <span>{currentOption?.label ?? 'Add to Catalog'}</span>
        </button>

        {dropdownOpen && (
          <div className="catalog-dropdown-menu" role="listbox">
            {statusOptions.map((opt) => {
              const active = status === opt.value
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(opt.value)}
                  className={`catalog-dropdown-item ${active ? 'catalog-dropdown-item--active' : ''}`}
                >
                  <span className="catalog-dropdown-item-icon">{opt.icon}</span>
                  <span className="catalog-dropdown-item-label">{opt.label}</span>
                  {active && <Check size={12} className="catalog-dropdown-item-check" />}
                </button>
              )
            })}
            {status !== 'none' && (
              <button
                role="option"
                aria-selected={false}
                onClick={() => handleSelect('none')}
                className="catalog-dropdown-item catalog-dropdown-item--remove"
              >
                <Trash2 size={12} />
                <span>Remove Status</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
