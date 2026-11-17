import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'
import type { HouseRow } from '@/lib/types'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const house = await one<HouseRow>('SELECT id, is_public, user_id FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    if (!house.is_public && house.user_id !== user.id) return fail('This design is private.', 403)

    const existing = await one('SELECT 1 AS x FROM likes WHERE user_id = $1 AND house_id = $2', [user.id, id])
    if (existing) {
      await execute('DELETE FROM likes WHERE user_id = $1 AND house_id = $2', [user.id, id])
    } else {
      await execute('INSERT INTO likes (user_id, house_id) VALUES ($1,$2)', [user.id, id])
    }
    const count = await one<{ c: number }>('SELECT count(*) AS c FROM likes WHERE house_id = $1', [id])
    return json({ liked: !existing, count: count?.c ?? 0 })
  } catch (err) {
    return errorResponse(err)
  }
}
