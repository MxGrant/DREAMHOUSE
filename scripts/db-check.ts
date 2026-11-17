import { getDb, query } from '../src/db'

async function main() {
  await getDb()
  const tables = ['users', 'houses', 'rooms', 'furniture', 'layouts', 'likes', 'saves', 'comments', 'follows', 'collections', 'moodboards', 'moodboard_items']
  for (const t of tables) {
    const rows = await query<{ count: number }>(`SELECT count(*)::int AS count FROM ${t}`)
    console.log(`${t.padEnd(16)} ${rows[0].count}`)
  }
  const sample = await query<{ name: string; items: unknown }>(
    `SELECT r.name, l.items FROM rooms r JOIN layouts l ON l.id = r.active_layout_id LIMIT 3`,
  )
  for (const s of sample) {
    const items = s.items as unknown as unknown[]
    console.log(`${s.name}: ${items.length} items`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
