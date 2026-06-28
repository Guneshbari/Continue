import Link from 'next/link'
import Image from 'next/image'
import { Layers, Globe, Eye, Lock, Plus } from 'lucide-react'

interface ListSummaryItem {
  id: string
  slug: string
  title: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  _count: { items: number }
  items?: any
}

interface ProfileListGridProps {
  lists: ListSummaryItem[]
  username: string
  isOwner: boolean
  onCreateTrigger?: () => void
}

const visibilityIcon = {
  PUBLIC: <Globe size={11} aria-label="Public" />,
  UNLISTED: <Eye size={11} aria-label="Unlisted" />,
  PRIVATE: <Lock size={11} aria-label="Private" />,
}

export function ProfileListGrid({
  lists,
  username,
  isOwner,
  onCreateTrigger,
}: ProfileListGridProps) {
  if (lists.length === 0) {
    return (
      <div className="bg-surface-raised border-border-subtle flex min-h-[220px] flex-col items-center justify-center rounded-xl border p-8 text-center">
        <Layers size={32} className="text-text-muted mb-3" aria-hidden="true" />
        <h3 className="text-text-primary mb-1 text-lg font-bold">No lists curated</h3>
        <p className="text-text-muted mb-4 max-w-sm text-sm">
          {isOwner
            ? 'Create curated lists to showcase your favorite games, backlog targets, or themed collections.'
            : `${username} hasn't curated any collections yet.`}
        </p>
        {isOwner && onCreateTrigger && (
          <button onClick={onCreateTrigger} className="btn btn--primary btn--sm btn--icon">
            <Plus size={14} />
            Create List
          </button>
        )}
      </div>
    )
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3" role="list">
      {lists.map((list) => {
        // Extract covers from list items
        const covers: string[] = (list.items ?? [])
          .map((item: any) => item.game?.coverUrl)
          .filter((url: string | undefined): url is string => typeof url === 'string')

        return (
          <li key={list.id} className="flex">
            <Link
              href={`/lists/${list.slug}`}
              className="bg-surface-raised border-border-subtle hover:border-border text-decoration-none color-inherit group flex w-full flex-col overflow-hidden rounded-xl border transition-all hover:translate-y-[-2px]"
            >
              {/* Mosaic Covers Header */}
              <div
                className="bg-surface-sunken border-border-subtle relative flex h-28 items-center justify-center gap-1.5 overflow-hidden border-b p-3"
                aria-hidden="true"
              >
                {covers.length === 0 ? (
                  <div className="text-text-muted flex flex-col items-center gap-1 opacity-40">
                    <Layers size={20} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      Empty List
                    </span>
                  </div>
                ) : (
                  <div className="flex w-full justify-center gap-2">
                    {covers.slice(0, 3).map((cover, i) => (
                      <div
                        key={i}
                        className="border-border-subtle relative aspect-[3/4] w-16 overflow-hidden rounded-md border shadow-lg transition-transform duration-300 group-hover:scale-105"
                        style={{
                          transform: `translateY(${i === 1 ? '-4px' : '4px'}) rotate(${i === 0 ? '-6deg' : i === 2 ? '6deg' : '0deg'})`,
                          zIndex: i === 1 ? 2 : 1,
                        }}
                      >
                        <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3 className="text-text-primary group-hover:text-accent truncate text-sm font-bold transition-colors">
                      {list.title}
                    </h3>
                    <span className="text-text-muted shrink-0">
                      {visibilityIcon[list.visibility]}
                    </span>
                  </div>
                  {list.description && (
                    <p className="text-text-secondary mb-3 line-clamp-2 text-xs leading-relaxed">
                      {list.description}
                    </p>
                  )}
                </div>

                <div className="text-text-muted mt-auto text-[10px] font-bold uppercase tracking-wider">
                  {list._count.items} {list._count.items === 1 ? 'game' : 'games'}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
