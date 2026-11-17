import { execute, one } from '@/db'
import { createSession, hashPassword, uniqueHandle } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const data = await body<{ name?: string; email?: string; password?: string }>(req)
    const name = str(data.name)
    const email = str(data.email).toLowerCase()
    const password = str(data.password)

    if (name.length < 2) return fail('Please tell us your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('That email address does not look right.')
    if (password.length < 8) return fail('Passwords need at least 8 characters.')

    const existing = await one<{ id: string }>('SELECT id FROM users WHERE email = $1', [email])
    if (existing) return fail('An account already exists with that email.')

    const handle = await uniqueHandle(name)
    const id = crypto.randomUUID()
    const hue = Math.floor(Math.random() * 360)
    await execute(
      `INSERT INTO users (id, name, email, password_hash, handle, bio, location, avatar_hue, is_designer)
       VALUES ($1,$2,$3,$4,$5,'','',$6,false)`,
      [id, name, email, await hashPassword(password), handle, hue],
    )
    await createSession(id)
    return json({ ok: true, handle })
  } catch (err) {
    return errorResponse(err)
  }
}
