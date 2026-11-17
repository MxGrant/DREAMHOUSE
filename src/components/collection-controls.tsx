'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CollectionRow } from '@/lib/types'
import { Icon } from './icons'

export function CollectionControls({ collection }: { collection: CollectionRow }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [isPublic, setIsPublic] = useState(collection.is_public)

  async function toggle() {
    setBusy(true)
    const next = !isPublic
    setIsPublic(next)
    await fetch(`/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: next }),
    })
    router.refresh()
    setBusy(false)
  }

  async function remove() {
    if (!window.confirm('Delete this collection? The houses stay; only the list goes.')) return
    setBusy(true)
    const res = await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/collections')
      router.refresh()
    } else {
      setBusy(false)
    }
  }

  return (
    <div className="row" style={{ gap: 6 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} disabled={busy}>
        <Icon name={isPublic ? 'lock' : 'globe'} className="icon icon-sm" />
        {isPublic ? 'Make private' : 'Make public'}
      </button>
      <button type="button" className="btn btn-quiet btn-sm" onClick={remove} disabled={busy}>
        <Icon name="trash" className="icon icon-sm" /> Delete
      </button>
    </div>
  )
}

export function RemoveHouseButton({ collectionId, houseId }: { collectionId: string; houseId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)
    await fetch(`/api/collections/${collectionId}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ houseId, action: 'remove' }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <button type="button" className="btn btn-quiet btn-xs" onClick={remove} disabled={busy}>
      <Icon name="x" className="icon icon-sm" /> Remove from collection
    </button>
  )
}
