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
        'editorial-section',
        hasDivider && 'editorial-section--divider',
        className
      )}
      style={style}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Component>
  )
}
