import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getHouseCard, getRoomBundle } from '@/lib/data'
import { money, roomTypeLabel, styleLabel } from '@/lib/design'
import { Avatar } from '@/components/avatar'
import { Icon } from '@/components/icons'
import { RoomViewer } from '@/components/room-viewer'
import { LikeButton, SaveButton, ShareButton } from '@/components/social'
import type { LayoutItem } from '@/lib/types'

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const { id, roomId } = await params
  const user = await getCurrentUser()
  const house = await getHouseCard(id, user?.id ?? null)
  if (!house) notFound()
  if (!house.is_public && house.user_id !== user?.id) notFound()

  const bundle = await getRoomBundle(roomId)
  if (!bundle || bundle.room.house_id !== house.id) notFound()

  const items: LayoutItem[] = bundle.active?.items ?? []
  const total = items.reduce((sum, it) => sum + it.price, 0)
  const isOwner = user?.id === house.user_id
  const categories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <div className="shell" style={{ paddingTop: 24 }}>
      <div className="breadcrumb">
        <Link href="/explore">Explore</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <Link href={`/houses/${house.id}`}>{house.name}</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <span>{bundle.room.name}</span>
      </div>

      <div className="page-head-row" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">
            <span className="dot" /> {roomTypeLabel(bundle.room.type)} · {styleLabel(house.style)}
          </span>
          <h1 style={{ marginTop: 12 }}>{bundle.room.name}</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {items.length} pieces · {money(total)} of furniture · {bundle.layouts.length} saved design
            {bundle.layouts.length === 1 ? '' : 's'}
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
          <ShareButton title={`${bundle.room.name} · ${house.name}`} path={`/houses/${house.id}/rooms/${roomId}`} />
          {isOwner ? (
            <Link href={`/studio/${house.id}/${roomId}`} className="btn btn-primary btn-sm">
              <Icon name="edit" className="icon icon-sm" /> Edit this room
            </Link>
          ) : (
            <Link href={`/houses/${house.id}`} className="btn btn-ghost btn-sm">
              All rooms
            </Link>
          )}
        </div>
      </div>

      <div className="detail-grid" style={{ paddingTop: 0 }}>
        <div>
          <RoomViewer room={bundle.room} items={items} />
          <div className="row wrap" style={{ gap: 8, marginTop: 18 }}>
            {bundle.layouts.map((l) => (
              <span key={l.id} className={`chip ${l.id === bundle.active?.id ? 'is-active' : ''}`}>
                {l.name} · {l.items.length} pcs
              </span>
            ))}
          </div>
        </div>

        <aside className="detail-side">
          <div className="panel">
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={house.author_name} hue={house.author_hue} size="md" />
              <div>
                <strong style={{ fontSize: '0.92rem' }}>{house.author_name}</strong>
                <br />
                <Link href={`/u/${house.author_handle}`} className="tiny">
                  @{house.author_handle}
                </Link>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.6 }}>
              {house.description}
            </p>
          </div>

          <div className="panel">
            <h3>This room</h3>
            <div className="stack" style={{ gap: 8, marginTop: 12 }}>
              <div className="kv">
                <span>Floor area</span>
                <strong>{((bundle.room.width_cm * bundle.room.length_cm) / 10000).toFixed(1)} m²</strong>
              </div>
              <div className="kv">
                <span>Wall colour</span>
                <strong>
                  <span
                    className="swatch"
                    style={{ width: 16, height: 16, display: 'inline-block', background: bundle.room.wall_color }}
                  />{' '}
                  {bundle.room.wall_color}
                </strong>
              </div>
              <div className="kv">
                <span>Flooring</span>
                <strong>{bundle.room.floor_type}</strong>
              </div>
              <div className="kv">
                <span>Furniture</span>
                <strong>{money(total)}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>What is in here</h3>
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              {items
                .slice()
                .sort((a, b) => b.price - a.price)
                .slice(0, 8)
                .map((it) => (
                  <div key={it.id} className="kv">
                    <span>{it.name}</span>
                    <strong>{money(it.price)}</strong>
                  </div>
                ))}
            </div>
            <p className="tiny" style={{ marginTop: 10 }}>
              Categories: {categories.join(', ')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
