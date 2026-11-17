'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from './icons'

export function AddToCollection({
  houseId,
  collections,
  signedIn,
}: {
  houseId: string
  collections: { id: string; title: string; has: boolean }[]
  signedIn: boolean
}) {
  const [selected, setSelected] = useState(collections.find((c) => !c.has)?.id ?? collections[0]?.id ?? '')
  const [added, setAdded] = useState<string[]>(collections.filter((c) => c.has).map((c) => c.id))
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  if (!signedIn) return null

  if (!collections.length) {
    return (
      <div className="panel">
        <h3>Collections</h3>
        <p className="panel-sub">Create a collection to gather designs you love.</p>
        <Link href="/dashboard#collections" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
          <Icon name="folder" className="icon icon-sm" /> Create a collection
        </Link>
      </div>
    )
  }

  async function toggle(action: 'add' | 'remove') {
    if (!selected) return
    setBusy(true)
    try {
      const res = await fetch(`/api/collections/${selected}/houses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update that collection')
      setAdded((prev) => (action === 'add' ? [...prev, selected] : prev.filter((id) => id !== selected)))
      setToast(action === 'add' ? 'Added to collection' : 'Removed from collection')
      setTimeout(() => setToast(''), 2200)
    } catch (err) {
      setToast((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const isIn = added.includes(selected)

  return (
    <div className="panel">
      <h3>Collections</h3>
      <p className="panel-sub">Keep this house with the other ones you love.</p>
      <div className="field" style={{ marginTop: 12 }}>
        <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
              {added.includes(c.id) ? ' ✓' : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 10 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => toggle(isIn ? 'remove' : 'add')}
          disabled={busy}
        >
          <Icon name={isIn ? 'check' : 'plus'} className="icon icon-sm" />
          {isIn ? 'In this collection' : 'Add to collection'}
        </button>
      </div>
      {toast ? <span className="toast">{toast}</span> : null}
    </div>
  )
}
