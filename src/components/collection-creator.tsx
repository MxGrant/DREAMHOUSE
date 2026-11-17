'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from './icons'

export function CollectionCreator() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create that collection')
      setOpen(false)
      setTitle('')
      setDescription('')
      router.refresh()
      router.push(`/collections/${data.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        <Icon name="plus" className="icon icon-sm" /> New collection
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New collection</h2>
            <p className="tiny">Group houses into a shareable list.</p>
            <div className="form-grid" style={{ marginTop: 18 }}>
              <div className="field">
                <label htmlFor="col-title">Title</label>
                <input
                  id="col-title"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sunday Living"
                  autoFocus
                />
              </div>
              <div className="field">
                <label htmlFor="col-desc">Description</label>
                <textarea
                  id="col-desc"
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rooms for a slow day…"
                  style={{ minHeight: 70 }}
                />
              </div>
              <label className="row" style={{ gap: 10, fontSize: '0.86rem' }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Public collection
              </label>
              {error ? <div className="form-error">{error}</div> : null}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={create} disabled={busy}>
                {busy ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
