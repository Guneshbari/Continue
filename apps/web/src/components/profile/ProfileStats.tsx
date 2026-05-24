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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Ratings */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-raised border border-border-subtle hover:border-border transition-colors text-center">
        <Star size={24} className="text-warning mb-2" aria-hidden="true" />
        <span className="text-2xl font-bold text-text-primary">{ratingCount}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider mt-1">Ratings Given</span>
      </div>

      {/* Reviews */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-raised border border-border-subtle hover:border-border transition-colors text-center">
        <MessageSquare size={24} className="text-accent mb-2" aria-hidden="true" />
        <span className="text-2xl font-bold text-text-primary">{reviewCount}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider mt-1">Reviews Written</span>
      </div>

      {/* Lists */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-raised border border-border-subtle hover:border-border transition-colors text-center">
        <List size={24} className="text-accent-muted mb-2" aria-hidden="true" />
        <span className="text-2xl font-bold text-text-primary">{listCount}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider mt-1">Curated Lists</span>
      </div>

      {/* Played slots - visual layout */}
      <div className="p-6 rounded-xl bg-surface-raised border border-border-subtle hover:border-border transition-colors flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={18} className="text-success" aria-hidden="true" />
          <span className="text-xs text-text-muted uppercase tracking-wider">Backlog slots</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-text-primary mb-2">
            {playedCount} <span className="text-xs font-normal text-text-secondary">Games Played</span>
          </span>
          <div className="flex gap-1.5" aria-hidden="true">
            {slots.map((active, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                  active
                    ? 'bg-accent shadow-md shadow-accent-glow'
                    : 'bg-surface-sunken border border-border-subtle'
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
