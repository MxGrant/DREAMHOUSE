import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json } from '@/lib/api'
import { sanitizeItems } from '@/lib/layout'
import type { RoomRow } from '@/lib/types'

/** Autosave the active layout of a room. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const room = await one<RoomRow & { owner: string }>(
      `SELECT r.*, h.user_id AS owner FROM rooms r JOIN houses h ON h.id = r.house_id WHERE r.id = $1`,
      [id],
    )
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)

    const data = await body<{ items?: unknown; layoutId?: string }>(req)
    const items = sanitizeItems(data.items)
    let layoutId = room.active_layout_id
    if (data.layoutId) {
      const check = await one<{ id: string }>('SELECT id FROM layouts WHERE id = $1 AND room_id = $2', [
        data.layoutId,
        id,
      ])
      if (!check) return fail('That layout does not belong to this room.', 404)
      layoutId = check.id
    }
    if (!layoutId) {
      layoutId = crypto.randomUUID()
      await execute('INSERT INTO layouts (id, room_id, name, items) VALUES ($1,$2,$3,$4)', [
        layoutId,
        id,
        'Signature layout',
        JSON.stringify([]),
      ])
    }

    await execute('UPDATE layouts SET items = $1::jsonb, updated_at = now() WHERE id = $2', [
      JSON.stringify(items),
      layoutId,
    ])
    await execute('UPDATE rooms SET active_layout_id = $1, updated_at = now() WHERE id = $2', [layoutId, id])
    await execute('UPDATE houses SET updated_at = now() WHERE id = $1', [room.house_id])
    return json({ ok: true, layoutId, count: items.length, savedAt: new Date().toISOString() })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await one<RoomRow>('SELECT * FROM rooms WHERE id = $1', [id])
    if (!room) return fail('That room does not exist.', 404)
    const layout = room.active_layout_id
      ? await one<{ id: string; items: unknown }>('SELECT id, items FROM layouts WHERE id = $1', [room.active_layout_id])
      : null
    return json({ room, layout })
  } catch (err) {
    return errorResponse(err)
  }
}
