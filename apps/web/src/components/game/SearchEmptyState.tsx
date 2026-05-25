import { Search } from 'lucide-react'

interface SearchEmptyStateProps {
  query: string
  onClear?: () => void
}

export function SearchEmptyState({ query, onClear }: SearchEmptyStateProps) {
  return (
    <div className="games-grid-empty" style={{ padding: '4rem 2rem', marginInline: 'auto', maxWidth: '480px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
        <Search size={36} aria-hidden="true" />
      </div>
      <h3 className="games-grid-empty__title">No results for &ldquo;{query}&rdquo;</h3>
      <p className="games-grid-empty__sub" style={{ margin: '0.5rem 0 1.5rem' }}>
        We couldn&rsquo;t find any matches. Try adjusting your spelling or searching for a different title, genre, or developer.
      </p>
      {onClear && (
        <button onClick={onClear} className="pagination-loader-btn" aria-label="Clear search input">
          Clear Search
        </button>
      )}
    </div>
  )
}
