import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'
import type { RoomRow } from '@/lib/types'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const layout = await one<{ id: string; room_id: string }>('SELECT id, room_id FROM layouts WHERE id = $1', [id])
    if (!layout) return fail('That layout does not exist.', 404)
    const room = await one<RoomRow & { owner: string }>(
      `SELECT r.*, h.user_id AS owner FROM rooms r JOIN houses h ON h.id = r.house_id WHERE r.id = $1`,
      [layout.room_id],
    )
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)

    const total = await one<{ c: number }>('SELECT count(*)::int AS c FROM layouts WHERE room_id = $1', [room.id])
    if ((total?.c ?? 0) <= 1) return fail('Keep at least one layout in the room.')

    await execute('DELETE FROM layouts WHERE id = $1', [id])
    if (room.active_layout_id === id) {
      const next = await one<{ id: string }>(
        'SELECT id FROM layouts WHERE room_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [room.id],
      )
      if (next) await execute('UPDATE rooms SET active_layout_id = $1 WHERE id = $2', [next.id, room.id])
    }
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
