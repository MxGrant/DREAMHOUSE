'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from './icons'

export function CommentForm({ houseId, signedIn }: { houseId: string; signedIn: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!signedIn) {
    return (
      <div className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="tiny">
          <Icon name="comment" className="icon icon-sm" /> Sign in to leave a note.
        </span>
        <a className="btn btn-ghost btn-sm" href={`/login?next=/houses/${houseId}`}>
          Sign in
        </a>
      </div>
    )
  }

  return (
    <form
      className="panel"
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      onSubmit={async (e) => {
        e.preventDefault()
        if (value.trim().length < 2) return
        setBusy(true)
        setError('')
        try {
          const res = await fetch(`/api/houses/${houseId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: value }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error ?? 'Could not post that')
          setValue('')
          router.refresh()
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      <textarea
        className="textarea"
        placeholder="Tell the designer what works…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={800}
        style={{ minHeight: 76 }}
      />
      {error ? <div className="form-error">{error}</div> : null}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="tiny">{value.length}/800</span>
        <button className="btn btn-primary btn-sm" type="submit" disabled={busy || value.trim().length < 2}>
          {busy ? 'Posting…' : 'Post note'}
        </button>
      </div>
    </form>
  )
}
