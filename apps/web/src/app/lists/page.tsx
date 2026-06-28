'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { List, Layers, Loader2, Compass } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { listsApi, type ListSummary } from '@/lib/api/lists'
import { UserListsManager } from '@/components/lists/UserListsManager'
import type { DiscoveryCollection } from '@continue/types'
import Image from 'next/image'

export default function ListsPage() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<'my-lists' | 'community'>('my-lists')
  const [userLists, setUserLists] = useState<ListSummary[]>([])
  const [discoveryLists, setDiscoveryLists] = useState<DiscoveryCollection[]>([])
  const [loadingUser, setLoadingUser] = useState(false)
  const [loadingDiscovery, setLoadingDiscovery] = useState(false)

  // Load community lists
  useEffect(() => {
    async function loadDiscovery() {
      setLoadingDiscovery(true)
      try {
        const data = await listsApi.discoveryCollections(12)
        setDiscoveryLists(data)
      } catch (err) {
        console.error('Failed to load discovery collections:', err)
      } finally {
        setLoadingDiscovery(false)
      }
    }
    loadDiscovery()
  }, [])

  // Load user lists if logged in
  useEffect(() => {
    if (!user) {
      setActiveTab('community')
      return
    }

    const username = user.username

    async function loadUserLists() {
      setLoadingUser(true)
      try {
        const data = await listsApi.byUser(username, token ?? undefined)
        setUserLists(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load user lists:', err)
      } finally {
        setLoadingUser(false)
      }
    }
    setActiveTab('my-lists')
    loadUserLists()
  }, [user, token])

  return (
    <main className="site-container lists-page" id="main-content">
      <div className="lists-page__header-tabs">
        {user && (
          <button
            onClick={() => setActiveTab('my-lists')}
            className={`lists-page__tab ${activeTab === 'my-lists' ? 'lists-page__tab--active' : ''}`}
            aria-current={activeTab === 'my-lists' ? 'page' : undefined}
          >
            <List size={18} />
            My Lists
          </button>
        )}
        <button
          onClick={() => setActiveTab('community')}
          className={`lists-page__tab ${activeTab === 'community' ? 'lists-page__tab--active' : ''}`}
          aria-current={activeTab === 'community' ? 'page' : undefined}
        >
          <Compass size={18} />
          Community Collections
        </button>
      </div>

      <div className="lists-page__content">
        {activeTab === 'my-lists' &&
          user &&
          (loadingUser ? (
            <div className="lists-page__loading">
              <Loader2 className="spinner" />
              <span>Loading your lists...</span>
            </div>
          ) : (
            <UserListsManager initialLists={userLists} username={user.username} />
          ))}

        {activeTab === 'community' && (
          <div className="community-collections-full">
            <div className="community-collections__header">
              <h1 className="community-collections__title">
                <Layers
                  size={22}
                  className="title-icon"
                  style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}
                />
                Community Collections
              </h1>
              <p className="community-collections__subtitle">
                Explore curated lists and compilations from the Continue community.
              </p>
            </div>

            {loadingDiscovery ? (
              <div className="lists-page__loading">
                <Loader2 className="spinner" />
                <span>Exploring collections...</span>
              </div>
            ) : discoveryLists.length === 0 ? (
              <div className="lists-page__empty">
                <p>No community collections found.</p>
              </div>
            ) : (
              <ul className="community-collections__list">
                {discoveryLists.map((collection) => (
                  <li key={collection.id}>
                    <Link href={`/lists/${collection.slug}`} className="collection-card">
                      <div className="collection-card__mosaic">
                        {collection.covers.slice(0, 3).map((cover, i) => (
                          <div
                            key={i}
                            className="collection-card__mosaic-slot"
                            style={{ '--mosaic-index': i } as React.CSSProperties}
                          >
                            <Image
                              src={cover}
                              alt=""
                              fill
                              sizes="80px"
                              className="collection-card__mosaic-img"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="collection-card__info">
                        <div className="collection-card__title-row">
                          <Layers size={14} className="collection-card__icon" />
                          <h3 className="collection-card__title">{collection.title}</h3>
                        </div>
                        <p className="collection-card__description">{collection.description}</p>
                        <div className="collection-card__meta">
                          <span className="collection-card__curator">
                            by {collection.curator.displayName ?? collection.curator.username}
                          </span>
                          <span className="collection-card__count">
                            {collection.gameCount} games
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!user && (
              <div className="lists-page__cta">
                <h2>Create Your Own Collections</h2>
                <p>
                  Sign in to organize your gaming catalog, track your backlog, and build your lists.
                </p>
                <Link href="/login" className="btn btn--primary">
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
