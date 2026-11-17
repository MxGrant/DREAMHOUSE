import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import { findFreeSpot, sanitizeItems } from '@/lib/layout'
import { parseItems } from '@/lib/data'
import type { FurnitureRow, LayoutItem, RoomRow } from '@/lib/types'

/** Add a catalogue piece to a room's active layout (used by the catalogue page). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const room = await one<RoomRow & { owner: string }>(
      `SELECT r.*, h.user_id AS owner FROM rooms r JOIN houses h ON h.id = r.house_id WHERE r.id = $1`,
      [id],
    )
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)

    const data = await body<{ furnitureId?: string }>(req)
    const furnitureId = str(data.furnitureId)
    const piece = await one<FurnitureRow>('SELECT * FROM furniture WHERE id = $1', [furnitureId])
    if (!piece) return fail('That piece is not in the catalogue.', 404)

    let layoutId = room.active_layout_id
    let items: LayoutItem[] = []
    if (layoutId) {
      const layout = await one<{ id: string; items: unknown }>('SELECT id, items FROM layouts WHERE id = $1', [layoutId])
      items = layout ? parseItems(layout.items) : []
    } else {
      layoutId = crypto.randomUUID()
      await execute('INSERT INTO layouts (id, room_id, name, items) VALUES ($1,$2,$3,$4)', [
        layoutId,
        id,
        'Signature layout',
        JSON.stringify([]),
      ])
      await execute('UPDATE rooms SET active_layout_id = $1 WHERE id = $2', [layoutId, id])
    }

    const spot = findFreeSpot(items, room.width_cm, room.length_cm, piece.width, piece.depth, piece.category)
    const item: LayoutItem = {
      id: crypto.randomUUID(),
      furnitureId: piece.id,
      name: piece.name,
      category: piece.category,
      x: spot.x,
      y: spot.y,
      w: piece.width,
      d: piece.depth,
      h: piece.height,
      rotation: 0,
      color: piece.color,
      price: piece.price,
    }
    const next = sanitizeItems([...items, item])
    await execute('UPDATE layouts SET items = $1::jsonb, updated_at = now() WHERE id = $2', [
      JSON.stringify(next),
      layoutId,
    ])
    await execute('UPDATE rooms SET active_layout_id = $1, updated_at = now() WHERE id = $2', [layoutId, id])
    return json({ ok: true, item, count: next.length, layoutId })
  } catch (err) {
    return errorResponse(err)
  }
}
