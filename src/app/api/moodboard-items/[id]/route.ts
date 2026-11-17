import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const item = await one<{ id: string; moodboard_id: string }>(
      'SELECT id, moodboard_id FROM moodboard_items WHERE id = $1',
      [id],
    )
    if (!item) return fail('That piece is already gone.', 404)
    const board = await one<{ user_id: string }>('SELECT user_id FROM moodboards WHERE id = $1', [item.moodboard_id])
    if (!board || board.user_id !== user.id) return fail('This moodboard belongs to someone else.', 403)
    await execute('DELETE FROM moodboard_items WHERE id = $1', [id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
