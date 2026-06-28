'use client'

import { AlertOctagon } from 'lucide-react'

interface GlobalErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function GlobalErrorState({
  title = 'Something went wrong',
  message = 'We had trouble loading this section. Please try again.',
  onRetry,
}: GlobalErrorStateProps) {
  return (
    <div
      className="games-grid-empty"
      style={{ borderColor: 'var(--color-error)' }}
      role="alert"
      aria-live="assertive"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          color: 'var(--color-error)',
        }}
      >
        <AlertOctagon size={32} aria-hidden="true" />
      </div>
      <h3
        className="games-grid-empty__title"
        style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p className="games-grid-empty__sub" style={{ margin: '0.5rem 0 1.5rem' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="pagination-loader-btn"
          aria-label="Retry loading content"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
