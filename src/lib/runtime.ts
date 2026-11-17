/** True when the code is running inside the Cloudflare Workers runtime. */
export function isWorkers(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent === 'Cloudflare-Workers'
  )
}
