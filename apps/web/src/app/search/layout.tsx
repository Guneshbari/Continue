import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Games',
  description: 'Search the Continue catalogue by title, genre, or developer.',
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
