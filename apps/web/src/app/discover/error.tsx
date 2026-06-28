'use client'

import { useEffect } from 'react'

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Discovery page error:', error)
  }, [error])

  return (
    <main className="site-container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <div className="games-grid-empty" style={{ maxWidth: '480px', marginInline: 'auto' }}>
        <h2
          className="games-grid-empty__title"
          style={{ fontSize: '1.5rem', color: 'var(--color-error)' }}
        >
          Something went wrong
        </h2>
        <p className="games-grid-empty__sub" style={{ margin: '1rem 0 1.5rem' }}>
          We encountered an error loading the discovery content. This might be a temporary network
          glitch.
        </p>
        <button onClick={reset} className="pagination-loader-btn" style={{ width: 'auto' }}>
          Try Again
        </button>
      </div>
    </main>
  )
}
