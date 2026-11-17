import { requireUser } from '@/lib/auth'
import { errorResponse, fail, json } from '@/lib/api'
import { MAX_UPLOAD_BYTES, saveUpload, uploadKey } from '@/lib/storage'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Stores a user's inspiration image and returns its public URL. */
export async function POST(req: Request) {
  try {
    await requireUser()
    const form = await req.formData().catch(() => null)
    if (!form) return fail('Send the image as multipart form data.')
    const file = form.get('file')
    if (!(file instanceof File)) return fail('No image was attached.')
    const ext = ALLOWED[file.type]
    if (!ext) return fail('Use a JPG, PNG, WebP or GIF image.')
    if (file.size > MAX_UPLOAD_BYTES) return fail('Images need to be under 5 MB.')

    const url = await saveUpload(await file.arrayBuffer(), uploadKey(ext), file.type)
    return json({ ok: true, url })
  } catch (err) {
    return errorResponse(err)
  }
}
