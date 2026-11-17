import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import type { CollectionRow, HouseRow } from '@/lib/types'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const collection = await one<CollectionRow>('SELECT * FROM collections WHERE id = $1', [id])
    if (!collection) return fail('That collection does not exist.', 404)
    if (collection.user_id !== user.id) return fail('You can only edit your own collections.', 403)

    const data = await body<{ houseId?: string; action?: string }>(req)
    const houseId = str(data.houseId)
    const house = await one<HouseRow>('SELECT id, is_public, user_id FROM houses WHERE id = $1', [houseId])
    if (!house) return fail('That house does not exist.', 404)
    if (!house.is_public && house.user_id !== user.id) return fail('That design is private.', 403)

    if (data.action === 'remove') {
      await execute('DELETE FROM collection_houses WHERE collection_id = $1 AND house_id = $2', [id, houseId])
    } else {
      await execute(
        'INSERT INTO collection_houses (collection_id, house_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [id, houseId],
      )
    }
    const count = await one<{ c: number }>(
      'SELECT count(*)::int AS c FROM collection_houses WHERE collection_id = $1',
      [id],
    )
    return json({ ok: true, count: count?.c ?? 0 })
  } catch (err) {
    return errorResponse(err)
  }
}
