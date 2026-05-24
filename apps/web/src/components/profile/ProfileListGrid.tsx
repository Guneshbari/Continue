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

export function ProfileListGrid({ lists, username, isOwner, onCreateTrigger }: ProfileListGridProps) {
  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-surface-raised border border-border-subtle text-center min-h-[220px]">
        <Layers size={32} className="text-text-muted mb-3" aria-hidden="true" />
        <h3 className="text-lg font-bold text-text-primary mb-1">No lists curated</h3>
        <p className="text-sm text-text-muted max-w-sm mb-4">
          {isOwner
            ? "Create curated lists to showcase your favorite games, backlog targets, or themed collections."
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
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none m-0 p-0" role="list">
      {lists.map((list) => {
        // Extract covers from list items
        const covers: string[] = (list.items ?? [])
          .map((item: any) => item.game?.coverUrl)
          .filter((url: string | undefined): url is string => typeof url === 'string')

        return (
          <li key={list.id} className="flex">
            <Link
              href={`/lists/${list.slug}`}
              className="flex flex-col w-full rounded-xl overflow-hidden bg-surface-raised border border-border-subtle hover:border-border transition-all hover:translate-y-[-2px] group text-decoration-none color-inherit"
            >
              {/* Mosaic Covers Header */}
              <div className="relative h-28 bg-surface-sunken flex items-center justify-center overflow-hidden border-b border-border-subtle gap-1.5 p-3" aria-hidden="true">
                {covers.length === 0 ? (
                  <div className="text-text-muted opacity-40 flex flex-col items-center gap-1">
                    <Layers size={20} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Empty List</span>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full justify-center">
                    {covers.slice(0, 3).map((cover, i) => (
                      <div
                        key={i}
                        className="relative w-16 aspect-[3/4] rounded-md overflow-hidden shadow-lg border border-border-subtle transition-transform duration-300 group-hover:scale-105"
                        style={{
                          transform: `translateY(${i === 1 ? '-4px' : '4px'}) rotate(${i === 0 ? '-6deg' : i === 2 ? '6deg' : '0deg'})`,
                          zIndex: i === 1 ? 2 : 1,
                        }}
                      >
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col justify-between flex-1 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                      {list.title}
                    </h3>
                    <span className="text-text-muted shrink-0">
                      {visibilityIcon[list.visibility]}
                    </span>
                  </div>
                  {list.description && (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
                      {list.description}
                    </p>
                  )}
                </div>

                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-auto">
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
