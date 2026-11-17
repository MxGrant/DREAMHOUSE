import { execute } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, bool, errorResponse, fail, json, str } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const data = await body<{ title?: string; description?: string; isPublic?: boolean }>(req)
    const title = str(data.title)
    if (title.length < 2) return fail('Name your collection first.')
    const id = crypto.randomUUID()
    await execute(
      'INSERT INTO collections (id, user_id, title, description, is_public) VALUES ($1,$2,$3,$4,$5)',
      [id, user.id, title.slice(0, 80), str(data.description).slice(0, 400), bool(data.isPublic, true)],
    )
    return json({ ok: true, id })
  } catch (err) {
    return errorResponse(err)
  }
}
