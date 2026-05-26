import Link from 'next/link'
import { Compass, MoveLeft } from 'lucide-react'
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer'

/**
 * Root Editorial 404 Fallback
 * Quiet visual space directing users back to main indexing branches.
 */
export default function NotFound() {
  return (
    <ResponsiveContainer as="main" className="error-fallback-wrapper" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div className="error-card">
        <div className="error-card__icon-wrap" style={{ backgroundColor: 'var(--color-surface-sunken)' }}>
          <Compass size={48} className="error-card__icon" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <h1 className="error-card__title">Journey Lost</h1>
        <p className="error-card__desc">
          The catalog path or dynamic collection list you requested does not exist.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <Link
            href="/discover"
            className="error-card__retry-btn"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            Explore Catalog
          </Link>
          <Link
            href="/"
            className="navbar__btn-ghost"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', margin: 0, padding: '0.625rem' }}
          >
            <MoveLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
