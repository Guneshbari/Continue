import { Star } from 'lucide-react'

interface RatingDisplayProps {
  rating: number
  maxRating?: number
  size?: number
  className?: string
}

export function RatingDisplay({ rating, maxRating = 10, size = 14, className = '' }: RatingDisplayProps) {
  const rounded = Math.round(rating * 10) / 10

  const getRatingColor = (val: number) => {
    if (val >= 8.0) return '#fbbf24' // Gold
    if (val >= 5.0) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }

  const color = getRatingColor(rounded)

  return (
    <div 
      className={`flex items-center gap-1 font-bold text-xs select-none ${className}`} 
      style={{ color }}
      aria-label={`Rating: ${rounded} out of ${maxRating}`}
    >
      <Star size={size} fill="currentColor" className="shrink-0" />
      <span>{rounded.toFixed(1)}</span>
    </div>
  )
}
