import { NextResponse } from 'next/server'
import { UnauthorizedError } from './auth'

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function errorResponse(err: unknown) {
  if (err instanceof UnauthorizedError) return fail(err.message, 401)
  const message = err instanceof Error ? err.message : 'Unexpected error'
  console.error('[api]', message)
  return fail(message, 500)
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    return {} as T
  }
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

export function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(num(value, fallback))
  return Math.min(max, Math.max(min, n))
}
