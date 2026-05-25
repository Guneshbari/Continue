import React from 'react'
import { cn } from '@/lib/utils'

interface EditorialSectionWrapperProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  hasDivider?: boolean
  as?: 'section' | 'div' | 'article'
  'aria-labelledby'?: string
}

export function EditorialSectionWrapper({
  children,
  className,
  style,
  hasDivider = false,
  as: Component = 'section',
  'aria-labelledby': ariaLabelledBy,
}: EditorialSectionWrapperProps) {
  return (
    <Component
      className={cn(
        'w-full py-12 md:py-16 first:pt-6 last:pb-16',
        hasDivider && 'border-b border-border-subtle',
        className
      )}
      style={style}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Component>
  )
}
