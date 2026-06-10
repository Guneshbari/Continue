'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Gamepad2, User, ImageOff } from 'lucide-react'
import { Skeleton } from './LoadingSkeletonSystem'

export const gameArtworkVariants = cva(
  'relative overflow-hidden bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] transition-all duration-[var(--motion-standard)] ease-[var(--ease-standard)]',
  {
    variants: {
      variant: {
        'cover-sm': 'aspect-[3/4] w-12 rounded-[var(--radius-badge)]',
        'cover-md': 'aspect-[3/4] w-32 md:w-36 rounded-[var(--radius-card)]',
        'cover-lg': 'aspect-[3/4] w-40 md:w-48 rounded-[var(--radius-card)]',
        backdrop: 'aspect-video w-full rounded-[var(--radius-surface)]',
        avatar: 'aspect-square w-10 h-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'cover-md',
    },
  }
)

export interface GameArtworkProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameArtworkVariants> {
  src?: string | null | undefined
  alt: string
  priority?: boolean | undefined
  imageClassName?: string | undefined
  sizes?: string | undefined
  /** Enable premium hover effects (scale, saturate, shadow). @default true */
  hoverable?: boolean | undefined
}

export const GameArtwork = React.forwardRef<HTMLDivElement, GameArtworkProps>(
  ({ className, variant, src, alt, priority = false, imageClassName, sizes, hoverable = true, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    // Reset states if src changes
    useEffect(() => {
      setIsLoaded(false)
      setHasError(false)
    }, [src])

    const showPlaceholder = !src || hasError
    const isAvatar = variant === 'avatar'

    // Hover effects apply only when hoverable, image is loaded, and not showing placeholder
    const canHover = hoverable && isLoaded && !showPlaceholder

    return (
      <div
        ref={ref}
        className={cn(gameArtworkVariants({ variant, className }))}
        style={{
          ...(canHover && {
            transition: 'transform var(--motion-standard) var(--ease-standard), box-shadow var(--motion-standard) var(--ease-standard), filter var(--motion-standard) var(--ease-standard)',
          }),
          ...props.style,
        }}
        {...props}
        onMouseEnter={(e) => {
          if (canHover && e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.transform = 'scale(1.03)'
            e.currentTarget.style.filter = 'saturate(1.1) brightness(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 32px oklch(0% 0 0 / 0.4)'
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (canHover && e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.filter = ''
            e.currentTarget.style.boxShadow = ''
          }
          props.onMouseLeave?.(e)
        }}
      >
        {/* Loading Skeleton underneath */}
        {!isLoaded && !showPlaceholder && (
          <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
        )}

        {showPlaceholder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface-sunken)] text-[var(--color-text-muted)] p-2 text-center select-none animate-fade-in">
            {isAvatar ? (
              <User className="h-1/2 w-1/2" />
            ) : variant === 'backdrop' ? (
              <ImageOff className="h-12 w-12 opacity-60" />
            ) : (
              <>
                <Gamepad2 className="h-8 w-8 mb-1 opacity-60" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 truncate max-w-full">
                  {alt}
                </span>
              </>
            )}
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes || '(max-width: 768px) 100vw, 33vw'}
            priority={priority}
            className={cn(
              'object-cover transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] filter saturate-[0.85]',
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              imageClassName
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        )}
      </div>
    )
  }
)

GameArtwork.displayName = 'GameArtwork'
