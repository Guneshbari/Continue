import React from 'react'
import { AlertOctagon } from 'lucide-react'
import { CinematicSurface } from './CinematicSurface'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = 'Something went wrong',
      message = 'We encountered an error processing your request. Please try again.',
      onRetry,
      retryLabel = 'Try Again',
      ...props
    },
    ref,
  ) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'border-[var(--color-error)]/20 flex select-none flex-col items-center justify-center border bg-[var(--color-surface-sunken)] p-8 text-center md:p-12',
          className,
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="animate-fade-in mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[oklch(25%_0.08_25)] bg-[oklch(15%_0.05_25)] text-[var(--color-error)] shadow-lg shadow-[oklch(15%_0.05_25_/_0.25)]">
          <AlertOctagon className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="font-ui mb-2 text-base font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>

        <p className="font-ui mb-6 max-w-[42ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
          {message}
        </p>

        {onRetry && (
          <Button variant="danger" size="sm" onClick={onRetry} className="animate-fade-in">
            {retryLabel}
          </Button>
        )}
      </CinematicSurface>
    )
  },
)

ErrorState.displayName = 'ErrorState'
