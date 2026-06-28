import { Compass } from 'lucide-react'

interface DiscoveryEmptyStateProps {
  onClearFilters?: () => void
}

export function DiscoveryEmptyState({ onClearFilters }: DiscoveryEmptyStateProps) {
  return (
    <div className="games-grid-empty" style={{ padding: '4rem 2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <Compass size={36} aria-hidden="true" />
      </div>
      <h3 className="games-grid-empty__title">No games discovered</h3>
      <p className="games-grid-empty__sub" style={{ margin: '0.5rem 0 1.5rem' }}>
        No titles match your active filters (genre, platform, year, rating).
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="pagination-loader-btn"
          aria-label="Clear active discovery filters"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
