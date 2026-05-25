'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface PaginationLoaderProps {
  nextCursor: string | null
}

export function PaginationLoader({ nextCursor }: PaginationLoaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentCursor = searchParams.get('cursor')

  const handleNextPage = () => {
    if (!nextCursor) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('cursor', nextCursor)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearCursor = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('cursor')
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!nextCursor && !currentCursor) return null

  return (
    <div className="pagination-loader-container">
      {currentCursor && (
        <button
          onClick={handleClearCursor}
          className="pagination-loader-btn pagination-loader-btn--secondary"
          aria-label="Go back to first page"
        >
          Back to Start
        </button>
      )}
      {nextCursor && (
        <button
          onClick={handleNextPage}
          className="pagination-loader-btn"
          aria-label="Load next page of games"
        >
          Next Page
        </button>
      )}
    </div>
  )
}
