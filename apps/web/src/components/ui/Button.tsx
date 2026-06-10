import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-ui transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-muted)] shadow-lg shadow-[var(--color-accent-glow)] duration-200',
        secondary:
          'border border-[var(--color-border)] bg-[oklch(100%_0_0_/_0.06)] backdrop-blur-sm text-[var(--color-text-primary)] hover:bg-[oklch(100%_0_0_/_0.12)] hover:border-[var(--color-border-strong)] duration-150',
        ghost:
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] duration-150',
        danger:
          'bg-[var(--color-error)] text-[var(--color-text-inverse)] hover:opacity-90 duration-150',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-badge)]',
        md: 'px-4 py-2 text-sm font-semibold rounded-[var(--radius-overlay)]',
        lg: 'px-6 py-3 text-base font-bold rounded-[var(--radius-surface)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean | undefined
  as?: React.ElementType | undefined
  href?: string | undefined
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, as: Component = 'button', disabled, ...props }, ref) => {
    const isButton = Component === 'button'
    const buttonProps = isButton ? { type: props.type || 'button', disabled: disabled || isLoading } : {}

    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...buttonProps}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden="true" />
        )}
        {children}
      </Component>
    )
  }
)

Button.displayName = 'Button'
