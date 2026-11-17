import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { listHouses, listPublicCollections } from '@/lib/data'
import { ROOM_TYPES, STYLES, roomTypeLabel, styleLabel } from '@/lib/design'
import { HouseCard } from '@/components/house-card'
import { Icon } from '@/components/icons'

export const metadata = { title: 'Explore designs — Dreamhouse' }

const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'budget', label: 'Budget' },
  { id: 'rooms', label: 'Most rooms' },
]

function buildQuery(base: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  const merged = { ...base, ...patch }
  for (const [key, value] of Object.entries(merged)) {
    if (value && value !== 'all') params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `/explore?${qs}` : '/explore'
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string; type?: string; sort?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  const style = params.style ?? 'all'
  const type = params.type ?? 'all'
  const sort = params.sort ?? 'trending'

  const [houses, collections] = await Promise.all([
    listHouses({
      viewerId: user?.id ?? null,
      style: style === 'all' ? null : style,
      roomType: type === 'all' ? null : type,
      sort,
      limit: 40,
    }),
    listPublicCollections(4),
  ])

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Community
            </span>
            <h1 style={{ marginTop: 14 }}>Homes, rooms and very good ideas.</h1>
            <p>
              Browse {houses.length} published design{houses.length === 1 ? '' : 's'}. Like what you love, save it to
              your own boards, then open it in the planner to make it yours.
            </p>
          </div>
          <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary">
            <Icon name="plus" className="icon" /> Start your own
          </Link>
        </div>
      </div>

      <div className="panel" style={{ padding: 16, marginBottom: 24 }}>
        <div className="stack" style={{ gap: 12 }}>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="tiny" style={{ minWidth: 54 }}>
              Room
            </span>
            <Link href={buildQuery({ style, type, sort }, { type: 'all' })} className={`chip ${type === 'all' ? 'is-active' : ''}`}>
              All rooms
            </Link>
            {ROOM_TYPES.map((r) => (
              <Link
                key={r.id}
                href={buildQuery({ style, type, sort }, { type: r.id })}
                className={`chip ${type === r.id ? 'is-active' : ''}`}
              >
                {r.label}
              </Link>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="tiny" style={{ minWidth: 54 }}>
              Style
            </span>
            <Link href={buildQuery({ style, type, sort }, { style: 'all' })} className={`chip ${style === 'all' ? 'is-active' : ''}`}>
              All styles
            </Link>
            {STYLES.map((s) => (
              <Link
                key={s.id}
                href={buildQuery({ style, type, sort }, { style: s.id })}
                className={`chip ${style === s.id ? 'is-active' : ''}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="tiny" style={{ minWidth: 54 }}>
              Sort
            </span>
            {SORTS.map((s) => (
              <Link
                key={s.id}
                href={buildQuery({ style, type, sort }, { sort: s.id })}
                className={`chip ${sort === s.id ? 'is-active' : ''}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {houses.length ? (
        <div className="card-grid card-grid-3">
          {houses.map((house, i) => (
            <HouseCard key={house.id} house={house} signedIn={Boolean(user)} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No designs match those filters yet.</h3>
          <p>Try a different style or room type — or be the first to publish a {roomTypeLabel(type)} in {styleLabel(style)}.</p>
          <Link href="/explore" className="btn btn-primary btn-sm">
            Clear filters
          </Link>
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Public collections
            </span>
            <h2>Curated by the community.</h2>
          </div>
          <Link href="/collections" className="btn btn-ghost btn-sm">
            All collections <Icon name="arrow-right" className="icon icon-sm" />
          </Link>
        </div>
        <div className="card-grid card-grid-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="house-card">
              <div className="house-card-media" style={{ aspectRatio: '16 / 8' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.preview ? <img src={c.preview} alt={c.title} loading="lazy" /> : null}
              </div>
              <div className="house-card-body">
                <h3>{c.title}</h3>
                <p className="tiny" style={{ color: 'var(--ink-soft)' }}>
                  {c.house_count} homes · by {c.author_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
