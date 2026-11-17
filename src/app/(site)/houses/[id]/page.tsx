import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getComments, getHouseCard, getHouseTotals, getRoomsOfHouse, parseItems } from '@/lib/data'
import { query } from '@/db'
import { money, roomTypeLabel, styleLabel, prettyDate } from '@/lib/design'
import { Avatar } from '@/components/avatar'
import { AddToCollection } from '@/components/add-to-collection'
import { CommentForm } from '@/components/comment-form'
import { Icon } from '@/components/icons'
import { RoomPlan } from '@/components/room-plan'
import { FollowButton, LikeButton, SaveButton, ShareButton } from '@/components/social'
import type { LayoutItem } from '@/lib/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const house = await getHouseCard(id, null)
  if (!house) return { title: 'Design not found — Dreamhouse' }
  if (!house.is_public) return { title: 'A private design — Dreamhouse', robots: { index: false } }
  const description = house.description || `${house.room_count} rooms planned in Dreamhouse.`
  return {
    title: `${house.name} — Dreamhouse`,
    description,
    openGraph: {
      title: house.name,
      description,
      images: [{ url: house.cover_image }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: house.name, description, images: [house.cover_image] },
  }
}

export default async function HousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const house = await getHouseCard(id, user?.id ?? null)
  if (!house) notFound()
  if (!house.is_public && house.user_id !== user?.id) notFound()

  const [rooms, comments, total] = await Promise.all([
    getRoomsOfHouse(id),
    getComments(id),
    getHouseTotals(id),
  ])
  const plans = await query<{ room_id: string; items: unknown }>(
    `SELECT r.id AS room_id, l.items FROM rooms r
     LEFT JOIN layouts l ON l.id = r.active_layout_id WHERE r.house_id = $1`,
    [id],
  )
  const planMap = new Map(plans.map((p) => [p.room_id, parseItems(p.items)]))
  const isOwner = user?.id === house.user_id
  const author = await query<{ following: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2) AS following`,
    [user?.id ?? '', house.user_id],
  )
  const viewerCollections = user
    ? await query<{ id: string; title: string; has: boolean }>(
        `SELECT c.id, c.title,
           EXISTS(SELECT 1 FROM collection_houses ch WHERE ch.collection_id = c.id AND ch.house_id = $2) AS has
         FROM collections c WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
        [user.id, house.id],
      )
    : []

  return (
    <div className="shell">
      <div className="breadcrumb" style={{ paddingTop: 22 }}>
        <Link href="/">Home</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <Link href="/explore">Explore</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <span>{house.name}</span>
      </div>

      <div className="house-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={house.cover_image} alt={house.name} />
        <div className="house-hero-caption">
          <div>
            <div className="row wrap" style={{ gap: 8, marginBottom: 10 }}>
              <span className="chip">{styleLabel(house.style)}</span>
              <span className="chip">{house.room_count} rooms</span>
              {!house.is_public ? (
                <span className="chip">
                  <Icon name="lock" className="icon icon-sm" /> Private
                </span>
              ) : null}
            </div>
            <h1>{house.name}</h1>
            <p className="tiny" style={{ marginTop: 6, opacity: 0.85 }}>
              Updated {prettyDate(String(house.updated_at))}
            </p>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <LikeButton
              houseId={house.id}
              initialLiked={Boolean(house.liked)}
              initialCount={house.like_count}
              signedIn={Boolean(user)}
              compact
            />
            <SaveButton houseId={house.id} initialSaved={Boolean(house.saved)} signedIn={Boolean(user)} />
            <ShareButton title={house.name} path={`/houses/${house.id}`} />
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <p style={{ fontSize: '1.02rem', color: 'var(--ink-soft)', lineHeight: 1.75, maxWidth: '64ch' }}>
            {house.description}
          </p>

          <div className="row wrap" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36 }}>
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Rooms &amp; layouts</h2>
              <p className="muted" style={{ marginTop: 6, fontSize: '0.9rem' }}>
                Open any room to see the plan in 2D and walk it in 3D.
              </p>
            </div>
            {isOwner ? (
              <Link href={`/studio/${house.id}`} className="btn btn-primary btn-sm">
                <Icon name="edit" className="icon icon-sm" /> Open in studio
              </Link>
            ) : null}
          </div>

          <div className="room-strip">
            {rooms.map((room) => {
              const items = planMap.get(room.id) ?? []
              return (
                <Link key={room.id} href={`/houses/${house.id}/rooms/${room.id}`} className="room-card">
                  <div className="room-card-plan">
                    <RoomPlan room={room} items={items} />
                  </div>
                  <div className="room-card-body">
                    <strong>{room.name}</strong>
                    <span>
                      {roomTypeLabel(room.type)} · {room.width_cm}×{room.length_cm} cm ·{' '}
                      {((room.width_cm * room.length_cm) / 10000).toFixed(1)} m²
                    </span>
                    <span style={{ color: 'var(--ink-faint)' }}>
                      {items.length} pieces · {money(room.total)} furnishing
                    </span>
                  </div>
                </Link>
              )
            })}
            {!rooms.length ? (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                <h3>No rooms yet</h3>
                <p>This house is still a blank page. Check back soon.</p>
              </div>
            ) : null}
          </div>

          <section style={{ marginTop: 42 }}>
            <div className="row wrap" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.6rem' }}>Community notes</h2>
              <span className="tiny">{comments.length} notes</span>
            </div>
            <CommentForm houseId={house.id} signedIn={Boolean(user)} />
            <div style={{ marginTop: 8 }}>
              {comments.map((c) => (
                <div key={c.id} className="comment">
                  <Avatar name={c.author_name} hue={c.author_hue} size="md" />
                  <div className="comment-body">
                    <header>
                      <strong>{c.author_name}</strong>
                      <Link href={`/u/${c.author_handle}`} className="tiny">
                        @{c.author_handle}
                      </Link>
                      <span className="tiny" style={{ marginLeft: 'auto' }}>
                        {prettyDate(String(c.created_at))}
                      </span>
                    </header>
                    <p>{c.body}</p>
                  </div>
                </div>
              ))}
              {!comments.length ? <p className="tiny">No notes yet — be the first to say something kind.</p> : null}
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <div className="panel">
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={house.author_name} hue={house.author_hue} size="lg" />
              <div>
                <h3 style={{ fontSize: '1.05rem' }}>{house.author_name}</h3>
                <Link href={`/u/${house.author_handle}`} className="tiny">
                  @{house.author_handle}
                </Link>
              </div>
            </div>
            <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
              <FollowButton
                handle={house.author_handle}
                initialFollowing={Boolean(author[0]?.following)}
                signedIn={Boolean(user)}
                self={isOwner}
              />
              <Link href={`/u/${house.author_handle}`} className="btn btn-quiet btn-sm">
                See profile
              </Link>
            </div>
          </div>

          <div className="panel">
            <h3>Budget</h3>
            <p className="panel-sub">Furniture currently placed across the house.</p>
            <div className="stack" style={{ gap: 8, marginTop: 14 }}>
              <div className="kv">
                <span>Furnished total</span>
                <strong>{money(total)}</strong>
              </div>
              <div className="kv">
                <span>House budget</span>
                <strong>{money(house.budget)}</strong>
              </div>
              <div className={`budget-bar ${total > house.budget ? 'is-over' : ''}`}>
                <i style={{ width: `${Math.min(100, (total / Math.max(1, house.budget)) * 100)}%` }} />
              </div>
              <p className="tiny">
                {total > house.budget
                  ? `${money(total - house.budget)} over budget — the stylist can suggest swaps.`
                  : `${money(house.budget - total)} left for the last few things.`}
              </p>
            </div>
          </div>

          <div className="panel">
            <h3>Share this house</h3>
            <p className="panel-sub">
              {house.is_public
                ? 'Anyone with the link can view the rooms and plans.'
                : 'This house is private — only you can see it until you publish it.'}
            </p>
            <div className="row wrap" style={{ marginTop: 14 }}>
              <ShareButton title={house.name} path={`/houses/${house.id}`} />
              <Link href="/ai" className="btn btn-ghost btn-sm">
                <Icon name="sparkles" className="icon icon-sm" /> Ask the stylist
              </Link>
            </div>
          </div>

          <AddToCollection houseId={house.id} collections={viewerCollections} signedIn={Boolean(user)} />

          <div className="panel">
            <h3>Palette</h3>
            <p className="panel-sub">{styleLabel(house.style)} · {house.theme}</p>
            <div className="ai-palette" style={{ marginTop: 10 }}>
              {rooms.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="ai-swatch"
                  style={{ background: r.wall_color, minHeight: 52, fontSize: '0.62rem' }}
                  title={r.name}
                >
                  Wall
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
