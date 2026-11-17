import { execute, one } from '@/db'
import { requireUser } from '@/lib/auth'
import { body, errorResponse, fail, json, str } from '@/lib/api'
import type { MoodboardRow } from '@/lib/types'

const KINDS = new Set(['furniture', 'color', 'image', 'note'])

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    const board = await one<MoodboardRow>('SELECT * FROM moodboards WHERE id = $1', [id])
    if (!board) return fail('That moodboard does not exist.', 404)
    if (board.user_id !== user.id) return fail('You can only add to your own moodboards.', 403)

    const data = await body<{
      kind?: string
      refId?: string
      title?: string
      body?: string
      color?: string
      image?: string
    }>(req)
    const kind = str(data.kind)
    if (!KINDS.has(kind)) return fail('Unknown moodboard piece.')

    const count = await one<{ c: number }>('SELECT count(*)::int AS c FROM moodboard_items WHERE moodboard_id = $1', [
      id,
    ])
    if ((count?.c ?? 0) >= 40) return fail('That board is full — 40 pieces is plenty.')

    const itemId = crypto.randomUUID()
    const color = kind === 'color' ? str(data.color, '#F6C9D6').slice(0, 24) : null
    const image = kind === 'image' ? str(data.image).slice(0, 300) : null
    const title = str(data.title).slice(0, 90) || (kind === 'note' ? 'A note' : 'Moodboard piece')

    if (kind === 'color' && !/^#[0-9a-fA-F]{3,8}$/.test(color ?? '')) return fail('That colour code is not valid.')
    if (kind === 'image' && !image) return fail('Pick an image for the board.')
    if (kind === 'furniture' && !str(data.refId)) return fail('Pick a piece of furniture.')

    await execute(
      `INSERT INTO moodboard_items (id, moodboard_id, kind, ref_id, title, body, color, image, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [itemId, id, kind, str(data.refId) || null, title, str(data.body).slice(0, 400), color, image, count?.c ?? 0],
    )
    return json({ ok: true, id: itemId })
  } catch (err) {
    return errorResponse(err)
  }
}
