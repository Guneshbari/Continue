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
  }
)

export interface EditorialSectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof editorialSectionHeaderVariants> {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  description?: string
  action?: React.ReactNode
}

export const EditorialSectionHeader = React.forwardRef<HTMLDivElement, EditorialSectionHeaderProps>(
  ({ className, variant, title, subtitle, badge, description, action, ...props }, ref) => {
    const isLarge = variant === 'large'

    return (
      <div
        ref={ref}
        className={cn(editorialSectionHeaderVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-baseline justify-between gap-4 w-full">
          <div className="flex flex-col gap-1 min-w-0">
            {subtitle && (
              <span className="font-ui text-xs font-bold tracking-widest uppercase text-[var(--color-accent)] animate-fade-in">
                {subtitle}
              </span>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className={cn(
                  'font-display leading-[var(--line-height-display)] tracking-[var(--tracking-compressed)] text-[var(--color-text-primary)]',
                  isLarge ? 'text-[var(--font-size-display-lg)]' : 'text-[var(--font-size-display-md)]'
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
          {action && (
            <div className="flex-shrink-0 self-center md:self-end">
              {action}
            </div>
          )}
        </div>
        {description && (
          <p className="font-ui text-sm leading-[var(--line-height-ui)] text-[var(--color-text-secondary)] max-w-[var(--measure-synopsis)] mt-1">
            {description}
          </p>
        )}
      </div>
    )
  }
)

EditorialSectionHeader.displayName = 'EditorialSectionHeader'
