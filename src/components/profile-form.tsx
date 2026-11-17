'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from './avatar'
import { Icon } from './icons'

export function ProfileForm({
  user,
}: {
  user: { name: string; handle: string; bio: string; location: string; avatar_hue: number }
}) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [handle, setHandle] = useState(user.handle)
  const [bio, setBio] = useState(user.bio)
  const [location, setLocation] = useState(user.location)
  const [hue, setHue] = useState(user.avatar_hue)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, handle, bio, location, avatar_hue: hue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save your profile')
      setMessage('Profile updated')
      router.refresh()
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel stack" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 14 }}>
        <Avatar name={name || user.name} hue={hue} size="lg" />
        <div>
          <h3>Your profile</h3>
          <p className="panel-sub">How the community sees you.</p>
        </div>
      </div>

      <div className="form-grid form-grid-2">
        <div className="field">
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pf-handle">Handle</label>
          <input
            id="pf-handle"
            className="input"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pf-bio">Bio</label>
        <textarea
          id="pf-bio"
          className="textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Interior stylist, collector of small lamps."
          style={{ minHeight: 78 }}
        />
      </div>
      <div className="field">
        <label htmlFor="pf-loc">Location</label>
        <input
          id="pf-loc"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Copenhagen, DK"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-hue">Avatar colour</label>
        <input
          id="pf-hue"
          type="range"
          min={0}
          max={359}
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="range"
        />
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {message ? <div className="save-chip">{message}</div> : null}

      <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
        <Icon name="save" className="icon icon-sm" /> {busy ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
