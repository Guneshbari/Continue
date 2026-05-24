import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { usersApi } from '@/lib/api/users'
import { listsApi } from '@/lib/api/lists'
import { UserListsManager } from '@/components/lists/UserListsManager'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await usersApi.profile(username)
    const name = user.displayName ?? user.username
    return {
      title: `${name}'s Curated Collections — Continue`,
      description: `Explore custom folders, backlogs, and catalogs curated by ${name}.`,
    }
  } catch {
    return { title: 'Collections Not Found — Continue' }
  }
}

export default async function UserListsPage({ params }: PageProps) {
  const { username } = await params

  let lists

  try {
    const [, listsRes] = await Promise.all([
      usersApi.profile(username),
      listsApi.byUser(username),
    ])
    lists = listsRes
  } catch {
    notFound()
  }

  return (
    <main className="site-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <UserListsManager initialLists={lists} username={username} />
    </main>
  )
}
