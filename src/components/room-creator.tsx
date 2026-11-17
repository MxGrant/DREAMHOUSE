'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FLOORS, ROOM_TYPES, THEMES, WALL_COLORS } from '@/lib/design'
import { Icon } from './icons'

export function RoomCreator({ houseId, defaultTheme }: { houseId: string; defaultTheme: string }) {
  const router = useRouter()
  const [type, setType] = useState('living')
  const [name, setName] = useState('')
  const [width, setWidth] = useState(ROOM_TYPES[0].width)
  const [length, setLength] = useState(ROOM_TYPES[0].length)
  const [theme, setTheme] = useState(defaultTheme)
  const [wall, setWall] = useState(THEMES.find((t) => t.id === defaultTheme)?.wall ?? WALL_COLORS[0])
  const [floor, setFloor] = useState(FLOORS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function pickType(id: string) {
    const t = ROOM_TYPES.find((r) => r.id === id) ?? ROOM_TYPES[0]
    setType(id)
    setWidth(t.width)
    setLength(t.length)
  }

  async function create() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/houses/${houseId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          type,
          width,
          length,
          theme,
          wallColor: wall,
          floorType: floor.id,
          floorColor: floor.color,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add that room')
      router.push(`/studio/${houseId}/${data.roomId}`)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="panel stack" style={{ gap: 14 }}>
      <div>
        <h3>Add a room</h3>
        <p className="panel-sub">Set the real measurements — everything else follows.</p>
      </div>

      <div className="field">
        <label htmlFor="rc-type">Room type</label>
        <select id="rc-type" className="select" value={type} onChange={(e) => pickType(e.target.value)}>
          {ROOM_TYPES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="rc-name">Name (optional)</label>
        <input
          id="rc-name"
          className="input"
          placeholder="e.g. Morning room"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-grid form-grid-2">
        <div className="field">
          <label htmlFor="rc-w">Width (cm)</label>
          <input
            id="rc-w"
            type="number"
            min={180}
            max={1200}
            step={10}
            className="input"
            value={width}
            onChange={(e) => setWidth(Math.min(1200, Math.max(180, Number(e.target.value) || 180)))}
          />
        </div>
        <div className="field">
          <label htmlFor="rc-l">Length (cm)</label>
          <input
            id="rc-l"
            type="number"
            min={180}
            max={1200}
            step={10}
            className="input"
            value={length}
            onChange={(e) => setLength(Math.min(1200, Math.max(180, Number(e.target.value) || 180)))}
          />
        </div>
      </div>

      <div className="field">
        <label>Wall colour</label>
        <div className="swatch-row">
          {WALL_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`swatch ${wall === hex ? 'is-active' : ''}`}
              style={{ background: hex }}
              onClick={() => setWall(hex)}
              aria-label={`Wall ${hex}`}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <label>Flooring</label>
        <div className="row wrap" style={{ gap: 6 }}>
          {FLOORS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${floor.id === f.id ? 'is-active' : ''}`}
              onClick={() => setFloor(f)}
            >
              <span className="swatch" style={{ width: 11, height: 11, background: f.color }} /> {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="rc-theme">Theme</label>
        <select
          id="rc-theme"
          className="select"
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value)
            const t = THEMES.find((x) => x.id === e.target.value)
            if (t) {
              setWall(t.wall)
              setFloor(FLOORS.find((f) => f.id === t.floorType) ?? FLOORS[0])
            }
          }}
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <button type="button" className="btn btn-primary btn-sm" onClick={create} disabled={busy}>
        <Icon name="plus" className="icon icon-sm" /> {busy ? 'Adding…' : 'Create room'}
      </button>
      <p className="tiny">
        {((width * length) / 10000).toFixed(1)} m² · the planner opens as soon as the room exists.
      </p>
    </div>
  )
}
