import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  as?: 'div' | 'section' | 'main' | 'header' | 'footer'
}

export function ResponsiveContainer({
  children,
  className,
  style,
  as: Component = 'div',
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn('site-container', className)}
      style={style}
    >
      {children}
    </Component>
  )
}
