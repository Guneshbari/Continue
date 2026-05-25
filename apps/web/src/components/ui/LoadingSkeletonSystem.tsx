import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
  variant?: 'circle' | 'rect' | 'text'
}

export function Skeleton({ className, style, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-pulse',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 w-3/4 rounded',
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  )
}
