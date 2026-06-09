import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const cinematicSurfaceVariants = cva(
  'overflow-hidden transition-all duration-[var(--motion-standard)] ease-[var(--ease-standard)] rounded-[var(--radius-surface)]',
  {
    variants: {
      elevation: {
        sunken: 'bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)]',
        base: 'bg-[var(--color-surface-base)]',
        raised: 'bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)]',
        overlay: 'bg-[var(--color-surface-overlay)] border border-[var(--color-border-subtle)] shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
      },
      hoverable: {
        true: 'hover:translate-y-[-4px] hover:scale-[1.01] hover:border-[var(--color-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      elevation: 'raised',
      hoverable: false,
    },
  }
)

export interface CinematicSurfaceProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'elevation'>,
    VariantProps<typeof cinematicSurfaceVariants> {
  as?: 'div' | 'article' | 'aside' | 'section'
}

export const CinematicSurface = React.forwardRef<HTMLElement, CinematicSurfaceProps>(
  ({ className, elevation, hoverable, as: Component = 'div', children, ...props }, ref) => {
    const isClickable = !!props.onClick
    const isHoverable = hoverable || isClickable

    return (
      <Component
        ref={ref as React.Ref<any>}
        className={cn(cinematicSurfaceVariants({ elevation, hoverable: isHoverable, className }))}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CinematicSurface.displayName = 'CinematicSurface'
