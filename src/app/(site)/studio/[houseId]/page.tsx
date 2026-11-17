import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getHouseCard, getHouseTotals, getRoomsOfHouse, parseItems } from '@/lib/data'
import { query } from '@/db'
import { money, roomTypeLabel, styleLabel } from '@/lib/design'
import { HouseSettings } from '@/components/house-settings'
import { RoomCreator } from '@/components/room-creator'
import { RoomPlan } from '@/components/room-plan'
import { HouseBuilder } from '@/components/house-builder'
import { Icon } from '@/components/icons'
import type { LayoutItem } from '@/lib/types'

export default async function StudioHousePage({ params }: { params: Promise<{ houseId: string }> }) {
  const { houseId } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=/studio/${houseId}`)

  const house = await getHouseCard(houseId, user.id)
  if (!house) notFound()
  if (house.user_id !== user.id) notFound()

  const [rooms, total] = await Promise.all([getRoomsOfHouse(houseId), getHouseTotals(houseId)])
  const planRows = await query<{ room_id: string; items: unknown }>(
    `SELECT r.id AS room_id, l.items FROM rooms r LEFT JOIN layouts l ON l.id = r.active_layout_id WHERE r.house_id = $1`,
    [houseId],
  )
  const plans = new Map(planRows.map((p) => [p.room_id, parseItems(p.items)]))
  const pieceCount = Array.from(plans.values()).reduce((sum, items) => sum + (items as LayoutItem[]).length, 0)

  return (
    <div className="shell studio-shell">
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <span>{house.name}</span>
      </div>

      <div className="studio-top">
        <div>
          <span className="eyebrow">
            <span className="dot" /> Studio · {styleLabel(house.style)}
          </span>
          <h1 style={{ marginTop: 12 }}>{house.name}</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: '56ch' }}>
            {house.description || 'No description yet — add one in the house settings.'}
          </p>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <Link href={`/houses/${house.id}`} className="btn btn-ghost btn-sm">
            <Icon name="eye" className="icon icon-sm" /> Preview as visitor
          </Link>
          <HouseBuilder trigger="New house" />
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 26 }}>
        <div className="stat-card">
          <span>Rooms</span>
          <strong>{rooms.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pieces placed</span>
          <strong>{pieceCount}</strong>
        </div>
        <div className="stat-card">
          <span>Furniture total</span>
          <strong>{money(total)}</strong>
        </div>
        <div className="stat-card">
          <span>Visibility</span>
          <strong style={{ fontSize: '1.2rem' }}>{house.is_public ? 'Public' : 'Private'}</strong>
        </div>
      </div>

      <div className="studio-grid">
        <div>
          <div className="panel stack" style={{ gap: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3>Rooms</h3>
                <p className="panel-sub">Open a room to plan it in 2D and 3D.</p>
              </div>
              <span className="badge badge-lav">{styleLabel(house.style)}</span>
            </div>

            <div className="room-list">
              {rooms.map((room) => {
                const items = plans.get(room.id) ?? []
                return (
                  <div key={room.id} className="room-row">
                    <div className="mini">
                      <RoomPlan room={room} items={items} />
                    </div>
                    <div className="room-row-body">
                      <strong>{room.name}</strong>
                      <span>
                        {roomTypeLabel(room.type)} · {room.width_cm}×{room.length_cm} cm ·{' '}
                        {((room.width_cm * room.length_cm) / 10000).toFixed(1)} m²
                      </span>
                      <span style={{ color: 'var(--ink-faint)' }}>
                        {items.length} pieces · {money(room.total)}
                      </span>
                    </div>
                    <div className="room-row-actions">
                      <Link href={`/houses/${house.id}/rooms/${room.id}`} className="icon-btn" title="View room">
                        <Icon name="eye" className="icon icon-sm" />
                      </Link>
                      <Link href={`/studio/${house.id}/${room.id}`} className="btn btn-primary btn-xs">
                        <Icon name="edit" className="icon icon-sm" /> Plan
                      </Link>
                    </div>
                  </div>
                )
              })}
              {!rooms.length ? (
                <div className="empty">
                  <h3>No rooms yet</h3>
                  <p>Add the first room and the planner will open with your measurements already set.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <RoomCreator houseId={house.id} defaultTheme={house.theme} />
          <HouseSettings house={house} />
        </div>
      </div>
    </div>
  )
}
