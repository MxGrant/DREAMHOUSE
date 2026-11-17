import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Stores a user's inspiration image on disk and returns its public URL. */
export async function POST(req: Request) {
  try {
    await requireUser()
    const form = await req.formData().catch(() => null)
    if (!form) return fail('Send the image as multipart form data.')
    const file = form.get('file')
    if (!(file instanceof File)) return fail('No image was attached.')
    const ext = ALLOWED[file.type]
    if (!ext) return fail('Use a JPG, PNG, WebP or GIF image.')
    if (file.size > 5 * 1024 * 1024) return fail('Images need to be under 5 MB.')

    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    const name = `${crypto.randomUUID()}.${ext}`
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
    return json({ ok: true, url: `/uploads/${name}` })
  } catch (err) {
    return errorResponse(err)
  }
}
