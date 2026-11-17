import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, clampInt, errorResponse, fail, json, str } from '@/lib/api'

export async function PATCH(req: Request) {
  try {
    const user = await requireUser()
    const data = await body<{
      name?: string
      bio?: string
      location?: string
      handle?: string
      avatar_hue?: number
    }>(req)

    const name = str(data.name, user.name)
    if (name.length < 2) return fail('Please keep your name at least 2 characters.')

    let handle = user.handle
    if (typeof data.handle === 'string' && data.handle.trim() && data.handle.trim() !== user.handle) {
      const candidate = str(data.handle)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 24)
      if (candidate.length < 3) return fail('Handles need at least 3 characters (letters, numbers, dashes).')
      const taken = await one<{ id: string }>('SELECT id FROM users WHERE handle = $1 AND id <> $2', [
        candidate,
        user.id,
      ])
      if (taken) return fail('That handle is already taken.')
      handle = candidate
    }

    await execute(
      'UPDATE users SET name = $1, bio = $2, location = $3, handle = $4, avatar_hue = $5 WHERE id = $6',
      [
        name,
        str(data.bio, user.bio).slice(0, 400),
        str(data.location, user.location).slice(0, 80),
        handle,
        clampInt(data.avatar_hue, 0, 359, user.avatar_hue),
        user.id,
      ],
    )
    return json({ ok: true, handle })
  } catch (err) {
    return errorResponse(err)
  }
}
