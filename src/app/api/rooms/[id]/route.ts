import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, clampInt, errorResponse, fail, json, str } from '@/lib/api'
import { ROOM_MIN, ROOM_MAX } from '@/lib/layout'
import type { RoomRow } from '@/lib/types'

async function ownedRoom(roomId: string, userId: string) {
  return one<RoomRow & { owner: string }>(
    `SELECT r.*, h.user_id AS owner FROM rooms r JOIN houses h ON h.id = r.house_id WHERE r.id = $1`,
    [roomId],
  )
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const room = await ownedRoom(id, user.id)
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)

    const data = await body<{
      name?: string
      width_cm?: number
      length_cm?: number
      wall_color?: string
      floor_type?: string
      floor_color?: string
      theme?: string
      sort?: number
    }>(req)

    await execute(
      `UPDATE rooms SET name = $1, width_cm = $2, length_cm = $3, wall_color = $4,
         floor_type = $5, floor_color = $6, theme = $7, sort = $8, updated_at = now()
       WHERE id = $9`,
      [
        str(data.name, room.name).slice(0, 60),
        clampInt(data.width_cm, ROOM_MIN, ROOM_MAX, room.width_cm),
        clampInt(data.length_cm, ROOM_MIN, ROOM_MAX, room.length_cm),
        str(data.wall_color, room.wall_color).slice(0, 24),
        str(data.floor_type, room.floor_type).slice(0, 24),
        str(data.floor_color, room.floor_color).slice(0, 24),
        str(data.theme, room.theme).slice(0, 24),
        clampInt(data.sort, 0, 999, room.sort),
        id,
      ],
    )
    await execute('UPDATE houses SET updated_at = now() WHERE id = $1', [room.house_id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const room = await ownedRoom(id, user.id)
    if (!room) return fail('That room does not exist.', 404)
    if (room.owner !== user.id) return fail('This room belongs to someone else.', 403)
    await execute('DELETE FROM rooms WHERE id = $1', [id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await one<RoomRow>('SELECT * FROM rooms WHERE id = $1', [id])
    if (!room) return fail('That room does not exist.', 404)
    return json({ room })
  } catch (err) {
    return errorResponse(err)
  }
}
