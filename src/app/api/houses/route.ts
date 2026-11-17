import { execute, one } from '@/db'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { body, bool, clampInt, errorResponse, fail, json, str } from '@/lib/api'
import { getTheme, ROOM_TYPES } from '@/lib/design'
import { listHouses } from '@/lib/data'

const COVERS = [
  '/homes/living-linen.jpg',
  '/homes/living-nordic.jpg',
  '/homes/living-penthouse.jpg',
  '/homes/living-modern.jpg',
  '/homes/bedroom-boucle.jpg',
  '/homes/kitchen-marble.jpg',
  '/homes/study-green.jpg',
  '/homes/living-cosy.jpg',
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    const houses = await listHouses({ viewerId: user?.id ?? null, authorId: user?.id ?? null, sort: 'newest' })
    return json({ houses })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const data = await body<{
      name?: string
      description?: string
      style?: string
      theme?: string
      budget?: number
      isPublic?: boolean
      coverImage?: string
      startWithRoom?: boolean
    }>(req)

    const name = str(data.name)
    if (name.length < 2) return fail('Give your house a name first.')

    const theme = getTheme(str(data.theme, 'blush'))
    const id = crypto.randomUUID()
    const cover = COVERS.includes(str(data.coverImage)) ? str(data.coverImage) : COVERS[0]
    const budget = clampInt(data.budget, 0, 500000, 9000)

    await execute(
      `INSERT INTO houses (id, user_id, name, description, cover_image, style, theme, budget, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id,
        user.id,
        name.slice(0, 90),
        str(data.description).slice(0, 600),
        cover,
        str(data.style, 'scandinavian'),
        theme.id,
        budget,
        bool(data.isPublic, false),
      ],
    )

    let roomId: string | null = null
    if (data.startWithRoom !== false) {
      const type = ROOM_TYPES[0]
      roomId = crypto.randomUUID()
      const layoutId = crypto.randomUUID()
      await execute(
        `INSERT INTO rooms (id, house_id, name, type, width_cm, length_cm, wall_color, floor_type, floor_color, theme, sort, active_layout_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,$11)`,
        [
          roomId,
          id,
          type.label,
          type.id,
          type.width,
          type.length,
          theme.wall,
          theme.floorType,
          theme.floor,
          theme.id,
          layoutId,
        ],
      )
      await execute('INSERT INTO layouts (id, room_id, name, items) VALUES ($1,$2,$3,$4)', [
        layoutId,
        roomId,
        'Signature layout',
        JSON.stringify([]),
      ])
    }

    const row = await one<{ id: string }>('SELECT id FROM houses WHERE id = $1', [id])
    return json({ ok: true, houseId: row?.id ?? id, roomId })
  } catch (err) {
    return errorResponse(err)
  }
}
