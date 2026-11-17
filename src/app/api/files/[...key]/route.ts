import { getCloudflareContext } from '@opennextjs/cloudflare'

/** Serves uploaded images from the R2 bucket that backs moodboard storage. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params
  const ctx = await getCloudflareContext({ async: true })
  const bucket = (ctx.env as Record<string, unknown>).FILES as
    | {
        get(key: string): Promise<
          { body: ReadableStream; httpMetadata?: { contentType?: string } } | null
        >
      }
    | undefined
  if (!bucket) return new Response('Not found', { status: 404 })

  const object = await bucket.get(key.join('/'))
  if (!object) return new Response('Not found', { status: 404 })

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
