import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import { parseItems } from '@/lib/data'
import { sanitizeItems } from '@/lib/layout'
import type { LayoutRow, RoomRow } from '@/lib/types'

/** Save the current arrangement as a new named design. */
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

    const data = await body<{ name?: string; items?: unknown; activate?: boolean }>(req)
    const items = sanitizeItems(data.items)
    const count = await one<{ c: number }>('SELECT count(*) AS c FROM layouts WHERE room_id = $1', [id])
    const name = str(data.name) || `Design ${(count?.c ?? 0) + 1}`

    const layoutId = crypto.randomUUID()
    await execute('INSERT INTO layouts (id, room_id, name, items) VALUES ($1,$2,$3,$4)', [
      layoutId,
      id,
      name.slice(0, 60),
      JSON.stringify(items),
    ])
    if (data.activate !== false) {
      await execute(`UPDATE rooms SET active_layout_id = $1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = $2`, [layoutId, id])
    }
    const layouts = await getLayouts(id)
    return json({ ok: true, layoutId, layouts })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return json({ layouts: await getLayouts(id) })
  } catch (err) {
    return errorResponse(err)
  }
}

async function getLayouts(roomId: string) {
  const rows = await one<{ active_layout_id: string | null }>(
    'SELECT active_layout_id FROM rooms WHERE id = $1',
    [roomId],
  )
  const { query } = await import('@/db')
  const layouts = await query<LayoutRow>(
    'SELECT id, room_id, name, items, updated_at FROM layouts WHERE room_id = $1 ORDER BY updated_at DESC',
    [roomId],
  )
  return layouts.map((l) => ({
    ...l,
    items: parseItems(l.items),
    active: l.id === rows?.active_layout_id,
  }))
}
