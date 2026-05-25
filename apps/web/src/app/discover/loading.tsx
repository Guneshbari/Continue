import { Compass } from 'lucide-react'
import { Skeleton } from '@/components/ui/LoadingSkeletonSystem'

export default function DiscoverLoading() {
  return (
    <main className="site-container discovery-layout-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Hero Skeleton */}
      <div className="discovery-page-hero">
        <div className="discovery-page-hero__meta" style={{ width: '100%' }}>
          <Skeleton className="skeleton-line" style={{ width: '160px', height: '0.875rem', marginBottom: '0.75rem' }} />
          <h1 className="discovery-page-hero__title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={36} className="skeleton-pulse" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
            <Skeleton className="skeleton-line" style={{ width: '280px', height: '2.5rem' }} />
          </h1>
          <Skeleton className="skeleton-line" style={{ width: '80%', height: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }} />
          <Skeleton className="skeleton-line" style={{ width: '50%', height: '1.25rem' }} />
        </div>
      </div>

      <div className="discovery-grid-layout">
        {/* Left hand Sidebar Skeleton */}
        <aside className="discovery-sidebar" aria-hidden="true">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Skeleton className="skeleton-line" style={{ width: '80px', height: '1rem', marginBottom: '0.75rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="skeleton-line" style={{ width: '100%', height: '2.25rem', borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="skeleton-line" style={{ width: '100px', height: '1rem', marginBottom: '0.75rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="skeleton-line" style={{ width: '100%', height: '2.25rem', borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right hand main content Skeleton */}
        <div className="discovery-main-content">
          {/* Filter Bar placeholder */}
          <div className="discovery-filter-bar" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="skeleton-line" style={{ width: '140px', height: '2.5rem', borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          </div>

          {/* Games Grid Loader */}
          <div className="discovery-results-wrapper">
            <div className="grid-switcher-placeholder" style={{ height: '2rem', marginBottom: '1.5rem' }} />
            <ul className="games-grid" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <li key={i}>
                  <div className="game-card game-card--skeleton">
                    <Skeleton className="game-card__cover" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg)' }} />
                    <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                      <Skeleton className="skeleton-line" style={{ width: '70%', height: '1rem', marginBottom: '0.5rem' }} />
                      <Skeleton className="skeleton-line" style={{ width: '40%', height: '0.75rem' }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
