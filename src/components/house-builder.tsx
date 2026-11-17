'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { STYLES, THEMES, money } from '@/lib/design'
import { Icon } from './icons'

const COVERS = [
  { src: '/homes/living-linen.jpg', label: 'Sunlit living' },
  { src: '/homes/living-nordic.jpg', label: 'Nordic calm' },
  { src: '/homes/living-penthouse.jpg', label: 'Penthouse' },
  { src: '/homes/bedroom-boucle.jpg', label: 'Soft bedroom' },
  { src: '/homes/kitchen-marble.jpg', label: 'Marble kitchen' },
  { src: '/homes/study-green.jpg', label: 'Green study' },
]

export function HouseBuilder({ trigger = 'Create a house' }: { trigger?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('scandinavian')
  const [theme, setTheme] = useState('blush')
  const [budget, setBudget] = useState(9000)
  const [cover, setCover] = useState(COVERS[0].src)
  const [isPublic, setIsPublic] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    if (name.trim().length < 2) {
      setError('Give the house a name first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, style, theme, budget, coverImage: cover, isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create that house')
      setOpen(false)
      router.push(data.roomId ? `/studio/${data.houseId}/${data.roomId}` : `/studio/${data.houseId}`)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <Icon name="plus" className="icon" /> {trigger}
      </button>

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="eyebrow">
              <span className="dot" /> New house
            </span>
            <h2 style={{ marginTop: 10 }}>Let’s start with the shell.</h2>
            <p className="tiny">You can change every one of these later.</p>

            <div className="form-grid" style={{ marginTop: 20 }}>
              <div className="field">
                <label htmlFor="house-name">House name</label>
                <input
                  id="house-name"
                  className="input"
                  placeholder="The Blush Apartment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field">
                <label htmlFor="house-desc">A sentence about it</label>
                <textarea
                  id="house-desc"
                  className="textarea"
                  placeholder="A 60 m² flat layered in pastel and oak…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: 68 }}
                />
              </div>
              <div className="form-grid form-grid-2">
                <div className="field">
                  <label htmlFor="house-style">Style</label>
                  <select id="house-style" className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
                    {STYLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="house-theme">Palette</label>
                  <select id="house-theme" className="select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    {THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="house-budget">Furniture budget — {money(budget)}</label>
                <input
                  id="house-budget"
                  type="range"
                  min={1000}
                  max={40000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="range"
                />
              </div>
              <div className="field">
                <label>Cover photograph</label>
                <div className="house-cover-picker">
                  {COVERS.map((c) => (
                    <button
                      key={c.src}
                      type="button"
                      className={`cover-option ${cover === c.src ? 'is-active' : ''}`}
                      onClick={() => setCover(c.src)}
                      title={c.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt={c.label} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="row" style={{ gap: 10, fontSize: '0.86rem' }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Publish to the community
              </label>

              {error ? <div className="form-error">{error}</div> : null}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={create} disabled={busy}>
                {busy ? 'Creating…' : 'Create house'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
