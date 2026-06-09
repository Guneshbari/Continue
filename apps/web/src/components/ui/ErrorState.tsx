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
    ref
  ) => {
    return (
      <CinematicSurface
        ref={ref}
        elevation="sunken"
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-[var(--color-error)]/20 bg-[var(--color-surface-sunken)] select-none',
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(15%_0.05_25)] border border-[oklch(25%_0.08_25)] text-[var(--color-error)] mb-4 animate-fade-in shadow-lg shadow-[oklch(15%_0.05_25_/_0.25)]">
          <AlertOctagon className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="font-ui text-base font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>

        <p className="font-ui text-sm text-[var(--color-text-muted)] max-w-[42ch] mb-6 leading-relaxed">
          {message}
        </p>

        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            className="animate-fade-in"
          >
            {retryLabel}
          </Button>
        )}
      </CinematicSurface>
    )
  }
)

ErrorState.displayName = 'ErrorState'
