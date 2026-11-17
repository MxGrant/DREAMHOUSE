import { requireUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/api'
import { query } from '@/db'

export async function GET() {
  try {
    const user = await requireUser()
    const rooms = await query<{ id: string; name: string; house_name: string; house_id: string }>(
      `SELECT r.id, r.name, h.name AS house_name, h.id AS house_id
       FROM rooms r JOIN houses h ON h.id = r.house_id
       WHERE h.user_id = $1 ORDER BY h.updated_at DESC, r.sort ASC`,
      [user.id],
    )
    return json({ rooms })
  } catch (err) {
    return errorResponse(err)
  }
}
