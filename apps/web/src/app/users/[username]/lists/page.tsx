import type { Metadata } from 'next'
import { listsApi, type ListSummary } from '@/lib/api/lists'
import { UserListsManager } from '@/components/lists/UserListsManager'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `${username}'s Lists` }
}

export default async function UserListsPage({ params }: PageProps) {
  const { username } = await params
  let lists: ListSummary[] = []
  try {
    const data = await listsApi.byUser(username)
    lists = Array.isArray(data) ? data : []
  } catch {
    lists = []
  }

  return (
    <main className="site-container user-lists-page">
      <UserListsManager initialLists={lists} username={username} />
    </main>
  )
}
