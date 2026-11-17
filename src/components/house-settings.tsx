'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { HouseRow } from '@/lib/types'
import { STYLES, THEMES, money } from '@/lib/design'
import { Icon } from './icons'

const COVERS = [
  '/homes/living-linen.jpg',
  '/homes/living-nordic.jpg',
  '/homes/living-penthouse.jpg',
  '/homes/living-modern.jpg',
  '/homes/living-cosy.jpg',
  '/homes/living-bright.jpg',
  '/homes/bedroom-boucle.jpg',
  '/homes/kitchen-marble.jpg',
  '/homes/study-green.jpg',
  '/homes/dining-warm.jpg',
]

export function HouseSettings({ house }: { house: HouseRow }) {
  const router = useRouter()
  const [name, setName] = useState(house.name)
  const [description, setDescription] = useState(house.description)
  const [style, setStyle] = useState(house.style)
  const [theme, setTheme] = useState(house.theme)
  const [budget, setBudget] = useState(house.budget)
  const [cover, setCover] = useState(house.cover_image)
  const [isPublic, setIsPublic] = useState(house.is_public)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/houses/${house.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          style,
          theme,
          budget,
          coverImage: cover,
          isPublic,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save those settings')
      setMessage('House updated')
      router.refresh()
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${house.name}” and all of its rooms? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/houses/${house.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not delete that house')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="panel stack" style={{ gap: 14 }}>
      <div>
        <h3>House settings</h3>
        <p className="panel-sub">Name, palette, budget and who can see it.</p>
      </div>
      <div className="field">
        <label htmlFor="hs-name">Name</label>
        <input id="hs-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="hs-desc">Description</label>
        <textarea
          id="hs-desc"
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: 82 }}
        />
      </div>
      <div className="form-grid form-grid-2">
        <div className="field">
          <label htmlFor="hs-style">Style</label>
          <select id="hs-style" className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
            {STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hs-theme">Palette</label>
          <select id="hs-theme" className="select" value={theme} onChange={(e) => setTheme(e.target.value)}>
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="hs-budget">Budget — {money(budget)}</label>
        <input
          id="hs-budget"
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="range"
        />
      </div>
      <div className="field">
        <label>Cover</label>
        <div className="cover-picker">
          {COVERS.map((c) => (
            <button
              key={c}
              type="button"
              className={`cover-option ${cover === c ? 'is-active' : ''}`}
              onClick={() => setCover(c)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c} alt="Cover option" />
            </button>
          ))}
        </div>
      </div>
      <label className="row" style={{ gap: 10, fontSize: '0.86rem' }}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <span>
          <strong>Public</strong> — anyone with the link can view this house.
        </span>
      </label>

      {error ? <div className="form-error">{error}</div> : null}
      {message ? <div className="save-chip">{message}</div> : null}

      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
          <Icon name="save" className="icon icon-sm" /> {busy ? 'Saving…' : 'Save house'}
        </button>
        <button type="button" className="btn btn-quiet btn-sm right" onClick={remove} disabled={busy}>
          <Icon name="trash" className="icon icon-sm" /> Delete
        </button>
      </div>
    </div>
  )
}
