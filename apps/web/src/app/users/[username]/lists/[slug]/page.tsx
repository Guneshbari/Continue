import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { listsApi } from '@/lib/api/lists'
import { Star, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  try {
    const list = await listsApi.getOne(username, slug)
    return { title: `${list.title} by ${username}`, description: list.description ?? undefined }
  } catch {
    return { title: 'List Not Found' }
  }
}

export default async function ListDetailPage({ params }: PageProps) {
  const { username, slug } = await params

  let list: Awaited<ReturnType<typeof listsApi.getOne>>
  try {
    list = await listsApi.getOne(username, slug)
  } catch {
    notFound()
  }

  const l = list

  return (
    <main className="site-container list-detail-page">
      {/* Back link */}
      <Link href={`/users/${username}/lists`} className="list-detail__back">
        <ArrowLeft size={16} aria-hidden="true" />
        All lists by {username}
      </Link>

      {/* Header */}
      <header className="list-detail__header">
        <h1 className="list-detail__title">{l.title}</h1>
        {l.description && <p className="list-detail__desc">{l.description}</p>}
        <div className="list-detail__meta">
          <Link href={`/users/${l.user.username}`} className="list-detail__author">
            {l.user.displayName ?? l.user.username}
          </Link>
          <span className="list-detail__count">
            {l._count.items} game{l._count.items !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Games */}
      {l.items.length === 0 ? (
        <div className="list-detail__empty">
          <p>No games in this list yet.</p>
        </div>
      ) : (
        <ol className="list-items" aria-label={`Games in ${l.title}`}>
          {l.items.map((item, idx) => (
            <li key={item.id} className="list-item-card">
              <span className="list-item-card__position" aria-hidden="true">
                {idx + 1}
              </span>

              <Link href={`/games/${item.game.slug}`} className="list-item-card__link">
                <div className="list-item-card__cover">
                  {item.game.coverUrl ? (
                    <Image
                      src={item.game.coverUrl}
                      alt={`${item.game.title} cover`}
                      fill
                      sizes="56px"
                      className="list-item-card__img"
                    />
                  ) : (
                    <div className="list-item-card__cover-placeholder" />
                  )}
                </div>

                <div className="list-item-card__info">
                  <span className="list-item-card__title">{item.game.title}</span>
                  {item.note && (
                    <span className="list-item-card__note">"{item.note}"</span>
                  )}
                  {item.game.releaseDate && (
                    <span className="list-item-card__year">
                      {new Date(item.game.releaseDate).getFullYear()}
                    </span>
                  )}
                </div>

                {item.game.avgRating !== null && (
                  <div className="list-item-card__rating">
                    <Star size={12} aria-hidden="true" />
                    {item.game.avgRating.toFixed(1)}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
