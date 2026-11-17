import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getCollectionsFor, listPublicCollections } from '@/lib/data'
import { CollectionCreator } from '@/components/collection-creator'
import { Icon } from '@/components/icons'

export const metadata = { title: 'Collections — Dreamhouse' }

export default async function CollectionsPage() {
  const user = await getCurrentUser()
  const [publicCollections, mine] = await Promise.all([
    listPublicCollections(12),
    user ? getCollectionsFor(user.id, user.id) : Promise.resolve([]),
  ])

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Collections
            </span>
            <h1 style={{ marginTop: 14 }}>Houses that belong together.</h1>
            <p>Public collections from the community, plus your own private lists.</p>
          </div>
          {user ? <CollectionCreator /> : (
            <Link href="/login?next=/collections" className="btn btn-primary">
              Sign in to collect
            </Link>
          )}
        </div>
      </div>

      {user ? (
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Your collections</h2>
          <div className="card-grid card-grid-3">
            {mine.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="board-card">
                <div className="house-card-media" style={{ aspectRatio: '16 / 8' }}>
                  {c.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.preview} alt={c.title} loading="lazy" />
                  ) : null}
                </div>
                <div className="board-body">
                  <h3>{c.title}</h3>
                  <p className="tiny" style={{ color: 'var(--ink-soft)' }}>
                    {c.house_count} homes · {c.is_public ? 'Public' : 'Private'}
                  </p>
                </div>
              </Link>
            ))}
            {!mine.length ? (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                <h3>No collections yet</h3>
                <p>Create one, then add houses from any design page.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section style={{ marginBottom: 60 }}>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Public collections</h2>
            <p className="tiny">Curated by designers in the community.</p>
          </div>
        </div>
        <div className="card-grid card-grid-3">
          {publicCollections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="board-card">
              <div className="house-card-media" style={{ aspectRatio: '16 / 8' }}>
                {c.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.preview} alt={c.title} loading="lazy" />
                ) : null}
              </div>
              <div className="board-body">
                <h3>{c.title}</h3>
                <p className="tiny" style={{ color: 'var(--ink-soft)' }}>
                  {c.house_count} homes · by {c.author_name}
                </p>
                <p className="tiny" style={{ marginTop: 6, color: 'var(--ink-faint)' }}>
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
          {!publicCollections.length ? (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <h3>No public collections yet</h3>
              <p>Be the first to publish one.</p>
              <Link href="/explore" className="btn btn-ghost btn-sm">
                Browse designs <Icon name="arrow-right" className="icon icon-sm" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
