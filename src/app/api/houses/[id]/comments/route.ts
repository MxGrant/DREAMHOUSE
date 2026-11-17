import { execute, one } from '@/db'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import { getComments } from '@/lib/data'
import type { HouseRow } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return json({ comments: await getComments(id) })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const house = await one<HouseRow>('SELECT id, is_public, user_id FROM houses WHERE id = $1', [id])
    if (!house) return fail('That house does not exist.', 404)
    if (!house.is_public && house.user_id !== user.id) return fail('This design is private.', 403)

    const data = await body<{ body?: string }>(req)
    const text = str(data.body)
    if (text.length < 2) return fail('Your comment is a little short.')
    if (text.length > 800) return fail('Comments are limited to 800 characters.')

    const commentId = crypto.randomUUID()
    await execute('INSERT INTO comments (id, house_id, user_id, body) VALUES ($1,$2,$3,$4)', [
      commentId,
      id,
      user.id,
      text,
    ])
    const comment = await one(
      `SELECT c.*, u.name AS author_name, u.handle AS author_handle, u.avatar_hue AS author_hue
       FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
      [commentId],
    )
    return json({ ok: true, comment })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail('Sign in first.', 401)
    const { id } = await params
    const url = new URL(req.url)
    const commentId = url.searchParams.get('commentId')
    if (!commentId) return fail('Missing comment.')
    const comment = await one<{ user_id: string; house_id: string }>(
      'SELECT user_id, house_id FROM comments WHERE id = $1 AND house_id = $2',
      [commentId, id],
    )
    if (!comment) return fail('Comment not found.', 404)
    const house = await one<HouseRow>('SELECT user_id FROM houses WHERE id = $1', [id])
    if (comment.user_id !== user.id && house?.user_id !== user.id) return fail('You cannot remove that comment.', 403)
    await execute('DELETE FROM comments WHERE id = $1', [commentId])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
