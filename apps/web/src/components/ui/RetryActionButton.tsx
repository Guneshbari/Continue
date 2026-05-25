'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'

interface RetryActionButtonProps {
  onClick: () => Promise<void> | void
  label?: string
  className?: string
}

export function RetryActionButton({
  onClick,
  label = 'Try Again',
  className,
}: RetryActionButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleRetry = async () => {
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className={className || 'pagination-loader-btn'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      aria-busy={loading}
      aria-label={loading ? 'Retrying' : label}
    >
      <RotateCw size={14} className={loading ? 'spin' : ''} aria-hidden="true" />
      <span>{loading ? 'Retrying…' : label}</span>
    </button>
  )
}
