import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'
import type { UserRow } from '@/lib/types'

export async function POST(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    const user = await requireUser()
    const { handle } = await params
    const target = await one<UserRow>('SELECT * FROM users WHERE handle = $1', [handle])
    if (!target) return fail('That designer does not exist.', 404)
    if (target.id === user.id) return fail('You cannot follow yourself.', 400)

    const existing = await one('SELECT 1 AS x FROM follows WHERE follower_id = $1 AND following_id = $2', [
      user.id,
      target.id,
    ])
    if (existing) {
      await execute('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [user.id, target.id])
    } else {
      await execute('INSERT INTO follows (follower_id, following_id) VALUES ($1,$2)', [user.id, target.id])
    }
    const count = await one<{ c: number }>('SELECT count(*)::int AS c FROM follows WHERE following_id = $1', [
      target.id,
    ])
    return json({ following: !existing, followers: count?.c ?? 0 })
  } catch (err) {
    return errorResponse(err)
  }
}
