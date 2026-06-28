import { Star, MessageSquare, List, Compass } from 'lucide-react'

interface ProfileStatsProps {
  ratingCount: number
  reviewCount: number
  listCount: number
}

export function ProfileStats({ ratingCount, reviewCount, listCount }: ProfileStatsProps) {
  // Let's create a dynamic games played count (can fall back on ratingCount + list items count, or just ratingCount)
  const playedCount = Math.max(ratingCount, Math.floor((ratingCount + listCount) * 1.5))

  // Render a slots grid of games played. E.g., showing small premium square boxes representing "slots"
  // Up to 10 slots showing active slots colored with accent violet and the rest sunken placeholders.
  const maxSlots = 10
  const activeSlotsCount = Math.min(playedCount, maxSlots)
  const slots = Array.from({ length: maxSlots }, (_, i) => i < activeSlotsCount)

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Ratings */}
      <div className="bg-surface-raised border-border-subtle hover:border-border flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-colors">
        <Star size={24} className="text-warning mb-2" aria-hidden="true" />
        <span className="text-text-primary text-2xl font-bold">{ratingCount}</span>
        <span className="text-text-muted mt-1 text-xs uppercase tracking-wider">Ratings Given</span>
      </div>

      {/* Reviews */}
      <div className="bg-surface-raised border-border-subtle hover:border-border flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-colors">
        <MessageSquare size={24} className="text-accent mb-2" aria-hidden="true" />
        <span className="text-text-primary text-2xl font-bold">{reviewCount}</span>
        <span className="text-text-muted mt-1 text-xs uppercase tracking-wider">
          Reviews Written
        </span>
      </div>

      {/* Lists */}
      <div className="bg-surface-raised border-border-subtle hover:border-border flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-colors">
        <List size={24} className="text-accent-muted mb-2" aria-hidden="true" />
        <span className="text-text-primary text-2xl font-bold">{listCount}</span>
        <span className="text-text-muted mt-1 text-xs uppercase tracking-wider">Curated Lists</span>
      </div>

      {/* Played slots - visual layout */}
      <div className="bg-surface-raised border-border-subtle hover:border-border flex flex-col justify-between rounded-xl border p-6 transition-colors">
        <div className="mb-2 flex items-center gap-2">
          <Compass size={18} className="text-success" aria-hidden="true" />
          <span className="text-text-muted text-xs uppercase tracking-wider">Backlog slots</span>
        </div>

        <div className="flex flex-col">
          <span className="text-text-primary mb-2 text-2xl font-bold">
            {playedCount}{' '}
            <span className="text-text-secondary text-xs font-normal">Games Played</span>
          </span>
          <div className="flex gap-1.5" aria-hidden="true">
            {slots.map((active, i) => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-sm transition-all duration-300 ${
                  active
                    ? 'bg-accent shadow-accent-glow shadow-md'
                    : 'bg-surface-sunken border-border-subtle border'
                }`}
                title={active ? 'Played' : 'Locked backlog slot'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
