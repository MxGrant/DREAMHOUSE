import Link from 'next/link'
import type { MoodboardItemRow, MoodboardRow } from '@/lib/types'
import { Icon } from './icons'

export function MoodboardCard({
  board,
  items,
  author,
  href,
  index = 0,
}: {
  board: Pick<MoodboardRow, 'id' | 'title' | 'description' | 'theme'>
  items: MoodboardItemRow[]
  author?: string
  href?: string
  index?: number
}) {
  const cells = items.slice(0, 5)
  return (
    <Link
      href={href ?? `/moodboards/${board.id}`}
      className="board-card"
      style={{ animation: `rise .6s ${Math.min(index, 8) * 60}ms both` }}
    >
      <div className="board-mosaic">
        {cells.map((item, i) => {
          if (item.kind === 'image' && item.image) {
            return (
              <div key={item.id} className={i === 0 ? 'wide' : ''}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
            )
          }
          if (item.kind === 'color') {
            return (
              <div key={item.id}>
                <div className="swatch" style={{ background: item.color ?? '#eee', borderRadius: 0 }} />
              </div>
            )
          }
          if (item.kind === 'note') {
            return (
              <div key={item.id} className="note-cell">
                “{item.title}”
              </div>
            )
          }
          return (
            <div key={item.id} className="fill">
              <Icon name="sofa" className="icon" />
            </div>
          )
        })}
        {Array.from({ length: Math.max(0, 5 - cells.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="fill" style={{ background: 'var(--cream-deep)' }}>
            +
          </div>
        ))}
      </div>
      <div className="board-body">
        <h3>{board.title}</h3>
        <p className="tiny" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
          {author ? `${author} · ` : ''}
          {items.length} pieces
        </p>
        <p className="tiny" style={{ color: 'var(--ink-faint)', marginTop: 6, lineHeight: 1.45 }}>
          {board.description}
        </p>
      </div>
    </Link>
  )
}
