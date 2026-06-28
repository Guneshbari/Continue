'use client'

import { useState } from 'react'
import { List, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { AddToListDialog } from './AddToListDialog'

interface Props {
  gameId: string
  gameTitle: string
}

export function AddToListButton({ gameId, gameTitle }: Props) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <div className="add-to-list">
        <button
          className="add-to-list__trigger"
          onClick={() => (window.location.href = '/login')}
          title={`Add ${gameTitle} to a list`}
        >
          <List size={16} aria-hidden="true" />
          Add to List
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="add-to-list">
      <button
        className="add-to-list__trigger"
        onClick={() => setOpen(true)}
        title={`Add ${gameTitle} to a list`}
      >
        <List size={16} aria-hidden="true" />
        Add to List
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      <AddToListDialog
        gameId={gameId}
        gameTitle={gameTitle}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
