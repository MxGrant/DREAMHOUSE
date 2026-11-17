import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'
import { parseItems } from '@/lib/data'
import type { RoomRow } from '@/lib/types'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const layout = await one<{ id: string; room_id: string; items: unknown }>(
      'SELECT id, room_id, items FROM layouts WHERE id = $1',
      [id],
    )
    if (!layout) return fail('That layout does not exist.', 404)
    const room = await one<RoomRow & { owner: string }>(
      `SELECT r.*, h.user_id AS owner FROM rooms r JOIN houses h ON h.id = r.house_id WHERE r.id = $1`,
      [layout.room_id],
    )
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)

    await execute(`UPDATE rooms SET active_layout_id = $1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = $2`, [id, room.id])
    return json({ ok: true, items: parseItems(layout.items), roomId: room.id })
  } catch (err) {
    return errorResponse(err)
  }
}
