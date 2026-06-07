import Image from 'next/image'
import Link from 'next/link'
import { Layers } from 'lucide-react'
import type { SeedCollection } from '@/test-fixtures/seed'

type CommunityCollectionsSectionProps = Readonly<{
  collections: SeedCollection[]
}>

export function CommunityCollectionsSection({ collections }: CommunityCollectionsSectionProps) {
  if (collections.length === 0) return null

  return (
    <section className="community-collections" aria-labelledby="community-collections-title">
      <div className="community-collections__header">
        <h2 className="community-collections__title" id="community-collections-title">
          Community Collections
        </h2>
        <Link href="/lists" className="discovery-section__view-all">
          Browse all lists
        </Link>
      </div>

      <ul className="community-collections__list">
        {collections.map((collection) => (
          <li key={collection.id}>
            <Link
              href={`/lists`}
              className="collection-card"
              aria-label={`${collection.title} — ${collection.gameCount} games, curated by ${collection.curator.displayName}`}
            >
              {/* Cover mosaic */}
              <div className="collection-card__mosaic" aria-hidden="true">
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

              {/* Info */}
              <div className="collection-card__info">
                <div className="collection-card__title-row">
                  <Layers size={14} className="collection-card__icon" aria-hidden="true" />
                  <h3 className="collection-card__title">{collection.title}</h3>
                </div>
                <p className="collection-card__description">{collection.description}</p>
                <div className="collection-card__meta">
                  <span className="collection-card__curator">
                    by {collection.curator.displayName}
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
    </section>
  )
}
