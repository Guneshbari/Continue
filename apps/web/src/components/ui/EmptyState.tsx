import React from 'react'
import { HelpCircle, type LucideIcon } from 'lucide-react'
import { CinematicSurface } from './CinematicSurface'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, title, description, icon: Icon = HelpCircle, actionLabel, onAction, ...props },
    ref,
  ) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'flex select-none flex-col items-center justify-center border border-dashed border-[var(--color-border)] p-8 text-center md:p-12',
          className,
        )}
        {...props}
      >
        <div className="animate-fade-in mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] shadow-inner">
          <Icon className="h-6 w-6 opacity-80" aria-hidden="true" />
        </div>

        <h3 className="font-ui mb-2 text-base font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>

        {description && (
          <p className="font-ui mb-6 max-w-[42ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
        )}

        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" onClick={onAction} className="animate-fade-in">
            {actionLabel}
          </Button>
        )}
      </CinematicSurface>
    )
  },
)

EmptyState.displayName = 'EmptyState'
