import React from 'react'
import { cn } from '@/lib/utils'

interface CinematicSurfaceProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  elevation?: 'base' | 'raised' | 'overlay' | 'sunken'
  hoverable?: boolean
  as?: 'div' | 'article' | 'aside' | 'section'
  onClick?: React.MouseEventHandler<HTMLElement>
}

const ELEVATION_MAP = {
  base: 'bg-[var(--color-surface-base)]',
  raised: 'bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)]',
  overlay: 'bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] shadow-[0_8px_30px_rgb(0_0_0_/_0.5)]',
  sunken: 'bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)]',
}

export function CinematicSurface({
  children,
  className,
  style,
  elevation = 'raised',
  hoverable = false,
  as: Component = 'div',
  onClick,
}: CinematicSurfaceProps) {
  const interactive = hoverable || !!onClick

  return (
    <Component
      onClick={onClick}
      className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        ELEVATION_MAP[elevation],
        interactive && 'hover:translate-y-[-4px] hover:scale-[1.01] hover:border-[var(--color-border)] hover:shadow-[0_12px_40px_rgb(0_0_0_/_0.6)] cursor-pointer',
        className
      )}
      style={{ borderRadius: 'var(--radius-surface)', ...style }}
    >
      {children}
    </Component>
  )
}
