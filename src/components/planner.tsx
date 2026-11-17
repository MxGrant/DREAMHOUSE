'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FurnitureRow, LayoutItem, LayoutRow, RoomRow } from '@/lib/types'
import { CATEGORIES, COLORS, FLOORS, THEMES, WALL_COLORS, money, roomTypeLabel } from '@/lib/design'
import { findFreeSpot, isInsideRoom, sanitizeItems } from '@/lib/layout'
import { FurnitureArt } from './furniture-art'
import { Icon, Logo } from './icons'
import { PlanCanvas } from './plan-canvas'
import { Room3D } from './room3d'
import { AiStylist, type AiPlanClient } from './ai-stylist'

type LayoutWithItems = LayoutRow & { active?: boolean }

type RoomState = Pick<
  RoomRow,
  'name' | 'width_cm' | 'length_cm' | 'wall_color' | 'floor_type' | 'floor_color' | 'theme' | 'type'
>

export function Planner({
  houseId,
  houseName,
  houseBudget,
  houseStyle,
  room,
  layouts: initialLayouts,
  items: initialItems,
  catalog,
  activeLayoutId,
}: {
  houseId: string
  houseName: string
  houseBudget: number
  houseStyle: string
  room: RoomRow
  layouts: LayoutWithItems[]
  items: LayoutItem[]
  catalog: FurnitureRow[]
  activeLayoutId: string | null
}) {
  const [items, setItems] = useState<LayoutItem[]>(initialItems)
  const [roomState, setRoomState] = useState<RoomState>({
    name: room.name,
    width_cm: room.width_cm,
    length_cm: room.length_cm,
    wall_color: room.wall_color,
    floor_type: room.floor_type,
    floor_color: room.floor_color,
    theme: room.theme,
    type: room.type,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'furniture' | 'room' | 'layouts' | 'budget'>('furniture')
  const [mode, setMode] = useState<'2d' | '3d'>('2d')
  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [layouts, setLayouts] = useState<LayoutWithItems[]>(initialLayouts)
  const [activeLayout, setActiveLayout] = useState<string | null>(activeLayoutId)
  const [layoutName, setLayoutName] = useState('')
  const [status, setStatus] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [toast, setToast] = useState('')
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)

  const itemsRef = useRef(items)
  itemsRef.current = items
  const undoRef = useRef<LayoutItem[][]>([])
  const redoRef = useRef<LayoutItem[][]>([])
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef = useRef(false)

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const commit = useCallback((next: LayoutItem[], before?: LayoutItem[]) => {
    const base = before ?? itemsRef.current
    if (JSON.stringify(base) !== JSON.stringify(next)) {
      undoRef.current = [...undoRef.current.slice(-29), base.map((it) => ({ ...it }))]
      redoRef.current = []
    }
    setItems(next)
    setStatus((s) => (s === 'error' ? 'dirty' : 'dirty'))
  }, [])

  const undo = useCallback(() => {
    const prev = undoRef.current.pop()
    if (!prev) return
    redoRef.current = [...redoRef.current, itemsRef.current.map((it) => ({ ...it }))]
    setItems(prev)
    setStatus('dirty')
  }, [])

  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current = [...undoRef.current, itemsRef.current.map((it) => ({ ...it }))]
    setItems(next)
    setStatus('dirty')
  }, [])

  // autosave
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true
      return
    }
    if (mode === '3d') return
    setStatus((s) => (s === 'saving' ? s : 'dirty'))
    const handle = setTimeout(async () => {
      setStatus('saving')
      try {
        const res = await fetch(`/api/rooms/${room.id}/layout`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsRef.current, layoutId: activeLayout }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Could not save')
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, 1100)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activeLayout, room.id])

  const selected = useMemo(() => items.find((it) => it.id === selectedId) ?? null, [items, selectedId])

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase()
    return catalog.filter((f) => {
      if (category !== 'all' && f.category !== category) return false
      if (q && !`${f.name} ${f.style} ${f.color_name} ${f.material}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [catalog, category, search])

  const roomTotal = useMemo(() => items.reduce((sum, it) => sum + it.price, 0), [items])
  const breakdown = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const it of items) {
      const current = map.get(it.category) ?? { count: 0, total: 0 }
      map.set(it.category, { count: current.count + 1, total: current.total + it.price })
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total)
  }, [items])

  function addFurniture(f: FurnitureRow) {
    const spot = findFreeSpot(items, roomState.width_cm, roomState.length_cm, f.width, f.depth, f.category)
    const item: LayoutItem = {
      id: crypto.randomUUID(),
      furnitureId: f.id,
      name: f.name,
      category: f.category,
      x: spot.x,
      y: spot.y,
      w: f.width,
      d: f.depth,
      h: f.height,
      rotation: 0,
      color: f.color,
      price: f.price,
    }
    commit([...items, item])
    setSelectedId(item.id)
    notify(`${f.name} added — drag it into place`)
  }

  function deleteSelected() {
    if (!selected) return
    commit(items.filter((it) => it.id !== selected.id))
    setSelectedId(null)
    notify('Piece removed')
  }

  function duplicateSelected() {
    if (!selected) return
    const spot = findFreeSpot(items, roomState.width_cm, roomState.length_cm, selected.w, selected.d, selected.category)
    const copy: LayoutItem = { ...selected, id: crypto.randomUUID(), x: spot.x, y: spot.y }
    commit([...items, copy])
    setSelectedId(copy.id)
  }

  function updateSelected(patch: Partial<LayoutItem>) {
    if (!selected) return
    commit(items.map((it) => (it.id === selected.id ? { ...it, ...patch } : it)))
  }

  function rotateSelected(delta: number) {
    if (!selected) return
    updateSelected({ rotation: (((selected.rotation + delta) % 360) + 360) % 360 })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault()
          deleteSelected()
        }
      }
      if (e.key === 'r' && selectedId) rotateSelected(15)
      if (e.key === 'Escape') setSelectedId(null)
      if (e.key === 'd' && selectedId) {
        e.preventDefault()
        duplicateSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function saveRoomSettings() {
    setBusy(true)
    try {
      const fitted = items.map((it) => {
        if (isInsideRoom(it, roomState.width_cm, roomState.length_cm)) return it
        const rad = (it.rotation * Math.PI) / 180
        const ew = Math.abs(Math.cos(rad)) * it.w + Math.abs(Math.sin(rad)) * it.d
        const ed = Math.abs(Math.sin(rad)) * it.w + Math.abs(Math.cos(rad)) * it.d
        return {
          ...it,
          x: Math.round(Math.min(Math.max(it.x, ew / 2), Math.max(ew / 2, roomState.width_cm - ew / 2))),
          y: Math.round(Math.min(Math.max(it.y, ed / 2), Math.max(ed / 2, roomState.length_cm - ed / 2))),
        }
      })
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomState.name,
          width_cm: roomState.width_cm,
          length_cm: roomState.length_cm,
          wall_color: roomState.wall_color,
          floor_type: roomState.floor_type,
          floor_color: roomState.floor_color,
          theme: roomState.theme,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save the room')
      if (JSON.stringify(fitted) !== JSON.stringify(items)) commit(fitted)
      notify('Room settings saved')
    } catch (err) {
      notify((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function saveAsDesign() {
    if (!layoutName.trim()) {
      notify('Give the design a name first')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/rooms/${room.id}/layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: layoutName, items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save the design')
      setLayouts(data.layouts)
      setActiveLayout(data.layoutId)
      setLayoutName('')
      setStatus('saved')
      notify('Design saved as a new version')
    } catch (err) {
      notify((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function loadDesign(layoutId: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/layouts/${layoutId}/activate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not load that design')
      setItems(sanitizeItems(data.items))
      setActiveLayout(layoutId)
      setLayouts((prev) => prev.map((l) => ({ ...l, active: l.id === layoutId })))
      setStatus('saved')
      setSelectedId(null)
      notify('Design restored')
    } catch (err) {
      notify((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteDesign(layoutId: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/layouts/${layoutId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not delete that design')
      const list = layouts.filter((l) => l.id !== layoutId)
      setLayouts(list)
      if (layoutId === activeLayout) {
        const next = list[0]
        if (next) await loadDesign(next.id)
      }
      notify('Design deleted')
    } catch (err) {
      notify((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function applyPalette(plan: AiPlanClient) {
    const theme = THEMES.find((t) => t.id === plan.themeId)
    setRoomState((prev) => ({
      ...prev,
      theme: plan.themeId,
      wall_color: plan.palette[0]?.hex ?? prev.wall_color,
      floor_color: theme?.floor ?? prev.floor_color,
      floor_type: theme?.floorType ?? prev.floor_type,
    }))
    setTab('room')
    notify('Palette applied — save the room to keep it')
  }

  function addAiPicks(plan: AiPlanClient) {
    let next = [...items]
    for (const f of plan.picks) {
      const spot = findFreeSpot(next, roomState.width_cm, roomState.length_cm, f.width, f.depth, f.category)
      next.push({
        id: crypto.randomUUID(),
        furnitureId: f.id,
        name: f.name,
        category: f.category,
        x: spot.x,
        y: spot.y,
        w: f.width,
        d: f.depth,
        h: f.height,
        rotation: 0,
        color: f.color,
        price: f.price,
      })
    }
    commit(next)
    notify(`${plan.picks.length} pieces added from the stylist`)
  }

  const statusLabel =
    status === 'saving'
      ? 'Saving…'
      : status === 'dirty'
        ? 'Unsaved changes'
        : status === 'error'
          ? 'Save failed — retrying'
          : 'All changes saved'

  return (
    <>
      <div className="planner-bar">
        <Link href={`/studio/${houseId}`} className="icon-btn" aria-label="Back to house" title="Back to house">
          <Icon name="arrow-left" className="icon icon-sm" />
        </Link>
        <Link href="/" className="logo" title="Dreamhouse">
          <span className="logo-mark">
            <Logo />
          </span>
          dreamhouse
        </Link>
        <div className="planner-title">
          <strong>{roomState.name}</strong>
          <span>
            {houseName} · {roomTypeLabel(roomState.type)} · {roomState.width_cm}×{roomState.length_cm} cm
          </span>
        </div>
        <div className="planner-bar-actions">
          <span className={`save-chip ${status === 'saved' ? '' : 'is-dirty'}`}>
            <span className="live-dot" />
            {statusLabel}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPreview(true)}
            title="Open 3D preview"
            aria-label="Open 3D preview"
          >
            <Icon name="cube" className="icon icon-sm" />
          </button>
          <Link href={`/houses/${houseId}`} className="btn btn-ghost btn-sm">
            View house
          </Link>
        </div>
      </div>

      <div className="planner">
        <aside className="planner-left">
          <div className="panel-tabs">
            {(
              [
                ['furniture', 'Furniture'],
                ['room', 'Room'],
                ['layouts', 'Designs'],
                ['budget', 'Budget'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>

          <div className="panel-body">
            {tab === 'furniture' ? (
              <>
                <div className="field">
                  <input
                    className="input"
                    placeholder="Search sofas, rugs, oak…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search furniture"
                  />
                </div>
                <div className="cat-list">
                  <button
                    type="button"
                    className={`cat-btn ${category === 'all' ? 'is-active' : ''}`}
                    onClick={() => setCategory('all')}
                  >
                    <i style={{ background: '#E489A6' }} /> All pieces
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`cat-btn ${category === c.id ? 'is-active' : ''}`}
                      onClick={() => setCategory(c.id)}
                    >
                      <i style={{ background: c.tint }} /> {c.plural}
                    </button>
                  ))}
                </div>
                <div className="catalog-scroll">
                  {filteredCatalog.map((f) => (
                    <button key={f.id} type="button" className="mini-item" onClick={() => addFurniture(f)}>
                      <span className="mini-art" style={{ background: `linear-gradient(150deg, ${f.color}66, ${f.color}22)` }}>
                        <FurnitureArt category={f.category} color={f.color} />
                      </span>
                      <span className="mini-item-body">
                        <strong>{f.name}</strong>
                        <span>
                          {money(f.price)} · {f.width}×{f.depth} cm
                        </span>
                      </span>
                      <span className="add" aria-hidden="true">
                        +
                      </span>
                    </button>
                  ))}
                  {!filteredCatalog.length ? <p className="tiny">No pieces match that search.</p> : null}
                </div>
              </>
            ) : null}

            {tab === 'room' ? (
              <>
                <div className="panel-section">
                  <h4>Room</h4>
                  <div className="field">
                    <label htmlFor="room-name">Name</label>
                    <input
                      id="room-name"
                      className="input"
                      value={roomState.name}
                      onChange={(e) => setRoomState({ ...roomState, name: e.target.value })}
                    />
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="field">
                      <label htmlFor="room-w">Width (cm)</label>
                      <input
                        id="room-w"
                        className="input"
                        type="number"
                        min={180}
                        max={1200}
                        step={10}
                        value={roomState.width_cm}
                        onChange={(e) =>
                          setRoomState({ ...roomState, width_cm: Math.min(1200, Math.max(180, Number(e.target.value) || 180)) })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="room-l">Length (cm)</label>
                      <input
                        id="room-l"
                        className="input"
                        type="number"
                        min={180}
                        max={1200}
                        step={10}
                        value={roomState.length_cm}
                        onChange={(e) =>
                          setRoomState({ ...roomState, length_cm: Math.min(1200, Math.max(180, Number(e.target.value) || 180)) })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="panel-section">
                  <h4>Wall colour</h4>
                  <div className="swatch-row">
                    {WALL_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`swatch ${roomState.wall_color === hex ? 'is-active' : ''}`}
                        style={{ background: hex }}
                        onClick={() => setRoomState({ ...roomState, wall_color: hex })}
                        aria-label={`Wall colour ${hex}`}
                      />
                    ))}
                  </div>
                  <label className="tiny" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    Custom
                    <input
                      type="color"
                      value={roomState.wall_color}
                      onChange={(e) => setRoomState({ ...roomState, wall_color: e.target.value })}
                    />
                  </label>
                </div>

                <div className="panel-section">
                  <h4>Flooring</h4>
                  <div className="cat-list">
                    {FLOORS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`cat-btn ${roomState.floor_type === f.id ? 'is-active' : ''}`}
                        onClick={() => setRoomState({ ...roomState, floor_type: f.id, floor_color: f.color })}
                      >
                        <i style={{ background: f.color }} /> {f.name}
                      </button>
                    ))}
                  </div>
                  <label className="tiny" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    Custom floor
                    <input
                      type="color"
                      value={roomState.floor_color}
                      onChange={(e) => setRoomState({ ...roomState, floor_color: e.target.value })}
                    />
                  </label>
                </div>

                <div className="panel-section">
                  <h4>Theme</h4>
                  <div className="cat-list">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`cat-btn ${roomState.theme === t.id ? 'is-active' : ''}`}
                        onClick={() =>
                          setRoomState({
                            ...roomState,
                            theme: t.id,
                            wall_color: t.wall,
                            floor_type: t.floorType,
                            floor_color: t.floor,
                          })
                        }
                      >
                        <i style={{ background: t.accent }} /> {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" className="btn btn-primary btn-sm" onClick={saveRoomSettings} disabled={busy}>
                  <Icon name="save" className="icon icon-sm" /> Save room settings
                </button>
              </>
            ) : null}

            {tab === 'layouts' ? (
              <>
                <div className="panel-section">
                  <h4>Saved designs</h4>
                  <p className="tiny">Your current arrangement autosaves. Save a copy to compare options.</p>
                  {layouts.map((l) => (
                    <div key={l.id} className={`layout-row ${l.id === activeLayout ? 'is-active' : ''}`}>
                      <strong>{l.name}</strong>
                      <span className="tiny">{l.items.length} pcs</span>
                      <button type="button" className="mini-link" onClick={() => loadDesign(l.id)}>
                        Load
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => deleteDesign(l.id)}
                        aria-label={`Delete ${l.name}`}
                      >
                        <Icon name="trash" className="icon icon-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="panel-section">
                  <h4>Save this arrangement</h4>
                  <input
                    className="input"
                    placeholder="e.g. Evening hosting"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                  />
                  <button type="button" className="btn btn-rose btn-sm" onClick={saveAsDesign} disabled={busy}>
                    <Icon name="save" className="icon icon-sm" /> Save as new design
                  </button>
                  <p className="tiny">
                    Loading a design replaces the room instantly and is autosaved. Deleting a design cannot be undone.
                  </p>
                </div>
              </>
            ) : null}

            {tab === 'budget' ? (
              <>
                <div className="panel-section">
                  <h4>Room budget</h4>
                  <div className="kv">
                    <span>This room</span>
                    <strong>{money(roomTotal)}</strong>
                  </div>
                  <div className="kv">
                    <span>House budget</span>
                    <strong>{money(houseBudget)}</strong>
                  </div>
                  <div className={`budget-bar ${roomTotal > houseBudget ? 'is-over' : ''}`}>
                    <i style={{ width: `${Math.min(100, (roomTotal / Math.max(1, houseBudget)) * 100)}%` }} />
                  </div>
                  <p className="tiny">
                    {roomTotal > houseBudget
                      ? `${money(roomTotal - houseBudget)} over the house budget.`
                      : `${money(houseBudget - roomTotal)} of the house budget left.`}
                  </p>
                </div>
                <div className="panel-section">
                  <h4>By category</h4>
                  {breakdown.map(([cat, v]) => (
                    <div key={cat} className="kv">
                      <span>
                        {CATEGORIES.find((c) => c.id === cat)?.plural ?? cat} · {v.count}
                      </span>
                      <strong>{money(v.total)}</strong>
                    </div>
                  ))}
                  {!breakdown.length ? <p className="tiny">Nothing placed yet.</p> : null}
                </div>
                <div className="panel-section">
                  <h4>Most expensive</h4>
                  {items
                    .slice()
                    .sort((a, b) => b.price - a.price)
                    .slice(0, 4)
                    .map((it) => (
                      <div key={it.id} className="kv">
                        <span>{it.name}</span>
                        <strong>{money(it.price)}</strong>
                      </div>
                    ))}
                </div>
              </>
            ) : null}
          </div>
        </aside>

        <section className="planner-stage">
          <div className="stage-toolbar">
            <div className="tool-group">
              <button
                type="button"
                className="stage-tool"
                onClick={undo}
                disabled={!undoRef.current.length}
                title="Undo (⌘Z)"
              >
                <Icon name="undo" className="icon icon-sm" /> Undo
              </button>
              <button
                type="button"
                className="stage-tool"
                onClick={redo}
                disabled={!redoRef.current.length}
                title="Redo (⇧⌘Z)"
              >
                <Icon name="redo" className="icon icon-sm" /> Redo
              </button>
            </div>
            <div className="tool-group">
              <button
                type="button"
                className="stage-tool"
                onClick={() => rotateSelected(15)}
                disabled={!selected}
                title="Rotate 15° (R)"
              >
                <Icon name="rotate" className="icon icon-sm" /> Rotate
              </button>
              <button
                type="button"
                className="stage-tool"
                onClick={duplicateSelected}
                disabled={!selected}
                title="Duplicate (D)"
              >
                <Icon name="layers" className="icon icon-sm" /> Duplicate
              </button>
              <button
                type="button"
                className="stage-tool"
                onClick={deleteSelected}
                disabled={!selected}
                title="Delete (⌫)"
              >
                <Icon name="trash" className="icon icon-sm" /> Delete
              </button>
            </div>
            <div className="tool-group right" style={{ marginLeft: 'auto' }}>
              <button
                type="button"
                className={`stage-tool ${mode === '2d' ? 'is-active' : ''}`}
                onClick={() => setMode('2d')}
              >
                <Icon name="grid" className="icon icon-sm" /> 2D plan
              </button>
              <button
                type="button"
                className={`stage-tool ${mode === '3d' ? 'is-active' : ''}`}
                onClick={() => setMode('3d')}
              >
                <Icon name="cube" className="icon icon-sm" /> 3D view
              </button>
            </div>
          </div>

          {mode === '2d' ? (
            <PlanCanvas
              room={roomState}
              items={items}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id || null)}
              onLive={(next) => setItems(next)}
              onCommit={commit}
              zoom={zoom}
              onZoom={setZoom}
              pan={pan}
              onPan={setPan}
              onMessage={notify}
            />
          ) : (
            <div style={{ position: 'relative', flex: 1 }}>
              <Room3D
                room={{
                  width_cm: roomState.width_cm,
                  length_cm: roomState.length_cm,
                  wall_color: roomState.wall_color,
                  floor_color: roomState.floor_color,
                }}
                items={items}
              />
            </div>
          )}
        </section>

        <aside className="planner-right">
          <div className="panel-tabs" style={{ paddingBottom: 8 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-soft)', padding: '8px 4px' }}>
              Inspector
            </span>
          </div>
          <div className="panel-body">
            {selected ? (
              <>
                <div className="selected-card">
                  <header>
                    <strong>{selected.name}</strong>
                    <span className="price">{money(selected.price)}</span>
                  </header>
                  <span className="tiny">
                    {CATEGORIES.find((c) => c.id === selected.category)?.label ?? selected.category}
                  </span>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="tiny">Width</span>
                    <div className="stepper">
                      <button type="button" onClick={() => updateSelected({ w: Math.max(24, selected.w - 10) })}>
                        −
                      </button>
                      <span>{selected.w} cm</span>
                      <button type="button" onClick={() => updateSelected({ w: Math.min(560, selected.w + 10) })}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="tiny">Depth</span>
                    <div className="stepper">
                      <button type="button" onClick={() => updateSelected({ d: Math.max(24, selected.d - 10) })}>
                        −
                      </button>
                      <span>{selected.d} cm</span>
                      <button type="button" onClick={() => updateSelected({ d: Math.min(560, selected.d + 10) })}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="tiny">Rotation</span>
                    <div className="stepper">
                      <button type="button" onClick={() => rotateSelected(-15)}>
                        −
                      </button>
                      <span>{selected.rotation}°</span>
                      <button type="button" onClick={() => rotateSelected(15)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="swatch-row">
                    {COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        className={`swatch ${selected.color.toLowerCase() === c.hex.toLowerCase() ? 'is-active' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => updateSelected({ color: c.hex })}
                        aria-label={c.name}
                        title={c.name}
                      />
                    ))}
                    <label className="swatch" style={{ background: selected.color, cursor: 'pointer' }} title="Custom colour">
                      <input
                        type="color"
                        value={selected.color}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        style={{ opacity: 0, width: '100%', height: '100%' }}
                      />
                    </label>
                  </div>
                  <div className="row">
                    <button type="button" className="btn btn-ghost btn-xs grow" onClick={duplicateSelected}>
                      <Icon name="layers" className="icon icon-sm" /> Duplicate
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs grow" onClick={deleteSelected}>
                      <Icon name="trash" className="icon icon-sm" /> Remove
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="inspector-empty">
                <strong style={{ color: 'var(--ink)' }}>Nothing selected</strong>
                <span>Tap a piece to move, resize, rotate or recolour it. Drag the room to pan.</span>
                <div className="kv" style={{ marginTop: 6 }}>
                  <span>Pieces placed</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="kv">
                  <span>Room total</span>
                  <strong>{money(roomTotal)}</strong>
                </div>
                <div className="kv">
                  <span>Floor area</span>
                  <strong>{((roomState.width_cm * roomState.length_cm) / 10000).toFixed(1)} m²</strong>
                </div>
              </div>
            )}

            <AiStylist
              compact
              roomType={roomState.type}
              style={houseStyle}
              budget={houseBudget}
              onApplyPalette={applyPalette}
              onAddPicks={addAiPicks}
            />
          </div>
        </aside>
      </div>

      {preview ? (
        <div className="preview-modal" onClick={() => setPreview(false)}>
          <div className="preview-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="preview-close" onClick={() => setPreview(false)} aria-label="Close preview">
              <Icon name="x" className="icon icon-sm" />
            </button>
            <Room3D
              room={{
                width_cm: roomState.width_cm,
                length_cm: roomState.length_cm,
                wall_color: roomState.wall_color,
                floor_color: roomState.floor_color,
              }}
              items={items}
              badge="3D preview · drag to orbit · scroll to zoom"
            />
          </div>
        </div>
      ) : null}

      {toast ? <span className="toast">{toast}</span> : null}
    </>
  )
}
