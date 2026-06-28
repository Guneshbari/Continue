import { Star, MessageSquare, Layers, Calendar, Bookmark, Plus } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'RATING' | 'REVIEW' | 'LIST' | 'LIBRARY_CHANGE' | 'LIST_ADD'
  title: string
  subtitle?: string | null
  gameTitle?: string
  gameSlug?: string
  score?: number
  slug?: string
  date: string
}

interface ActivityOverviewProps {
  ratings: any[]
  reviews: any[]
  lists: any[]
  username: string
  isOwner: boolean
}

export function ActivityOverview({
  ratings,
  reviews,
  lists,
  username: _username,
  isOwner: _isOwner,
}: ActivityOverviewProps) {
  const activities: ActivityItem[] = []

  // Add ratings
  ratings.slice(0, 4).forEach((r) => {
    activities.push({
      id: `rating-${r.id}`,
      type: 'RATING',
      title: `Rated ${r.game.title}`,
      gameTitle: r.game.title,
      gameSlug: r.game.slug,
      score: r.score,
      date: r.createdAt || r.updatedAt,
    })
  })

  // Add reviews
  reviews.slice(0, 4).forEach((rev) => {
    activities.push({
      id: `review-${rev.id}`,
      type: 'REVIEW',
      title: `Reviewed ${rev.game.title}`,
      subtitle: rev.title,
      gameTitle: rev.game.title,
      gameSlug: rev.game.slug,
      date: rev.createdAt,
    })
  })

  // Add lists, list additions and library changes
  lists.forEach((l) => {
    activities.push({
      id: `list-${l.id}`,
      type: 'LIST',
      title: `Created collection "${l.title}"`,
      slug: l.slug,
      date: l.createdAt,
    })

    const isStatusList = ['playing', 'completed', 'dropped', 'backlog', 'wishlist'].includes(l.slug)

    if (l.items && Array.isArray(l.items)) {
      l.items.forEach((item: any) => {
        if (!item || !item.game) return

        if (isStatusList) {
          let actionText = `Moved ${item.game.title} to ${l.title}`
          if (l.slug === 'playing') actionText = `Started playing ${item.game.title}`
          if (l.slug === 'completed') actionText = `Completed ${item.game.title}`
          if (l.slug === 'dropped') actionText = `Dropped ${item.game.title}`
          if (l.slug === 'backlog') actionText = `Added ${item.game.title} to backlog`
          if (l.slug === 'wishlist') actionText = `Added ${item.game.title} to wishlist`

          activities.push({
            id: `library-${l.id}-${item.game.id}`,
            type: 'LIBRARY_CHANGE',
            title: actionText,
            gameTitle: item.game.title,
            gameSlug: item.game.slug,
            date: item.createdAt || l.updatedAt,
          })
        } else {
          activities.push({
            id: `list-add-${l.id}-${item.game.id}`,
            type: 'LIST_ADD',
            title: `Added ${item.game.title} to collection "${l.title}"`,
            gameTitle: item.game.title,
            gameSlug: item.game.slug,
            date: item.createdAt || l.updatedAt,
          })
        }
      })
    }
  })

  // Sort chronological
  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  if (sortedActivities.length === 0) {
    return (
      <div className="bg-surface-raised border-border-subtle text-text-muted rounded-xl border p-5 text-center text-sm">
        No recent profile activity to showcase.
      </div>
    )
  }

  const iconMap = {
    RATING: <Star size={12} className="text-warning" />,
    REVIEW: <MessageSquare size={12} className="text-accent" />,
    LIST: <Layers size={12} className="text-success" />,
    LIBRARY_CHANGE: <Bookmark size={12} className="text-accent" />,
    LIST_ADD: <Plus size={12} className="text-success" />,
  }

  return (
    <div className="bg-surface-raised border-border-subtle rounded-xl border p-5">
      <h3 className="text-text-muted mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
        <Calendar size={14} aria-hidden="true" />
        Activity highlights
      </h3>

      <div className="border-border-subtle relative flex flex-col gap-5 border-l pl-4">
        {sortedActivities.map((act) => (
          <div key={act.id} className="relative flex flex-col">
            {/* Dot indicator */}
            <div
              className="w-4.5 h-4.5 bg-surface-raised border-border absolute left-[-23px] top-[2px] flex items-center justify-center rounded-full border shadow-sm"
              aria-hidden="true"
            >
              {iconMap[act.type]}
            </div>

            <div className="mb-0.5 flex items-baseline justify-between gap-4">
              {/* Event description */}
              <span className="text-text-primary text-xs font-semibold leading-tight">
                {act.type === 'RATING' && act.gameSlug ? (
                  <>
                    Rated{' '}
                    <Link
                      href={`/games/${act.gameSlug}`}
                      className="hover:text-accent decoration-border-strong underline transition-colors"
                    >
                      {act.gameTitle}
                    </Link>{' '}
                    <span className="text-warning font-bold">{act.score}/10</span>
                  </>
                ) : act.type === 'REVIEW' && act.gameSlug ? (
                  <>
                    Reviewed{' '}
                    <Link
                      href={`/games/${act.gameSlug}`}
                      className="hover:text-accent decoration-border-strong underline transition-colors"
                    >
                      {act.gameTitle}
                    </Link>
                  </>
                ) : act.type === 'LIST' && act.slug ? (
                  <>
                    Created list{' '}
                    <Link
                      href={`/lists/${act.slug}`}
                      className="hover:text-accent decoration-border-strong underline transition-colors"
                    >
                      {act.title.replace('Created collection ', '')}
                    </Link>
                  </>
                ) : (act.type === 'LIBRARY_CHANGE' || act.type === 'LIST_ADD') && act.gameSlug ? (
                  <>
                    {act.title.split(act.gameTitle ?? '')[0]}
                    <Link
                      href={`/games/${act.gameSlug}`}
                      className="hover:text-accent decoration-border-strong underline transition-colors"
                    >
                      {act.gameTitle}
                    </Link>
                    {act.title.split(act.gameTitle ?? '')[1]}
                  </>
                ) : (
                  act.title
                )}
              </span>

              {/* Date */}
              <span className="text-text-muted shrink-0 whitespace-nowrap text-[9px] font-medium uppercase tracking-wider">
                {new Date(act.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {act.type === 'REVIEW' && act.subtitle && (
              <span className="text-text-secondary border-border mt-0.5 border-l pl-1 text-[10px] italic">
                "{act.subtitle}"
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
