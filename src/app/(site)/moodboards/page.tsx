import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getMoodboard, listMoodboards } from '@/lib/data'
import { MoodboardCard } from '@/components/moodboard-card'
import { MoodboardCreator } from '@/components/moodboard-creator'
import { Avatar } from '@/components/avatar'

export const metadata = { title: 'Moodboards — Dreamhouse' }

export default async function MoodboardsPage() {
  const user = await getCurrentUser()
  const boards = await listMoodboards(user?.id ?? null)
  const entries = await Promise.all(boards.slice(0, 12).map((b) => getMoodboard(b.id, user?.id ?? null)))

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Moodboards
            </span>
            <h1 style={{ marginTop: 14 }}>Collect the feeling first.</h1>
            <p>
              Colours, furniture, photographs and notes — the scrapbook before the floor plan. Public boards are open
              to everyone.
            </p>
          </div>
          {user ? (
            <MoodboardCreator />
          ) : (
            <Link href="/login?next=/moodboards" className="btn btn-primary">
              Sign in to start a board
            </Link>
          )}
        </div>
      </div>

      <div className="card-grid card-grid-3">
        {entries.map((entry, i) =>
          entry ? (
            <div key={entry.board.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MoodboardCard
                board={entry.board}
                items={entry.items}
                author={entry.board.author_name}
                index={i}
              />
              <div className="row" style={{ gap: 6 }}>
                <Avatar name={entry.board.author_name} hue={entry.board.author_hue} size="sm" />
                <Link href={`/u/${entry.board.author_handle}`} className="tiny">
                  @{entry.board.author_handle}
                </Link>
                <span className="tiny right">{entry.board.is_public ? 'Public' : 'Private'}</span>
              </div>
            </div>
          ) : null,
        )}
      </div>

      {!entries.length ? (
        <div className="empty">
          <h3>No moodboards yet</h3>
          <p>Start one with a photograph you love and two colours you keep reaching for.</p>
          {user ? <MoodboardCreator /> : null}
        </div>
      ) : null}
    </div>
  )
}
