import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CinematicSurface } from './CinematicSurface'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface SuccessStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export const SuccessState = React.forwardRef<HTMLDivElement, SuccessStateProps>(
  (
    {
      className,
      title = 'Success!',
      message = 'Your action was processed successfully.',
      actionLabel,
      onAction,
      ...props
    },
    ref
  ) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-[var(--color-success)]/20 bg-[var(--color-surface-sunken)] select-none',
          className
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(20%_0.05_145)] border border-[oklch(30%_0.08_145)] text-[var(--color-success)] mb-4 animate-fade-in shadow-lg shadow-[oklch(20%_0.05_145_/_0.25)]">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="font-ui text-base font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>

        <p className="font-ui text-sm text-[var(--color-text-muted)] max-w-[42ch] mb-6 leading-relaxed">
          {message}
        </p>

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

SuccessState.displayName = 'SuccessState'
