import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import type { MoodboardRow } from '@/lib/types'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const board = await one<MoodboardRow>('SELECT * FROM moodboards WHERE id = $1', [id])
    if (!board) return fail('That moodboard does not exist.', 404)
    if (board.user_id !== user.id) return fail('This moodboard belongs to someone else.', 403)

    const data = await body<{ title?: string; description?: string; isPublic?: boolean; theme?: string }>(req)
    await execute('UPDATE moodboards SET title = $1, description = $2, is_public = $3, theme = $4 WHERE id = $5', [
      str(data.title, board.title).slice(0, 80),
      str(data.description, board.description).slice(0, 400),
      typeof data.isPublic === 'boolean' ? data.isPublic : board.is_public,
      str(data.theme, board.theme).slice(0, 24),
      id,
    ])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const board = await one<MoodboardRow>('SELECT * FROM moodboards WHERE id = $1', [id])
    if (!board) return fail('That moodboard does not exist.', 404)
    if (board.user_id !== user.id) return fail('This moodboard belongs to someone else.', 403)
    await execute('DELETE FROM moodboards WHERE id = $1', [id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
