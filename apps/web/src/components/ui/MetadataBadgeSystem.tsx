import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const metadataBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded font-semibold tracking-wider uppercase leading-none transition-all duration-[var(--motion-fast)] ease-[var(--ease-standard)] select-none',
  {
    variants: {
      variant: {
        accent:
          'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle)]',
        muted:
          'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]',
        success:
          'bg-[oklch(20%_0.05_145)] text-[var(--color-success)] border border-[oklch(30%_0.08_145)]',
        warning:
          'bg-[oklch(20%_0.05_70)] text-[var(--color-warning)] border border-[oklch(30%_0.08_70)]',
        error:
          'bg-[oklch(15%_0.05_25)] text-[var(--color-error)] border border-[oklch(25%_0.08_25)]',
        surface:
          'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[9px] md:text-[10px]',
        md: 'px-2 py-0.5 text-[10px] md:text-xs',
      },
    },
    defaultVariants: {
      variant: 'muted',
      size: 'md',
    },
  },
)

export interface MetadataBadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof metadataBadgeVariants> {
  icon?: React.ReactNode
}

export const MetadataBadge = React.forwardRef<HTMLSpanElement, MetadataBadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(metadataBadgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </span>
    )
  },
)

MetadataBadge.displayName = 'MetadataBadge'

interface MetadataBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const MetadataBadgeGroup = React.forwardRef<HTMLDivElement, MetadataBadgeGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-wrap gap-1.5', className)} {...props}>
        {children}
      </div>
    )
  },
)

MetadataBadgeGroup.displayName = 'MetadataBadgeGroup'
