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
    ref,
  ) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'border-[var(--color-success)]/20 flex select-none flex-col items-center justify-center border bg-[var(--color-surface-sunken)] p-8 text-center md:p-12',
          className,
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className="animate-fade-in mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[oklch(30%_0.08_145)] bg-[oklch(20%_0.05_145)] text-[var(--color-success)] shadow-lg shadow-[oklch(20%_0.05_145_/_0.25)]">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="font-ui mb-2 text-base font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>

        <p className="font-ui mb-6 max-w-[42ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
          {message}
        </p>

        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" onClick={onAction} className="animate-fade-in">
            {actionLabel}
          </Button>
        )}
      </CinematicSurface>
    )
  },
)

SuccessState.displayName = 'SuccessState'
