import { isWorkers } from '@/lib/runtime'
import { SCHEMA_SQL } from './schema'
import { SEED_PASSWORD_HASHES, seedDatabase } from './seed'

export type Row = Record<string, unknown>

export type Statement = { sql: string; params?: unknown[] }

export interface Queryable {
  all<T = Row>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
  exec(sql: string): Promise<void>
  batch(statements: Statement[]): Promise<void>
}

/** SQLite returns 0/1 for boolean columns; expose them as real booleans. */
const BOOLEAN_COLUMNS = new Set(['is_public', 'is_designer', 'liked', 'saved', 'following'])

function bindable(value: unknown): unknown {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value === undefined) return null
  return value
}

/** The queries are written with $1..$n placeholders; both drivers take positional ones. */
function positional(sql: string, params: unknown[]) {
  const ordered: unknown[] = []
  const text = sql.replace(/\$(\d+)/g, (match, index: string) => {
    const position = Number(index)
    // Leave $-literals alone (e.g. a password hash prefix) rather than bind null.
    if (position < 1 || position > params.length) return match
    ordered.push(bindable(params[position - 1]))
    return '?'
  })
  return { text, params: ordered }
}

/**
 * Rebuild every row as a plain object: node:sqlite returns null-prototype rows,
 * which React refuses to hand from server components to client components.
 */
function normalize<T>(rows: Row[]): T[] {
  return rows.map((row) => {
    const out: Row = {}
    for (const key of Object.keys(row)) {
      const value = row[key]
      out[key] = BOOLEAN_COLUMNS.has(key) && typeof value === 'number' ? value !== 0 : value
    }
    return out as T
  })
}

class WorkersDatabase implements Queryable {
  constructor(private readonly db: D1Like) {}

  async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const q = positional(sql, params)
    const res = await this.db.prepare(q.text).bind(...q.params).all()
    return normalize<T>((res.results ?? []) as Row[])
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    const q = positional(sql, params)
    await this.db.prepare(q.text).bind(...q.params).run()
  }

  async exec(sql: string): Promise<void> {
    // D1's exec() splits on newlines; prepare().run() handles one full statement.
    await this.db.prepare(sql).run()
  }

  async batch(statements: Statement[]): Promise<void> {
    if (!statements.length) return
    const prepared = statements.map((statement) => {
      const q = positional(statement.sql, statement.params ?? [])
      return this.db.prepare(q.text).bind(...q.params)
    })
    await this.db.batch(prepared)
  }
}

/** Local development runs the same SQL against a SQLite file built into Node. */
class NodeDatabase implements Queryable {
  constructor(private readonly db: SqliteLike) {}

  async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const q = positional(sql, params)
    return normalize<T>(this.db.prepare(q.text).all(...q.params) as Row[])
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    const q = positional(sql, params)
    this.db.prepare(q.text).run(...q.params)
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql)
  }

  async batch(statements: Statement[]): Promise<void> {
    for (const statement of statements) await this.run(statement.sql, statement.params ?? [])
  }
}

type D1Statement = {
  bind(...values: unknown[]): D1Statement
  all(): Promise<{ results?: unknown[] }>
  run(): Promise<unknown>
}

type D1Like = {
  prepare(sql: string): D1Statement
  exec(sql: string): Promise<unknown>
  batch(statements: unknown[]): Promise<unknown>
}

type SqliteLike = {
  prepare(sql: string): { all(...values: unknown[]): unknown[]; run(...values: unknown[]): unknown }
  exec(sql: string): void
}

async function openRemote(): Promise<Queryable> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const ctx = await getCloudflareContext({ async: true })
  const binding = (ctx.env as Record<string, unknown>).DB as D1Like | undefined
  if (!binding) throw new Error('The D1 database binding (DB) is not configured for this deployment.')
  return new WorkersDatabase(binding)
}

async function openLocal(): Promise<Queryable> {
  const [{ DatabaseSync }, fs, path] = await Promise.all([
    import('node:sqlite'),
    import('node:fs'),
    import('node:path'),
  ])
  const dir = path.join(process.cwd(), 'data')
  fs.mkdirSync(dir, { recursive: true })
  const db = new DatabaseSync(path.join(dir, 'dreamhouse.db')) as unknown as SqliteLike
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  return new NodeDatabase(db)
}

function splitSchema(): string[] {
  return SCHEMA_SQL.split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
}

async function seedIfEmpty(db: Queryable): Promise<void> {
  const rows = await db.all<{ count: number }>('SELECT count(*) AS count FROM users')
  if (rows.length && Number(rows[0].count) > 0) return
  let pending: Statement[] = []
  const flush = async () => {
    if (!pending.length) return
    const batch = pending
    pending = []
    await db.batch(batch)
  }
  await seedDatabase({
    query: async (sql, params = []) => {
      pending.push({ sql, params })
      if (pending.length >= 40) await flush()
    },
  })
  await flush()
}

/**
 * Earlier deploys seeded PBKDF2 hashes at 120k iterations, which Workers' crypto
 * rejects. Swap the demo accounts over to the supported 100k hashes on boot.
 */
async function migrateSeedPasswords(db: Queryable): Promise<void> {
  const rows = await db.all<{ email: string }>(
    'SELECT email FROM users WHERE password_hash LIKE $1',
    ['pbkdf2$120000$%'],
  )
  const updates = rows
    .filter((row) => SEED_PASSWORD_HASHES[row.email])
    .map((row) => ({
      sql: 'UPDATE users SET password_hash = $1 WHERE email = $2',
      params: [SEED_PASSWORD_HASHES[row.email], row.email],
    }))
  if (updates.length) await db.batch(updates)
}

let ready: Promise<Queryable> | null = null

function boot(): Promise<Queryable> {
  return (async () => {
    const db = isWorkers() ? await openRemote() : await openLocal()
    for (const statement of splitSchema()) await db.exec(statement)
    await migrateSeedPasswords(db)
    await seedIfEmpty(db)
    return db
  })()
}

export function getDb(): Promise<Queryable> {
  if (!ready) {
    ready = boot().catch((err) => {
      ready = null
      throw err
    })
  }
  return ready
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb()
  return db.all<T>(sql, params)
}

export async function one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const db = await getDb()
  await db.run(sql, params)
}

export async function batch(statements: Statement[]): Promise<void> {
  const db = await getDb()
  await db.batch(statements)
}
