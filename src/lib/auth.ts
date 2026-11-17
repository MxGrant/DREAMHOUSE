import { cookies } from 'next/headers'
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { execute, one } from '@/db'
import type { UserRow } from './types'

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

export const SESSION_COOKIE = 'dh_session'
const SESSION_DAYS = 30

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 3) return false
  const [, salt, hash] = parts
  const derived = await scrypt(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (expected.length !== derived.length) return false
  return timingSafeEqual(derived, expected)
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
  const token = randomBytes(32).toString('hex')
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
     WHERE s.token = $1 AND s.expires_at > now()`,
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
