'use client'

import React, { useState } from 'react'
import {
  Star,
  Trash,
  AlertTriangle,
  RotateCw,
  Check,
  ExternalLink,
  Clock,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CinematicSurface } from '@/components/ui/CinematicSurface'
import { MetadataBadge, MetadataBadgeGroup } from '@/components/ui/MetadataBadgeSystem'
import { Skeleton } from '@/components/ui/LoadingSkeletonSystem'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { EditorialSectionHeader } from '@/components/ui/EditorialSectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SuccessState } from '@/components/ui/SuccessState'

export default function DesignSystemPage() {
  const [buttonsLoading, setButtonsLoading] = useState(false)
  const [artworkSrc, setArtworkSrc] = useState<string | null>(
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
  )

  const colors = [
    { name: '--color-surface-base', desc: 'Main background', val: 'oklch(8% 0.01 260)' },
    { name: '--color-surface-raised', desc: 'Default card/container', val: 'oklch(12% 0.015 260)' },
    { name: '--color-surface-overlay', desc: 'Modals/dropdowns', val: 'oklch(16% 0.018 260)' },
    { name: '--color-surface-sunken', desc: 'Deep sunken wells', val: 'oklch(5% 0.008 260)' },
    { name: '--color-accent', desc: 'Electric violet accent', val: 'oklch(65% 0.25 290)' },
    { name: '--color-accent-muted', desc: 'Slightly dark violet', val: 'oklch(50% 0.18 290)' },
    { name: '--color-accent-subtle', desc: 'Light base for badge/glow', val: 'oklch(30% 0.10 290)' },
    { name: '--color-text-primary', desc: 'Primary titles/body', val: 'oklch(96% 0.005 260)' },
    { name: '--color-text-secondary', desc: 'Secondary sub-texts', val: 'oklch(70% 0.01 260)' },
    { name: '--color-text-muted', desc: 'Deeply muted labels', val: 'oklch(45% 0.01 260)' },
    { name: '--color-border', desc: 'Standard separation', val: 'oklch(22% 0.015 260)' },
    { name: '--color-border-subtle', desc: 'Faint outline separation', val: 'oklch(18% 0.01 260)' },
    { name: '--color-border-strong', desc: 'Active hover focus outline', val: 'oklch(30% 0.02 260)' },
    { name: '--color-success', desc: 'Success status', val: 'oklch(70% 0.18 145)' },
    { name: '--color-warning', desc: 'Warning status', val: 'oklch(75% 0.18 70)' },
    { name: '--color-error', desc: 'Error status', val: 'oklch(65% 0.22 25)' },
  ]

  return (
    <div className="site-container py-10 flex flex-col gap-16">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          Development Suite
        </span>
        <h1 className="font-display text-[var(--font-size-display-xl)] leading-[var(--line-height-display)] tracking-[var(--tracking-compressed)] text-[var(--color-text-primary)]">
          Continue Design System
        </h1>
        <p className="font-ui text-base text-[var(--color-text-secondary)] max-w-[56ch] mt-2">
          Interactive showcase and visual regression testing dashboard for Continue visual primitives.
          All elements are built utilizing strictly standardized tokens and zero hex-code styling.
        </p>
      </div>

      {/* SECTION 1: Colors & Tokens */}
      <section id="colors">
        <EditorialSectionHeader
          title="Color System & Tokens"
          subtitle="Tokens / Color System"
          description="High-contrast oklch design tokens supporting layered cinematic depths. Audited for dark-theme excellence."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colors.map((c) => (
            <CinematicSurface
              key={c.name}
              elevation="raised"
              className="p-3 flex flex-col gap-2 rounded-[var(--radius-card)]"
            >
              <div
                className="w-full aspect-video rounded-[var(--radius-badge)] border border-[var(--color-border-subtle)]"
                style={{ backgroundColor: c.val }}
              />
              <div>
                <h4 className="font-ui text-xs font-bold text-[var(--color-text-primary)] truncate">
                  {c.name.replace('--color-', '')}
                </h4>
                <p className="font-ui text-[10px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                  {c.desc}
                </p>
                <code className="block text-[8px] text-[var(--color-text-muted)] bg-[var(--color-surface-sunken)] p-1 rounded mt-1.5 font-mono select-all">
                  {c.val}
                </code>
              </div>
            </CinematicSurface>
          ))}
        </div>
      </section>

      {/* SECTION 2: Typography & Columns */}
      <section id="typography">
        <EditorialSectionHeader
          title="Typography & Line Readability"
          subtitle="Tokens / Typography"
          description="Bebas Neue for cinematic headers and Inter UI for content rows. Reading columns are strictly constrained to preserve editorial focus."
        />
        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-8 border-b border-[var(--color-border-subtle)] pb-6">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Font Scales
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Display XL (--font-size-display-xl)</span>
                  <h1 className="font-display text-[var(--font-size-display-xl)] leading-none text-[var(--color-text-primary)]">
                    CONTINUE CATALOG
                  </h1>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Display LG (--font-size-display-lg)</span>
                  <h2 className="font-display text-[var(--font-size-display-lg)] leading-none text-[var(--color-text-primary)]">
                    THE COLLECTIVE LIST
                  </h2>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Display MD (--font-size-display-md)</span>
                  <h3 className="font-display text-[var(--font-size-display-md)] leading-none text-[var(--color-text-primary)]">
                    Featured Review Title
                  </h3>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                UI & Headings (Inter)
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Heading LG (--font-size-heading-lg)</span>
                  <h4 className="font-ui text-[var(--font-size-heading-lg)] font-bold text-[var(--color-text-primary)]">
                    Modern gaming journal meets catalog
                  </h4>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Heading MD (--font-size-heading-md)</span>
                  <h5 className="font-ui text-[var(--font-size-heading-md)] font-bold text-[var(--color-text-primary)]">
                    Interactive Activity highlights
                  </h5>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-mono">Body MD (--font-size-body-md)</span>
                  <p className="font-ui text-[var(--font-size-body-md)] text-[var(--color-text-secondary)]">
                    This is standard UI body text. It remains clean, highly legible, and fits navigation nodes easily.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              Editorial Line Constraints (Measure)
            </h3>
            <div className="flex flex-col gap-6">
              <div className="border border-[var(--color-border-subtle)] p-4 rounded-[var(--radius-surface)] bg-[var(--color-surface-sunken)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-mono mb-2">
                  Review Text Constraint (--measure-review: 66ch)
                </span>
                <p className="font-ui text-[var(--font-size-body-lg)] leading-[var(--line-height-prose)] text-[var(--color-text-primary)] max-w-[var(--measure-review)] bg-[var(--color-surface-base)] p-4 rounded border border-[var(--color-border)]">
                  The Witcher 3: Wild Hunt represents a watermark high in RPG design. Its writing doesn't simply present quests; it designs intricate moral puzzles. The Bloody Baron storyline remains a masterclass in domestic tragedy, shifting players from disgust to profound pity. Coupled with a dense, atmospheric dark fantasy setting, the game ensures every decision feels heavy.
                </p>
              </div>

              <div className="border border-[var(--color-border-subtle)] p-4 rounded-[var(--radius-surface)] bg-[var(--color-surface-sunken)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-mono mb-2">
                  Synopsis Constraint (--measure-synopsis: 52ch)
                </span>
                <p className="font-ui text-[var(--font-size-body-md)] leading-[var(--line-height-ui)] text-[var(--color-text-secondary)] max-w-[var(--measure-synopsis)] bg-[var(--color-surface-base)] p-4 rounded border border-[var(--color-border)]">
                  An open-world action RPG set in a fantasy universe. Players assume the role of Geralt of Rivia, a mutated monster hunter for hire, tasked with locating his adopted daughter fleeing from the Wild Hunt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Surfaces & Depth */}
      <section id="surfaces">
        <EditorialSectionHeader
          title="Surfaces & Shadows"
          subtitle="Primitives / Surfaces"
          description="Polymorphic layers representing elevation levels in our layered catalog layouts. Hoverable variants support interactive translate and shadow glows."
        />
        <div className="grid md:grid-cols-4 gap-6">
          <CinematicSurface elevation="sunken" className="p-5 flex flex-col gap-2 justify-between min-h-[140px]">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block">ELEVATION: SUNKEN</span>
              <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] mt-1">Sunken Backdrop</h4>
              <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-1">
                Deepest page background layer, useful for lists wrappers and sidebars.
              </p>
            </div>
            <code className="text-[9px] text-[var(--color-text-muted)] font-mono">elevation="sunken"</code>
          </CinematicSurface>

          <CinematicSurface elevation="base" className="p-5 flex flex-col gap-2 justify-between min-h-[140px] border border-[var(--color-border-subtle)]">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block">ELEVATION: BASE</span>
              <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] mt-1">Base Layer</h4>
              <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-1">
                Standard page background level for standard scrolling routes.
              </p>
            </div>
            <code className="text-[9px] text-[var(--color-text-muted)] font-mono">elevation="base"</code>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-2 justify-between min-h-[140px]">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block">ELEVATION: RAISED</span>
              <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] mt-1">Raised Surface</h4>
              <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-1">
                Standard container for cards, comments, reviews, shelves, and form wrappers.
              </p>
            </div>
            <code className="text-[9px] text-[var(--color-text-muted)] font-mono">elevation="raised"</code>
          </CinematicSurface>

          <CinematicSurface elevation="overlay" className="p-5 flex flex-col gap-2 justify-between min-h-[140px]">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block">ELEVATION: OVERLAY</span>
              <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] mt-1">Overlay Panel</h4>
              <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-1">
                Floating elements: dialog modals, tooltips, autocomplete lists. Features soft drop shadow.
              </p>
            </div>
            <code className="text-[9px] text-[var(--color-text-muted)] font-mono">elevation="overlay"</code>
          </CinematicSurface>

          <CinematicSurface elevation="raised" hoverable className="p-5 flex flex-col gap-2 justify-between min-h-[140px] md:col-span-2">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block">HOVERABLE: TRUE</span>
              <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] mt-1">Interactive Hover Surface</h4>
              <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-1">
                Translate scale and dynamic drop shadow depth expansion on mouse hover.
              </p>
            </div>
            <code className="text-[9px] text-[var(--color-text-muted)] font-mono">elevation="raised" hoverable</code>
          </CinematicSurface>
        </div>
      </section>

      {/* SECTION 4: Buttons & Interactions */}
      <section id="buttons">
        <div className="flex items-center justify-between gap-4 mb-4">
          <EditorialSectionHeader
            title="Interactive Buttons"
            subtitle="Primitives / Buttons"
            description="Polymorphic buttons with support for electric violet primary color, secondary outline glass, flat ghost and danger. Includes built-in spinner states."
            variant="minimal"
            className="mb-0 pb-0"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setButtonsLoading((prev) => !prev)}
            className="flex-shrink-0"
          >
            <RotateCw className={`h-3 w-3 ${buttonsLoading ? 'animate-spin' : ''}`} />
            Toggle Loading State
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* SIZES MATRIX */}
          <div className="grid md:grid-cols-3 gap-6">
            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Size Small (sm)
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="sm" isLoading={buttonsLoading}>
                  Primary
                </Button>
                <Button variant="secondary" size="sm" isLoading={buttonsLoading}>
                  Secondary
                </Button>
                <Button variant="ghost" size="sm" isLoading={buttonsLoading}>
                  Ghost
                </Button>
                <Button variant="danger" size="sm" isLoading={buttonsLoading}>
                  Danger
                </Button>
              </div>
            </CinematicSurface>

            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Size Medium (md)
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="md" isLoading={buttonsLoading}>
                  Primary
                </Button>
                <Button variant="secondary" size="md" isLoading={buttonsLoading}>
                  Secondary
                </Button>
                <Button variant="ghost" size="md" isLoading={buttonsLoading}>
                  Ghost
                </Button>
                <Button variant="danger" size="md" isLoading={buttonsLoading}>
                  Danger
                </Button>
              </div>
            </CinematicSurface>

            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Size Large (lg)
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="lg" isLoading={buttonsLoading}>
                  Primary
                </Button>
                <Button variant="secondary" size="lg" isLoading={buttonsLoading}>
                  Secondary
                </Button>
                <Button variant="ghost" size="lg" isLoading={buttonsLoading}>
                  Ghost
                </Button>
                <Button variant="danger" size="lg" isLoading={buttonsLoading}>
                  Danger
                </Button>
              </div>
            </CinematicSurface>
          </div>

          {/* DISABLED / LOADING STATES */}
          <div className="grid md:grid-cols-2 gap-6">
            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Disabled State (disabled)
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled>
                  Primary Disabled
                </Button>
                <Button variant="secondary" disabled>
                  Secondary Disabled
                </Button>
                <Button variant="ghost" disabled>
                  Ghost Disabled
                </Button>
              </div>
            </CinematicSurface>

            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Forced Loading State (isLoading)
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" isLoading>
                  Saving Draft
                </Button>
                <Button variant="secondary" isLoading>
                  Connecting API
                </Button>
              </div>
            </CinematicSurface>
          </div>
        </div>
      </section>

      {/* SECTION 5: Badges & Tags */}
      <section id="badges">
        <EditorialSectionHeader
          title="Metadata Badge System"
          subtitle="Primitives / Badges"
          description="Used for ratings, status categories, tags, genres, and indicators across all cards and sections."
        />
        <div className="grid md:grid-cols-2 gap-6">
          <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Badge Size Medium (md - default)
            </h4>
            <MetadataBadgeGroup>
              <MetadataBadge variant="accent">Electric</MetadataBadge>
              <MetadataBadge variant="muted">Secondary</MetadataBadge>
              <MetadataBadge variant="success" icon={<Check className="h-3 w-3" />}>
                Active
              </MetadataBadge>
              <MetadataBadge variant="warning" icon={<Clock className="h-3 w-3" />}>
                Backlogged
              </MetadataBadge>
              <MetadataBadge variant="error" icon={<AlertTriangle className="h-3 w-3" />}>
                Dropped
              </MetadataBadge>
              <MetadataBadge variant="surface">Surface</MetadataBadge>
            </MetadataBadgeGroup>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Badge Size Small (sm)
            </h4>
            <MetadataBadgeGroup>
              <MetadataBadge variant="accent" size="sm">
                FPS
              </MetadataBadge>
              <MetadataBadge variant="muted" size="sm">
                2015
              </MetadataBadge>
              <MetadataBadge variant="success" size="sm">
                Completed
              </MetadataBadge>
              <MetadataBadge variant="warning" size="sm">
                Playing
              </MetadataBadge>
              <MetadataBadge variant="surface" size="sm">
                10 Items
              </MetadataBadge>
            </MetadataBadgeGroup>
          </CinematicSurface>
        </div>
      </section>

      {/* SECTION 6: Skeletons & Feedbacks */}
      <section id="feedback">
        <EditorialSectionHeader
          title="Feedback & State Elements"
          subtitle="Primitives / Feedback"
          description="Consistent visual modules for Loading, Empty, Success, and Error boundaries to govern system state changes."
        />
        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Loading skeletons demo */}
            <CinematicSurface elevation="raised" className="p-5 flex flex-col gap-4 justify-between">
              <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Skeleton Placeholders (circle, rect, text)
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="h-10 w-10" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skeleton variant="text" className="h-3 w-1/3" />
                    <Skeleton variant="text" className="h-2 w-1/4" />
                  </div>
                </div>
                <Skeleton variant="rect" className="h-16 w-full" />
              </div>
            </CinematicSurface>

            {/* Success State demo */}
            <SuccessState
              title="Review Published!"
              message="Your review draft has been successfully synchronized to the NestJS backend and is now live."
              actionLabel="View on profile"
              onAction={() => alert('Redirecting...')}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Empty State demo */}
            <EmptyState
              title="Collection is empty"
              description="You haven't cataloged any items inside this list yet. Start discovering games to add items."
              icon={Layers}
              actionLabel="Browse Games"
              onAction={() => alert('Navigating to Discover...')}
            />

            {/* Error State demo */}
            <ErrorState
              title="Failed to fetch reviews"
              message="The API gateway experienced a timeout. Verify your connection or try requesting the list again."
              onRetry={() => alert('Retrying network call...')}
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: Game Artwork Primitive */}
      <section id="artwork">
        <div className="flex items-center justify-between gap-4 mb-4">
          <EditorialSectionHeader
            title="Game Artwork Primitive"
            subtitle="Primitives / Media"
            description="Supports aspect ratio locking, fallback renders, custom cover scales, and shimmer skeletons during fetch."
            variant="minimal"
            className="mb-0 pb-0"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!artworkSrc}
              onClick={() => setArtworkSrc(null)}
            >
              Trigger Image Error (Fallback)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!!artworkSrc}
              onClick={() =>
                setArtworkSrc(
                  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
                )
              }
            >
              Restore Artwork Src
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <CinematicSurface elevation="raised" className="p-3 flex flex-col items-center gap-2">
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">avatar</span>
            <GameArtwork src={artworkSrc} alt="User avatar" variant="avatar" />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">1:1 Circle</span>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-3 flex flex-col items-center gap-2">
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">cover-sm</span>
            <GameArtwork src={artworkSrc} alt="Small Cover" variant="cover-sm" />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">3:4 W-12</span>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-3 flex flex-col items-center gap-2">
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">cover-md</span>
            <GameArtwork src={artworkSrc} alt="Medium Cover" variant="cover-md" />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">3:4 W-36</span>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-3 flex flex-col items-center gap-2">
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">cover-lg</span>
            <GameArtwork src={artworkSrc} alt="Large Cover" variant="cover-lg" />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">3:4 W-48</span>
          </CinematicSurface>

          <CinematicSurface elevation="raised" className="p-3 flex flex-col items-center gap-2 col-span-2 sm:col-span-1">
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">backdrop</span>
            <GameArtwork src={artworkSrc} alt="Cinematic Backdrop" variant="backdrop" className="w-full" />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">16:9 Video</span>
          </CinematicSurface>
        </div>
      </section>

      {/* SECTION 8: Regression Previews / Realistic Mockups */}
      <section id="regression">
        <EditorialSectionHeader
          title="Visual Regression Previews"
          subtitle="Mock Layout Compositions"
          description="Realistic mockups of actual application sections to verify margins, grid alignment, typography flow, and visual consistency."
          variant="large"
        />

        <div className="flex flex-col gap-12">
          {/* Preview A: Game Cards & Shelves */}
          <div>
            <EditorialSectionHeader
              title="Shelf / Game Card Composition"
              subtitle="Regression Preview A"
              description="A mock shelf utilizing the EditorialSectionHeader alongside standardized GameArtwork components."
              variant="minimal"
              action={
                <Button variant="ghost" size="sm" className="text-[var(--color-accent)]">
                  View all titles <ExternalLink className="h-3 w-3" />
                </Button>
              }
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { title: 'The Witcher 3: Wild Hunt', rating: '9.4', src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80' },
                { title: 'Elden Ring', rating: '9.6', src: 'https://images.unsplash.com/photo-1655821888788-6107699e173b?w=400&q=80' },
                { title: 'Cyberpunk 2077', rating: '8.2', src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80' },
                { title: 'Red Dead Redemption 2', rating: '9.7', src: null },
                { title: 'Portal 2', rating: '9.8', src: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80' },
                { title: 'Hades', rating: '9.3', src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80' },
              ].map((g, idx) => (
                <CinematicSurface
                  key={idx}
                  elevation="raised"
                  hoverable
                  className="group flex flex-col h-full bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)]"
                >
                  <div className="relative w-full aspect-[3/4]">
                    <GameArtwork
                      src={g.src}
                      alt={g.title}
                      variant="cover-md"
                      className="w-full h-full border-none rounded-none"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[var(--color-warning)] font-bold text-[10px] z-20">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {g.rating}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--color-accent-muted)]">
                      RPG / Action
                    </span>
                    <h4 className="font-ui text-xs font-bold text-[var(--color-text-primary)] leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {g.title}
                    </h4>
                  </div>
                </CinematicSurface>
              ))}
            </div>
          </div>

          {/* Preview B: Editorial Reviews column */}
          <div>
            <EditorialSectionHeader
              title="Prose / Review Column Composition"
              subtitle="Regression Preview B"
              description="A mock review stream demonstrating prose layout constraints, user headers, and badge alignments."
              variant="minimal"
            />

            <div className="flex flex-col gap-6 max-w-[var(--measure-review)]">
              {[
                {
                  user: 'GeraltOfRivia',
                  rating: 10,
                  game: 'The Witcher 3',
                  time: '2 hours ago',
                  text: "The Bloody Baron questline remains the highest peak of narrative execution gaming has ever achieved. It captures complex domestic tragedy without reducing characters to simple heroes or villains. A decade later, it still sets the standard for roleplaying story columns. Truly a masterpiece.",
                },
                {
                  user: 'LetoTheSlayer',
                  rating: 8,
                  game: 'Cyberpunk 2077',
                  time: 'Yesterday',
                  text: "Despite the launch bugs, Night City is one of the most stunningly atmospheric sandbox layouts ever composed. Moving around under the neon glow in first-person feels genuinely cinematic. The writing is punchy, though the primary story campaign ends slightly prematurely.",
                },
              ].map((rev, idx) => (
                <CinematicSurface
                  key={idx}
                  elevation="raised"
                  className="p-5 flex flex-col gap-4 border border-[var(--color-border-subtle)]"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] text-xs font-bold font-mono">
                        {rev.user.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-ui text-xs font-bold text-[var(--color-text-primary)]">
                            {rev.user}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            reviewed {rev.game}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
                          {rev.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--color-text-muted)]">Rating:</span>
                      <MetadataBadge variant="warning" className="font-bold">
                        <Star className="h-3 w-3 fill-current mr-0.5" />
                        {rev.rating}.0
                      </MetadataBadge>
                    </div>
                  </div>

                  <p className="font-ui text-sm leading-[var(--line-height-prose)] text-[var(--color-text-secondary)]">
                    "{rev.text}"
                  </p>

                  <div className="flex items-center gap-2 border-t border-[var(--color-border-subtle)] pt-3 text-[10px] text-[var(--color-text-muted)]">
                    <Button variant="ghost" size="sm" className="px-1.5 py-0.5 text-[10px]">
                      Like Review
                    </Button>
                    <span>•</span>
                    <Button variant="ghost" size="sm" className="px-1.5 py-0.5 text-[10px]">
                      Share
                    </Button>
                  </div>
                </CinematicSurface>
              ))}
            </div>
          </div>

          {/* Preview C: ranked collection row */}
          <div>
            <EditorialSectionHeader
              title="Ranked List Row Composition"
              subtitle="Regression Preview C"
              description="A mock ranked collection item showing horizontal order hierarchy, rating summaries, and list actions."
              variant="minimal"
            />

            <div className="flex flex-col gap-3">
              {[
                { rank: 1, title: 'Elden Ring', score: '9.6', year: '2022', desc: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.' },
                { rank: 2, title: 'The Witcher 3: Wild Hunt', score: '9.4', year: '2015', desc: 'Geralt of Rivia search for his child of prophecy in a war-torn dark fantasy world filled with monsters.' },
              ].map((item, idx) => (
                <CinematicSurface
                  key={idx}
                  elevation="raised"
                  className="p-3 flex items-center gap-4 hover:border-[var(--color-border)] transition-colors"
                >
                  <span className="font-display text-[var(--font-size-display-md)] text-[var(--color-accent)] w-8 text-center">
                    #{item.rank}
                  </span>
                  <GameArtwork
                    alt={item.title}
                    variant="cover-sm"
                    className="w-10 h-14"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-ui text-sm font-bold text-[var(--color-text-primary)] truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-bold">
                        ({item.year})
                      </span>
                    </div>
                    <p className="font-ui text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5 max-w-[var(--measure-synopsis)]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <MetadataBadge variant="warning" className="font-bold flex-shrink-0">
                      <Star className="h-3 w-3 fill-current mr-0.5" />
                      {item.score}
                    </MetadataBadge>
                    <Button variant="ghost" size="sm" className="px-2 py-1">
                      <Trash className="h-3.5 w-3.5 text-[var(--color-error)]" />
                    </Button>
                  </div>
                </CinematicSurface>
              ))}
            </div>
          </div>

          {/* Preview D: User Profile Grid */}
          <div>
            <EditorialSectionHeader
              title="Profile / Statistics Layout"
              subtitle="Regression Preview D"
              description="A mock user profile dashboard rendering statistic layout grids, user indicators, and recent library activity shelves."
              variant="minimal"
            />

            <div className="grid md:grid-cols-3 gap-6">
              {/* User Hero Banner */}
              <CinematicSurface elevation="raised" className="md:col-span-2 p-6 flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] flex items-center justify-center font-display text-2xl font-bold">
                    GP
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--color-success)] border-2 border-[var(--color-surface-raised)] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-ui text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                    Guneshbari_Player
                  </h3>
                  <p className="font-ui text-xs text-[var(--color-text-muted)] mt-1">
                    Gamer profile • Member since June 2026
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button variant="secondary" size="sm">
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Playlog
                    </Button>
                  </div>
                </div>
              </CinematicSurface>

              {/* Statistics Grid */}
              <CinematicSurface elevation="raised" className="p-6 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                    Total Plays
                  </span>
                  <span className="font-display text-[var(--font-size-display-md)] text-[var(--color-text-primary)] mt-1">
                    148
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                    Backlog
                  </span>
                  <span className="font-display text-[var(--font-size-display-md)] text-[var(--color-accent)] mt-1">
                    34
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                    Reviews
                  </span>
                  <span className="font-display text-[var(--font-size-display-md)] text-[var(--color-text-primary)] mt-1">
                    23
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                    Avg Rating
                  </span>
                  <span className="font-display text-[var(--font-size-display-md)] text-[var(--color-warning)] mt-1">
                    8.4
                  </span>
                </div>
              </CinematicSurface>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
