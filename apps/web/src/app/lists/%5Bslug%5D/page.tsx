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
      description: list.description ?? `A curated collection of games compiled by ${list.user.username} on Continue.`,
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

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Back Link */}
      <Link
        href={`/u/${list.user.username}/lists`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All lists by {curatorName}
      </Link>

      {/* Curated Interactive Details Body */}
      <CuratedListDetailInteractive list={list} />
    </main>
  )
}
