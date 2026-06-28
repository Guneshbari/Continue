import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const editorialSectionHeaderVariants = cva(
  'w-full flex flex-col gap-2 border-b border-[var(--color-border-subtle)] pb-4 mb-6 select-none',
  {
    variants: {
      variant: {
        default: 'pb-3 mb-5',
        large: 'pb-5 mb-8 border-b-2',
        minimal: 'border-b-0 pb-0 mb-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface EditorialSectionHeaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof editorialSectionHeaderVariants> {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  description?: string
  action?: React.ReactNode
  /** Optional id applied to the inner h2 element for aria-labelledby support */
  headingId?: string | undefined
}

export const EditorialSectionHeader = React.forwardRef<HTMLDivElement, EditorialSectionHeaderProps>(
  (
    { className, variant, title, subtitle, badge, description, action, headingId, ...props },
    ref,
  ) => {
    const isLarge = variant === 'large'

    return (
      <div
        ref={ref}
        className={cn(editorialSectionHeaderVariants({ variant, className }))}
        {...props}
      >
        <div className="flex w-full items-baseline justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            {subtitle && (
              <span className="font-ui animate-fade-in text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                {subtitle}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h2
                id={headingId}
                className={cn(
                  'font-display leading-[var(--line-height-display)] tracking-[var(--tracking-compressed)] text-[var(--color-text-primary)]',
                  isLarge
                    ? 'text-[var(--font-size-display-lg)]'
                    : 'text-[var(--font-size-display-md)]',
                )}
              >
                {title}
              </h2>
              {badge && (
                <div className="flex items-center self-center" aria-label="Section badge count">
                  {badge}
                </div>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0 self-center md:self-end">{action}</div>}
        </div>
        {description && (
          <p className="font-ui mt-1 max-w-[var(--measure-synopsis)] text-sm leading-[var(--line-height-ui)] text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
    )
  },
)

EditorialSectionHeader.displayName = 'EditorialSectionHeader'
