'use client'

import { useMemo, useState } from 'react'
import type { FurnitureRow } from '@/lib/types'
import { CATEGORIES, COLORS, STYLES, money } from '@/lib/design'
import { FurnitureArt } from './furniture-art'
import { Icon } from './icons'

type RoomOption = { id: string; name: string; house_name: string; house_id: string }
type BoardOption = { id: string; title: string }

export function CatalogueBrowser({
  catalog,
  rooms,
  boards,
  signedIn,
}: {
  catalog: FurnitureRow[]
  rooms: RoomOption[]
  boards: BoardOption[]
  signedIn: boolean
}) {
  const [category, setCategory] = useState('all')
  const [style, setStyle] = useState('all')
  const [color, setColor] = useState('all')
  const [sort, setSort] = useState('popularity')
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(4000)
  const [active, setActive] = useState<FurnitureRow | null>(null)
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '')
  const [boardId, setBoardId] = useState(boards[0]?.id ?? '')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  function flash(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2600)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = catalog.filter((f) => {
      if (category !== 'all' && f.category !== category) return false
      if (style !== 'all' && f.style !== style) return false
      if (color !== 'all' && !f.color_name.toLowerCase().includes(color.toLowerCase())) return false
      if (f.price > maxPrice) return false
      if (q && !`${f.name} ${f.material} ${f.color_name} ${f.blurb}`.toLowerCase().includes(q)) return false
      return true
    })
    if (sort === 'price-asc') return list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return list.sort((a, b) => b.price - a.price)
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name))
    return list.sort((a, b) => b.popularity - a.popularity)
  }, [catalog, category, style, color, search, sort, maxPrice])

  async function addToRoom() {
    if (!active || !roomId) return
    setBusy(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/furniture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ furnitureId: active.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add that piece')
      const room = rooms.find((r) => r.id === roomId)
      flash(`${active.name} added to ${room?.name ?? 'your room'}`)
      setActive(null)
    } catch (err) {
      flash((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function addToBoard() {
    if (!active || !boardId) return
    setBusy(true)
    try {
      const res = await fetch(`/api/moodboards/${boardId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'furniture', refId: active.id, title: active.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add to the board')
      flash(`Pinned to ${boards.find((b) => b.id === boardId)?.title ?? 'your board'}`)
      setActive(null)
    } catch (err) {
      flash((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="panel" style={{ padding: 18, marginBottom: 24 }}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="row wrap" style={{ gap: 10 }}>
            <div className="field grow" style={{ minWidth: 220 }}>
              <label htmlFor="cat-search">Search the catalogue</label>
              <input
                id="cat-search"
                className="input"
                placeholder="Bouclé sofa, marble, rattan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label htmlFor="cat-sort">Sort</label>
              <select id="cat-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popularity">Most loved</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="field" style={{ minWidth: 190 }}>
              <label htmlFor="cat-price">Max price — {money(maxPrice)}</label>
              <input
                id="cat-price"
                type="range"
                min={100}
                max={4000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="range"
              />
            </div>
          </div>

          <div className="row wrap" style={{ gap: 8 }}>
            <button type="button" className={`chip ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>
              All categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${category === c.id ? 'is-active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.plural}
              </button>
            ))}
          </div>

          <div className="row wrap" style={{ gap: 8 }}>
            <button type="button" className={`chip ${style === 'all' ? 'is-active' : ''}`} onClick={() => setStyle('all')}>
              All styles
            </button>
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip ${style === s.id ? 'is-active' : ''}`}
                onClick={() => setStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            <span className="tiny">Colour</span>
            <button
              type="button"
              className={`chip ${color === 'all' ? 'is-active' : ''}`}
              onClick={() => setColor('all')}
            >
              Any
            </button>
            {COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`chip ${color === c.name ? 'is-active' : ''}`}
                onClick={() => setColor(c.name)}
              >
                <span
                  className="swatch"
                  style={{ width: 12, height: 12, background: c.hex, display: 'inline-block' }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <p className="tiny">
          {filtered.length} of {catalog.length} pieces
        </p>
        {(category !== 'all' || style !== 'all' || color !== 'all' || search) && (
          <button
            type="button"
            className="mini-link"
            onClick={() => {
              setCategory('all')
              setStyle('all')
              setColor('all')
              setSearch('')
              setMaxPrice(4000)
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="furniture-grid">
        {filtered.map((f) => (
          <article key={f.id} className="furniture-tile">
            <div className="furniture-tile-art" style={{ ['--tint' as string]: `${f.color}44` }}>
              <FurnitureArt category={f.category} color={f.color} title={f.name} />
            </div>
            <div className="furniture-tile-body">
              <h4>{f.name}</h4>
              <span className="tiny">
                {f.color_name} · {f.width}×{f.depth} cm
              </span>
              <div className="furniture-tile-foot">
                <span className="price">{money(f.price)}</span>
                <span className="badge" style={{ fontSize: '0.6rem' }}>
                  {f.style.replace('-', ' ')}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                style={{ marginTop: 10 }}
                onClick={() => {
                  if (!signedIn) {
                    window.location.href = '/login?next=/catalogue'
                    return
                  }
                  setActive(f)
                }}
              >
                <Icon name="plus" className="icon icon-sm" /> Add to my room
              </button>
            </div>
          </article>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty" style={{ marginTop: 20 }}>
          <h3>Nothing in that combination.</h3>
          <p>Loosen a filter — or try searching for a material like “linen” or “oak”.</p>
        </div>
      ) : null}

      {active ? (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ gap: 14 }}>
              <div
                style={{
                  width: 92,
                  height: 72,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: `${active.color}44`,
                }}
              >
                <FurnitureArt category={active.category} color={active.color} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>{active.name}</h2>
                <p className="tiny">
                  {money(active.price)} · {active.width}×{active.depth}×{active.height} cm · {active.material}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.87rem', color: 'var(--ink-soft)', marginTop: 12 }}>{active.blurb}</p>

            <div className="form-grid" style={{ marginTop: 18 }}>
              <div className="field">
                <label htmlFor="add-room">Add to a room</label>
                <select
                  id="add-room"
                  className="select"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  disabled={!rooms.length}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.house_name} · {r.name}
                    </option>
                  ))}
                  {!rooms.length ? <option value="">No rooms yet</option> : null}
                </select>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={addToRoom} disabled={busy || !roomId}>
                <Icon name="sofa" className="icon icon-sm" /> Place it in the room
              </button>

              <div className="field">
                <label htmlFor="add-board">Pin to a moodboard</label>
                <select
                  id="add-board"
                  className="select"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  disabled={!boards.length}
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                  {!boards.length ? <option value="">No moodboards yet</option> : null}
                </select>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addToBoard} disabled={busy || !boardId}>
                <Icon name="palette" className="icon icon-sm" /> Pin to moodboard
              </button>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setActive(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <span className="toast">{toast}</span> : null}
    </>
  )
}
