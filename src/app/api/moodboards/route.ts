import { execute } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, bool, errorResponse, fail, json, str } from '@/lib/api'
import { getTheme } from '@/lib/design'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const data = await body<{ title?: string; description?: string; theme?: string; isPublic?: boolean }>(req)
    const title = str(data.title)
    if (title.length < 2) return fail('Give the moodboard a title.')
    const id = crypto.randomUUID()
    await execute(
      'INSERT INTO moodboards (id, user_id, title, description, theme, is_public) VALUES ($1,$2,$3,$4,$5,$6)',
      [
        id,
        user.id,
        title.slice(0, 80),
        str(data.description).slice(0, 400),
        getTheme(str(data.theme, 'blush')).id,
        bool(data.isPublic, true),
      ],
    )
    return json({ ok: true, id })
  } catch (err) {
    return errorResponse(err)
  }
}
