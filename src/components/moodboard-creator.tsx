'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { THEMES } from '@/lib/design'
import { Icon } from './icons'

export function MoodboardCreator() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState('blush')
  const [isPublic, setIsPublic] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/moodboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, theme, isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create that board')
      setOpen(false)
      router.push(`/moodboards/${data.id}`)
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
        <Icon name="plus" className="icon" /> New moodboard
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Start a moodboard</h2>
            <p className="tiny">Colours, furniture, images and notes — all on one board.</p>
            <div className="form-grid" style={{ marginTop: 18 }}>
              <div className="field">
                <label htmlFor="mb-title">Title</label>
                <input
                  id="mb-title"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Slow Mornings"
                  autoFocus
                />
              </div>
              <div className="field">
                <label htmlFor="mb-desc">Description</label>
                <textarea
                  id="mb-desc"
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Warm cream, blush ceramic, a little brass…"
                  style={{ minHeight: 70 }}
                />
              </div>
              <div className="field">
                <label htmlFor="mb-theme">Palette</label>
                <select id="mb-theme" className="select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  {THEMES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="row" style={{ gap: 10, fontSize: '0.86rem' }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Share publicly
              </label>
              {error ? <div className="form-error">{error}</div> : null}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={create} disabled={busy}>
                {busy ? 'Creating…' : 'Create board'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
