import fs from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { SCHEMA_SQL } from './schema'
import { seedDatabase } from './seed'

type Globals = typeof globalThis & {
  __dreamhouseClient?: Promise<PGlite>
}

const g = globalThis as Globals

async function boot(): Promise<PGlite> {
  const dir = path.join(process.cwd(), 'data', 'pg')
  fs.mkdirSync(dir, { recursive: true })
  const client = new PGlite(`file://${dir}`)
  await client.waitReady
  await client.exec(SCHEMA_SQL)
  const res = await client.query<{ count: number }>('SELECT count(*)::int AS count FROM users')
  if (!res.rows[0] || res.rows[0].count === 0) {
    await seedDatabase(client)
  }
  return client
}

export function getDb(): Promise<PGlite> {
  if (!g.__dreamhouseClient) {
    g.__dreamhouseClient = boot().catch((err) => {
      g.__dreamhouseClient = undefined
      throw err
    })
  }
  return g.__dreamhouseClient
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb()
  const res = await db.query<T>(sql, params)
  return res.rows
}

export async function one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const db = await getDb()
  await db.query(sql, params)
}

export async function transaction<T>(fn: (db: PGlite) => Promise<T>): Promise<T> {
  const db = await getDb()
  return db.transaction(async (tx) => fn(tx as unknown as PGlite))
}
