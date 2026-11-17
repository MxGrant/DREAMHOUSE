import { execute } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, clampInt, errorResponse, fail, json, str } from '@/lib/api'
import { getTheme, roomTypeLabel, ROOM_TYPES } from '@/lib/design'
import type { HouseRow } from '@/lib/types'
import { one } from '@/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const house = await one<HouseRow>('SELECT * FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    if (house.user_id !== user.id) return fail('You can only add rooms to your own houses.', 403)

    const data = await body<{
      name?: string
      type?: string
      width?: number
      length?: number
      theme?: string
      wallColor?: string
      floorType?: string
      floorColor?: string
    }>(req)

    const type = ROOM_TYPES.find((t) => t.id === str(data.type, 'living')) ?? ROOM_TYPES[0]
    const theme = getTheme(str(data.theme, house.theme))
    const width = clampInt(data.width, 180, 1200, type.width)
    const length = clampInt(data.length, 180, 1200, type.length)
    const name = str(data.name) || `New ${roomTypeLabel(type.id).toLowerCase()}`
    const roomId = crypto.randomUUID()
    const layoutId = crypto.randomUUID()

    const existing = await one<{ c: number }>('SELECT count(*) AS c FROM rooms WHERE house_id = $1', [id])

    await execute(
      `INSERT INTO rooms (id, house_id, name, type, width_cm, length_cm, wall_color, floor_type, floor_color, theme, sort, active_layout_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        roomId,
        id,
        name.slice(0, 60),
        type.id,
        width,
        length,
        str(data.wallColor) || theme.wall,
        str(data.floorType) || theme.floorType,
        str(data.floorColor) || theme.floor,
        theme.id,
        existing?.c ?? 0,
        layoutId,
      ],
    )
    await execute('INSERT INTO layouts (id, room_id, name, items) VALUES ($1,$2,$3,$4)', [
      layoutId,
      roomId,
      'Signature layout',
      JSON.stringify([]),
    ])
    await execute(`UPDATE houses SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = $1`, [id])
    return json({ ok: true, roomId })
  } catch (err) {
    return errorResponse(err)
  }
}
