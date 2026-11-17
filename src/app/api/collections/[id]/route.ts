import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import type { CollectionRow } from '@/lib/types'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const collection = await one<CollectionRow>('SELECT * FROM collections WHERE id = $1', [id])
    if (!collection) return fail('That collection does not exist.', 404)
    if (collection.user_id !== user.id) return fail('This collection belongs to someone else.', 403)

    const data = await body<{ title?: string; description?: string; isPublic?: boolean }>(req)
    await execute('UPDATE collections SET title = $1, description = $2, is_public = $3 WHERE id = $4', [
      str(data.title, collection.title).slice(0, 80),
      str(data.description, collection.description).slice(0, 400),
      typeof data.isPublic === 'boolean' ? data.isPublic : collection.is_public,
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
    const collection = await one<CollectionRow>('SELECT * FROM collections WHERE id = $1', [id])
    if (!collection) return fail('That collection does not exist.', 404)
    if (collection.user_id !== user.id) return fail('This collection belongs to someone else.', 403)
    await execute('DELETE FROM collections WHERE id = $1', [id])
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
