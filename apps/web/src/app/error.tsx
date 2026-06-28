'use client'

import { useEffect } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global Editorial Error Boundary Fallback
 * Provides quiet, atmospheric notice blocks on runtime crashes.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Root dynamic error captured:', error)
  }, [error])

  return (
    <ResponsiveContainer
      as="main"
      className="error-fallback-wrapper"
      style={{ paddingTop: '6rem', paddingBottom: '6rem' }}
    >
      <div className="error-card" role="alert" aria-live="assertive">
        <div className="error-card__icon-wrap">
          <AlertOctagon size={48} className="error-card__icon" />
        </div>
        <h1 className="error-card__title">System Interruption</h1>
        <p className="error-card__desc">
          An unexpected interruption occurred while loading this page. Our team has been notified.
        </p>
        {error.digest && <code className="error-card__digest">Reference ID: {error.digest}</code>}
        <button
          onClick={reset}
          className="error-card__retry-btn"
          aria-label="Attempt page reload retry"
        >
          <RotateCcw
            size={16}
            style={{
              display: 'inline',
              marginRight: '0.35rem',
              verticalAlign: 'middle',
              marginTop: '-2px',
            }}
          />
          Retry Page
        </button>
      </div>
    </ResponsiveContainer>
  )
}
