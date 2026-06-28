import { Calendar, Building2, Tag, Monitor } from 'lucide-react'
import type { GameDetail } from '@continue/types'

interface GameMetadataGridProps {
  game: GameDetail
}

export function GameMetadataGrid({ game }: GameMetadataGridProps) {
  const releaseYear = game.releaseDate
    ? new Date(game.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <section className="game-metadata-grid" aria-labelledby="metadata-heading">
      <h2 id="metadata-heading" className="sr-only">
        Game Information
      </h2>

      <div className="metadata-grid">
        {/* Release Date */}
        <div className="metadata-item">
          <span className="metadata-label">
            <Calendar size={14} aria-hidden="true" />
            Release Date
          </span>
          <span className="metadata-value">{releaseYear}</span>
        </div>

        {/* Developer */}
        {game.developer && (
          <div className="metadata-item">
            <span className="metadata-label">
              <Building2 size={14} aria-hidden="true" />
              Developer
            </span>
            <span className="metadata-value">{game.developer}</span>
          </div>
        )}

        {/* Publisher */}
        {game.publisher && (
          <div className="metadata-item">
            <span className="metadata-label">
              <Building2 size={14} aria-hidden="true" />
              Publisher
            </span>
            <span className="metadata-value">{game.publisher}</span>
          </div>
        )}
      </div>

      {/* Platforms */}
      {game.platforms && game.platforms.length > 0 && (
        <div className="metadata-group">
          <span className="metadata-label">
            <Monitor size={14} aria-hidden="true" />
            Platforms
          </span>
          <div className="metadata-tags">
            {game.platforms.map((p) => (
              <span key={p.id} className="metadata-tag">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {game.tags && game.tags.length > 0 && (
        <div className="metadata-group">
          <span className="metadata-label">
            <Tag size={14} aria-hidden="true" />
            Tags
          </span>
          <div className="metadata-tags">
            {game.tags.map((t) => (
              <span key={t.id} className="metadata-tag">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
