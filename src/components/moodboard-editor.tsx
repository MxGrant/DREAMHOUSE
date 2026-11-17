'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FurnitureRow, MoodboardItemRow, MoodboardRow } from '@/lib/types'
import { COLORS, money } from '@/lib/design'
import { FurnitureArt } from './furniture-art'
import { Icon } from './icons'

const IMAGES = [
  '/homes/living-linen.jpg',
  '/homes/living-boucle.jpg',
  '/homes/bedroom-boucle.jpg',
  '/homes/kitchen-marble.jpg',
  '/homes/living-penthouse.jpg',
  '/homes/study-green.jpg',
  '/homes/living-cosy.jpg',
  '/homes/dining-warm.jpg',
].filter((p) => !p.includes('living-boucle'))

type Tab = 'note' | 'color' | 'image' | 'furniture'

export function MoodboardEditor({
  board,
  items,
  furniture,
  catalog,
  isOwner,
}: {
  board: MoodboardRow
  items: MoodboardItemRow[]
  furniture: FurnitureRow[]
  catalog: FurnitureRow[]
  isOwner: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('note')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState(COLORS[0].hex)
  const [colorName, setColorName] = useState(COLORS[0].name)
  const [image, setImage] = useState(IMAGES[0])
  const [pieceId, setPieceId] = useState(catalog[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [isPublic, setIsPublic] = useState(board.is_public)

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function add() {
    setBusy(true)
    setError('')
    try {
      const payload: Record<string, string> = { kind: tab }
      if (tab === 'note') {
        payload.title = title || 'A note'
        payload.body = body
      }
      if (tab === 'color') {
        payload.title = colorName
        payload.color = color
      }
      if (tab === 'image') {
        payload.title = 'Inspiration'
        payload.image = image
      }
      if (tab === 'furniture') {
        const piece = catalog.find((p) => p.id === pieceId)
        payload.refId = pieceId
        payload.title = piece?.name ?? 'Furniture'
      }
      const res = await fetch(`/api/moodboards/${board.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add that')
      setTitle('')
      setBody('')
      router.refresh()
      flash('Added to the board')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function uploadImage(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const up = await fetch('/api/uploads', { method: 'POST', body: form })
      const uploaded = await up.json()
      if (!up.ok) throw new Error(uploaded.error ?? 'Upload failed')
      const res = await fetch(`/api/moodboards/${board.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'image', image: uploaded.url, title: 'My inspiration' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add that image')
      router.refresh()
      flash('Image uploaded and pinned')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(itemId: string) {
    const res = await fetch(`/api/moodboard-items/${itemId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else flash('Could not remove that piece')
  }

  async function setVisibility(next: boolean) {
    setIsPublic(next)
    const res = await fetch(`/api/moodboards/${board.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: next }),
    })
    if (res.ok) router.refresh()
    else flash('Could not change visibility')
  }

  async function removeBoard() {
    if (!window.confirm('Delete this moodboard and every piece on it?')) return
    const res = await fetch(`/api/moodboards/${board.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/moodboards')
      router.refresh()
    } else flash('Could not delete that board')
  }

  const pieceMap = new Map(furniture.map((f) => [f.id, f]))

  return (
    <>
      {isOwner ? (
        <div className="panel stack" style={{ gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>Add to this board</h3>
            <div className="pill-toggle">
              {(
                [
                  ['note', 'Note'],
                  ['color', 'Colour'],
                  ['image', 'Image'],
                  ['furniture', 'Furniture'],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'note' ? (
            <div className="form-grid">
              <input
                className="input"
                placeholder="Note title — “Lighting rule”"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="textarea"
                placeholder="No downlights. Two lamps, both warm."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ minHeight: 70 }}
              />
            </div>
          ) : null}

          {tab === 'color' ? (
            <div className="form-grid">
              <div className="row wrap" style={{ gap: 6 }}>
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className={`swatch ${color === c.hex ? 'is-active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => {
                      setColor(c.hex)
                      setColorName(c.name)
                    }}
                    aria-label={c.name}
                  />
                ))}
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <input
                className="input"
                placeholder="Colour name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
              />
            </div>
          ) : null}

          {tab === 'image' ? (
            <div className="stack" style={{ gap: 10 }}>
              <div className="cover-picker" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {IMAGES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={`cover-option ${image === src ? 'is-active' : ''}`}
                    onClick={() => setImage(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Inspiration option" />
                  </button>
                ))}
              </div>
              <label className="btn btn-ghost btn-xs" style={{ cursor: 'pointer' }}>
                <Icon name="image" className="icon icon-sm" /> Upload your own (max 5 MB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage(file)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
          ) : null}

          {tab === 'furniture' ? (
            <select className="select" value={pieceId} onChange={(e) => setPieceId(e.target.value)}>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {money(p.price)}
                </option>
              ))}
            </select>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}
          <button type="button" className="btn btn-primary btn-sm" onClick={add} disabled={busy}>
            <Icon name="plus" className="icon icon-sm" /> {busy ? 'Adding…' : 'Add to board'}
          </button>

          <hr className="divider" />
          <label className="row" style={{ gap: 10, fontSize: '0.84rem' }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setVisibility(e.target.checked)} />
            Public moodboard
          </label>
          <button type="button" className="btn btn-quiet btn-sm" onClick={removeBoard}>
            <Icon name="trash" className="icon icon-sm" /> Delete board
          </button>
        </div>
      ) : null}

      <div className="board-canvas">
        {items.map((item) => {
          const piece = item.ref_id ? pieceMap.get(item.ref_id) : null
          return (
            <div key={item.id} className="board-piece">
              {isOwner ? (
                <button type="button" className="piece-remove" onClick={() => remove(item.id)} aria-label="Remove piece">
                  <Icon name="x" className="icon icon-sm" />
                </button>
              ) : null}
              {item.kind === 'color' ? (
                <div className="board-piece-color" style={{ background: item.color ?? '#eee' }}>
                  <span>{item.title}</span>
                </div>
              ) : null}
              {item.kind === 'image' ? (
                <div className="board-piece-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image ?? IMAGES[0]} alt={item.title} loading="lazy" />
                </div>
              ) : null}
              {item.kind === 'note' ? (
                <div className="board-piece-note">
                  <small>{item.title}</small>
                  <span>{item.body}</span>
                </div>
              ) : null}
              {item.kind === 'furniture' ? (
                <div className="board-piece-furniture">
                  <div className="art" style={{ ['--tint' as string]: `${piece?.color ?? '#eee'}44` }}>
                    <FurnitureArt category={piece?.category ?? 'table'} color={piece?.color ?? '#ddd'} />
                  </div>
                  <strong style={{ fontSize: '0.82rem' }}>{item.title}</strong>
                  <span className="tiny">{piece ? money(piece.price) : 'Catalogue piece'}</span>
                </div>
              ) : null}
            </div>
          )
        })}
        {!items.length ? (
          <div className="empty" style={{ gridColumn: '1 / -1' }}>
            <h3>An empty board</h3>
            <p>Add a colour, a photograph, a piece of furniture or a note about how the room should feel.</p>
          </div>
        ) : null}
      </div>

      {toast ? <span className="toast">{toast}</span> : null}
    </>
  )
}
