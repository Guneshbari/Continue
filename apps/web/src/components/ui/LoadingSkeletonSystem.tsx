import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const skeletonVariants = cva('skeleton-pulse select-none pointer-events-none', {
  variants: {
    variant: {
      rect: 'rounded-[var(--radius-card)]',
      circle: 'rounded-full',
      text: 'h-4 w-3/4 rounded',
    },
  },
  defaultVariants: {
    variant: 'rect',
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        aria-hidden="true"
        {...props}
      />
    )
  },
)

Skeleton.displayName = 'Skeleton'
