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
  ({ className, title, description, icon: Icon = HelpCircle, actionLabel, onAction, ...props }, ref) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-[var(--color-border)] select-none',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] mb-4 animate-fade-in shadow-inner">
          <Icon className="h-6 w-6 opacity-80" aria-hidden="true" />
        </div>
        
        <h3 className="font-ui text-base font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>

        {description && (
          <p className="font-ui text-sm text-[var(--color-text-muted)] max-w-[42ch] mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {actionLabel && onAction && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
            className="animate-fade-in"
          >
            {actionLabel}
          </Button>
        )}
      </CinematicSurface>
    )
  }
)

EmptyState.displayName = 'EmptyState'
