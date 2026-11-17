import { one } from '@/db'
import { createSession, verifyPassword } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const data = await body<{ email?: string; password?: string }>(req)
    const email = str(data.email).toLowerCase()
    const password = str(data.password)
    if (!email || !password) return fail('Enter your email and password.')

    const user = await one<{ id: string; password_hash: string; handle: string }>(
      'SELECT id, password_hash, handle FROM users WHERE email = $1',
      [email],
    )
    if (!user) return fail('No account matches that email.', 401)
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) return fail('That password is not quite right.', 401)

    await createSession(user.id)
    return json({ ok: true, handle: user.handle })
  } catch (err) {
    return errorResponse(err)
  }
}
