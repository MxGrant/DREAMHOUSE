import { destroySession } from '@/lib/auth'
import { errorResponse, json } from '@/lib/api'

export async function POST() {
  try {
    await destroySession()
    return json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
