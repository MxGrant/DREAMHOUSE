import { cookies } from 'next/headers'
import { execute, one } from '@/db'
import type { UserRow } from './types'

export const SESSION_COOKIE = 'dh_session'
const SESSION_DAYS = 30
// Workers rejects PBKDF2 iteration counts above 100,000.
const ITERATIONS = 100000
const KEY_BYTES = 32

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

/** PBKDF2-SHA256 via Web Crypto, which runs unchanged on Workers and in Node. */
async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await derive(password, salt)
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(derived)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(salt), iterations: Number(iterations), hash: 'SHA-256' },
    key,
    (hash.length / 2) * 8,
  )
  return equal(new Uint8Array(bits), fromHex(hash))
}

export type PublicUser = Pick<
  UserRow,
  'id' | 'name' | 'handle' | 'bio' | 'location' | 'avatar_hue' | 'is_designer'
>

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    location: row.location,
    avatar_hue: row.avatar_hue,
    is_designer: row.is_designer,
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)))
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000)
  await execute('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [
    token,
    userId,
    expires.toISOString(),
  ])
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  })
  return token
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) {
    await execute('DELETE FROM sessions WHERE token = $1', [token])
  }
  jar.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await one<UserRow>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
    [token],
  )
  return user
}

export async function requireUser(): Promise<UserRow> {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  return user
}

export class UnauthorizedError extends Error {
  status = 401
  constructor() {
    super('You need to sign in to do that.')
  }
}

export function slugifyHandle(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 20)
  return base || 'designer'
}

export async function uniqueHandle(name: string): Promise<string> {
  const base = slugifyHandle(name)
  let candidate = base
  let n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await one<{ id: string }>('SELECT id FROM users WHERE handle = $1', [candidate])
    if (!existing) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}
