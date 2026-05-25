import React from 'react'
import { cn } from '@/lib/utils'

interface MetadataBadgeProps {
  children: React.ReactNode
  variant?: 'accent' | 'muted' | 'success' | 'warning' | 'error' | 'surface'
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const VARIANT_MAP = {
  accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle)]',
  muted: 'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]',
  success: 'bg-[oklch(20%_0.05_145)] text-[var(--color-success)] border border-[oklch(30%_0.08_145)]',
  warning: 'bg-[oklch(20%_0.05_70)] text-[var(--color-warning)] border border-[oklch(30%_0.08_70)]',
  error: 'bg-[oklch(15%_0.05_25)] text-[var(--color-error)] border border-[oklch(25%_0.08_25)]',
  surface: 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]',
}

export function MetadataBadge({
  children,
  variant = 'muted',
  icon,
  className,
  style,
}: MetadataBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold tracking-wider uppercase leading-none transition-all duration-150 ease-out',
        VARIANT_MAP[variant],
        className
      )}
      style={style}
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

interface MetadataBadgeGroupProps {
  children: React.ReactNode
  className?: string
}

export function MetadataBadgeGroup({ children, className }: MetadataBadgeGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {children}
    </div>
  )
}
