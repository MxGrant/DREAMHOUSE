import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, bool, clampInt, errorResponse, fail, json, str } from '@/lib/api'
import { getTheme } from '@/lib/design'
import type { HouseRow } from '@/lib/types'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const house = await one<HouseRow>('SELECT * FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    if (house.user_id !== user.id) return fail('This house belongs to someone else.', 403)

    const data = await body<{
      name?: string
      description?: string
      style?: string
      theme?: string
      budget?: number
      isPublic?: boolean
      coverImage?: string
    }>(req)

    const name = str(data.name, house.name)
    if (name.length < 2) return fail('House names need at least 2 characters.')
    const theme = data.theme ? getTheme(str(data.theme)).id : house.theme

    await execute(
      `UPDATE houses SET name = $1, description = $2, style = $3, theme = $4, budget = $5,
       is_public = $6, cover_image = $7, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = $8`,
      [
        name.slice(0, 90),
        str(data.description, house.description).slice(0, 600),
        str(data.style, house.style),
        theme,
        clampInt(data.budget, 0, 500000, house.budget),
        typeof data.isPublic === 'boolean' ? data.isPublic : house.is_public,
        str(data.coverImage, house.cover_image),
        id,
      ],
    )
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const house = await one<HouseRow>('SELECT * FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    if (house.user_id !== user.id) return fail('This house belongs to someone else.', 403)
    await execute('DELETE FROM houses WHERE id = $1', [id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const house = await one<HouseRow>('SELECT * FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    return json({ house: { ...house, is_public: bool(house.is_public) } })
  } catch (err) {
    return errorResponse(err)
  }
}
