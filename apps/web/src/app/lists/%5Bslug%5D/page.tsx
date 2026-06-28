import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { listsApi } from '@/lib/api/lists'
import { CuratedListDetailInteractive } from '@/components/lists/CuratedListDetailInteractive'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const list = await listsApi.getBySlug(slug)
    const title = `${list.title} by ${list.user.displayName ?? list.user.username} — Continue`
    return {
      title,
      description:
        list.description ??
        `A curated collection of games compiled by ${list.user.username} on Continue.`,
      openGraph: {
        title,
        description: list.description ?? `Check out this curated collection of games.`,
        type: 'article',
      },
    }
  } catch {
    return { title: 'Collection Not Found — Continue' }
  }
}

export default async function CuratedCollectionDetailPage({ params }: PageProps) {
  const { slug } = await params

  let list
  try {
    list = await listsApi.getBySlug(slug)
  } catch {
    notFound()
  }

  const curatorName = list.user.displayName ?? list.user.username

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.description ?? `A curated collection of games on Continue.`,
    numberOfItems: list.items.length,
    itemListElement: list.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoGame',
        name: item.game.title,
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://continue.app'}/games/${item.game.slug}`,
      },
    })),
  }

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Schema.org ItemList JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back Link */}
      <Link
        href={`/u/${list.user.username}/lists`}
        className="text-text-muted hover:text-accent mb-6 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All lists by {curatorName}
      </Link>

      {/* Curated Interactive Details Body */}
      <CuratedListDetailInteractive list={list} />
    </main>
  )
}
