import { getCurrentUser } from '@/lib/auth'
import { getFurniture } from '@/lib/data'
import { query } from '@/db'
import { CatalogueBrowser } from '@/components/catalogue-browser'

export const metadata = { title: 'Furniture catalogue — Dreamhouse' }

export default async function CataloguePage() {
  const user = await getCurrentUser()
  const catalog = await getFurniture()

  const rooms = user
    ? await query<{ id: string; name: string; house_name: string; house_id: string }>(
        `SELECT r.id, r.name, h.name AS house_name, h.id AS house_id
         FROM rooms r JOIN houses h ON h.id = r.house_id
         WHERE h.user_id = $1 ORDER BY h.updated_at DESC, r.sort ASC`,
        [user.id],
      )
    : []

  const boards = user
    ? await query<{ id: string; title: string }>(
        'SELECT id, title FROM moodboards WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id],
      )
    : []

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">
              <span className="dot" /> The catalogue
            </span>
            <h1 style={{ marginTop: 14 }}>Every piece, measured and priced.</h1>
            <p>
              {catalog.length} pieces across {new Set(catalog.map((c) => c.category)).size} categories. Filter by style
              and colour, then drop straight into a room plan or a moodboard.
            </p>
          </div>
        </div>
      </div>
      <CatalogueBrowser catalog={catalog} rooms={rooms} boards={boards} signedIn={Boolean(user)} />
    </div>
  )
}
