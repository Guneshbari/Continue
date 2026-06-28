import Link from 'next/link'
import { Layers } from 'lucide-react'
import type { SeedCollection } from '@/test-fixtures/seed'
import { MotionFade, MotionStagger, MotionStaggerItem, MotionScale } from '@/components/motion'
import { GameArtwork } from '@/components/ui/GameArtwork'
import { MetadataBadge } from '@/components/ui/MetadataBadgeSystem'

type CommunityCollectionsSectionProps = Readonly<{
  collections: SeedCollection[]
  hideHeader?: boolean | undefined
}>

export function CommunityCollectionsSection({
  collections,
  hideHeader = false,
}: CommunityCollectionsSectionProps) {
  if (collections.length === 0) return null

  return (
    <section className="community-collections" aria-labelledby="community-collections-title">
      {!hideHeader && (
        <MotionFade direction="none" className="community-collections__header">
          <h2 className="community-collections__title" id="community-collections-title">
            Community Collections
          </h2>
          <Link href="/lists" className="discovery-section__view-all">
            Browse all lists
          </Link>
        </MotionFade>
      )}

      <MotionStagger preset="standard" className="community-collections__list">
        {collections.map((collection) => (
          <MotionStaggerItem key={collection.id}>
            <MotionScale hoverScale={1.02} tapScale={0.98}>
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
                      <GameArtwork
                        src={cover}
                        alt=""
                        variant="cover-sm"
                        hoverable={false}
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
                    <MetadataBadge variant="accent" size="sm">
                      {collection.gameCount} games
                    </MetadataBadge>
                  </div>
                </div>
              </Link>
            </MotionScale>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </section>
  )
}
