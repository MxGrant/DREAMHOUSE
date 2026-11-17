import { isWorkers } from './runtime'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** Upload keys are UUID + extension, so no path parsing is needed. */
export function uploadKey(ext: string): string {
  return `${crypto.randomUUID()}.${ext}`
}

/** Stores image bytes in R2 on Workers, or on disk for local development. */
export async function saveUpload(bytes: ArrayBuffer, key: string, contentType: string): Promise<string> {
  if (isWorkers()) {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = await getCloudflareContext({ async: true })
    const bucket = (ctx.env as Record<string, unknown>).FILES as
      | { put(key: string, value: ArrayBuffer, options?: unknown): Promise<unknown> }
      | undefined
    if (!bucket) throw new Error('Image storage is not configured for this deployment.')
    await bucket.put(key, bytes, { httpMetadata: { contentType } })
    return `/api/files/${key}`
  }

  const [{ mkdir, writeFile }, path] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
  ])
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, key), Buffer.from(bytes))
  return `/uploads/${key}`
}
