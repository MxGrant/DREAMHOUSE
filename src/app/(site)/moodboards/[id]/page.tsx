import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFurniture, getMoodboard } from '@/lib/data'
import { getTheme } from '@/lib/design'
import { Avatar } from '@/components/avatar'
import { Icon } from '@/components/icons'
import { MoodboardEditor } from '@/components/moodboard-editor'
import { ShareButton } from '@/components/social'

export default async function MoodboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const data = await getMoodboard(id, user?.id ?? null)
  if (!data) notFound()
  const { board, items, furniture } = data
  const isOwner = user?.id === board.user_id
  const catalog = await getFurniture()
  const theme = getTheme(board.theme)

  return (
    <div className="shell">
      <div className="breadcrumb" style={{ paddingTop: 24 }}>
        <Link href="/moodboards">Moodboards</Link>
        <Icon name="chevron-right" className="icon icon-sm" />
        <span>{board.title}</span>
      </div>

      <div className="page-head-row" style={{ paddingBottom: 20 }}>
        <div style={{ maxWidth: '62ch' }}>
          <span className="eyebrow">
            <span className="dot" /> {theme.name} · {board.is_public ? 'Public board' : 'Private board'}
          </span>
          <h1 style={{ marginTop: 14 }}>{board.title}</h1>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)' }}>{board.description}</p>
          <div className="row wrap" style={{ gap: 10, marginTop: 14 }}>
            <Avatar name={board.author_name} hue={board.author_hue} size="sm" />
            <Link href={`/u/${board.author_handle}`} className="tiny">
              @{board.author_handle}
            </Link>
            <span className="tiny">· {items.length} pieces</span>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <ShareButton title={board.title} path={`/moodboards/${board.id}`} />
          <Link href="/moodboards" className="btn btn-ghost btn-sm">
            All boards
          </Link>
        </div>
      </div>

      <div className="studio-grid">
        <div>
          <div style={{ height: 10 }} />
          <MoodboardEditor
            board={board}
            items={items}
            furniture={furniture}
            catalog={catalog}
            isOwner={isOwner}
          />
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <div className="panel">
            <h3>Palette</h3>
            <p className="panel-sub">{theme.tagline}</p>
            <div className="ai-palette" style={{ marginTop: 12 }}>
              {theme.swatches.map((hex) => (
                <div key={hex} className="ai-swatch" style={{ background: hex, minHeight: 58, fontSize: '0.6rem' }}>
                  {hex}
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>How boards work</h3>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              <div className="kv">
                <span>Colours</span>
                <strong>{items.filter((i) => i.kind === 'color').length}</strong>
              </div>
              <div className="kv">
                <span>Photographs</span>
                <strong>{items.filter((i) => i.kind === 'image').length}</strong>
              </div>
              <div className="kv">
                <span>Furniture</span>
                <strong>{items.filter((i) => i.kind === 'furniture').length}</strong>
              </div>
              <div className="kv">
                <span>Notes</span>
                <strong>{items.filter((i) => i.kind === 'note').length}</strong>
              </div>
            </div>
            <p className="tiny" style={{ marginTop: 12 }}>
              Pin pieces straight from the catalogue, or add notes about how the room should feel before you measure
              anything.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
