import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getCollection } from '@/lib/data'
import { HouseCard } from '@/components/house-card'
import { ShareButton } from '@/components/social'
import { Icon } from '@/components/icons'
import { CollectionControls, RemoveHouseButton } from '@/components/collection-controls'

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const data = await getCollection(id, user?.id ?? null)
  if (!data) notFound()
  const { collection, houses } = data
  const isOwner = user?.id === collection.user_id

  return (
    <div className="shell">
      <div className="breadcrumb" style={{ paddingTop: 24 }}>
        <Link href="/collections">Collections</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <span>{collection.title}</span>
      </div>

      <div className="page-head-row" style={{ paddingBottom: 10 }}>
        <div>
          <span className="eyebrow">
            <span className="dot" /> Collection by{' '}
            <Link href={`/u/${collection.author_handle}`}>@{collection.author_handle}</Link>
          </span>
          <h1 style={{ marginTop: 14 }}>{collection.title}</h1>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)', maxWidth: '58ch' }}>{collection.description}</p>
          <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
            <span className="chip">{houses.length} homes</span>
            <span className="chip">{collection.is_public ? 'Public' : 'Private'}</span>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <ShareButton title={collection.title} path={`/collections/${collection.id}`} />
          {isOwner ? <CollectionControls collection={collection} /> : null}
        </div>
      </div>

      {houses.length ? (
        <div className="card-grid card-grid-3" style={{ paddingTop: 22 }}>
          {houses.map((house, i) => (
            <div key={house.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <HouseCard house={house} signedIn={Boolean(user)} index={i} />
              {isOwner ? <RemoveHouseButton collectionId={collection.id} houseId={house.id} /> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty" style={{ marginTop: 26 }}>
          <h3>This collection is waiting for its first house</h3>
          <p>Open any design and use “Add to collection” to start filling it.</p>
          <Link href="/explore" className="btn btn-ghost btn-sm">
            Explore designs
          </Link>
        </div>
      )}
    </div>
  )
}
