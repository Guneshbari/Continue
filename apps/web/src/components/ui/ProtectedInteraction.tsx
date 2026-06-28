'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

interface ProtectedInteractionProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedInteraction({ children, fallback }: ProtectedInteractionProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div
        className="skeleton-pulse"
        style={{ width: '100%', height: '200px', borderRadius: '12px' }}
        aria-hidden="true"
      />
    )
  }

  if (!user) {
    if (fallback) return <>{fallback}</>

    return (
      <div
        className="games-grid-empty"
        style={{ maxWidth: '400px', marginInline: 'auto', padding: '3rem 1.5rem' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'var(--color-accent)',
          }}
        >
          <Lock size={32} aria-hidden="true" />
        </div>
        <h2 className="games-grid-empty__title" style={{ fontSize: '1.25rem' }}>
          Authentication Required
        </h2>
        <p className="games-grid-empty__sub" style={{ margin: '0.75rem 0 1.5rem' }}>
          Please sign in to access this interactive collection and discovery feature.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/login')}
            className="pagination-loader-btn"
            aria-label="Sign in"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/')}
            className="pagination-loader-btn pagination-loader-btn--secondary"
            aria-label="Go home"
          >
            Back Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
