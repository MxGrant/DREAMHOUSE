'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Icon } from './icons'

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
  return data
}

export function LikeButton({
  houseId,
  initialLiked,
  initialCount,
  signedIn,
  compact = false,
}: {
  houseId: string
  initialLiked: boolean
  initialCount: number
  signedIn: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function toggle() {
    if (!signedIn) {
      router.push(`/login?next=/houses/${houseId}`)
      return
    }
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))
    start(async () => {
      try {
        const data = await post(`/api/houses/${houseId}/like`)
        setLiked(data.liked)
        setCount(data.count)
      } catch (err) {
        setLiked(!nextLiked)
        setCount((c) => c + (nextLiked ? -1 : 1))
        setError((err as Error).message)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        className={`icon-btn ${liked ? 'is-active' : ''}`}
        onClick={toggle}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike this house' : 'Like this house'}
        title={liked ? 'Unlike' : 'Like'}
        disabled={pending && false}
      >
        <Icon name="heart" filled={liked} className="icon icon-sm" />
      </button>
      {!compact ? <span className="tiny">{count} likes</span> : null}
      {error ? <span className="toast">{error}</span> : null}
    </>
  )
}

export function SaveButton({
  houseId,
  initialSaved,
  signedIn,
  label = false,
}: {
  houseId: string
  initialSaved: boolean
  signedIn: boolean
  label?: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function toggle() {
    if (!signedIn) {
      router.push(`/login?next=/houses/${houseId}`)
      return
    }
    const next = !saved
    setSaved(next)
    start(async () => {
      try {
        const data = await post(`/api/houses/${houseId}/save`)
        setSaved(data.saved)
      } catch (err) {
        setSaved(!next)
        setError((err as Error).message)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        className={`icon-btn ${saved ? 'is-active' : ''} ${label ? 'btn btn-ghost btn-sm' : ''}`}
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save this house'}
        title={saved ? 'Saved' : 'Save'}
      >
        <Icon name="bookmark" filled={saved} className="icon icon-sm" />
        {label ? <span>{saved ? 'Saved' : 'Save'}</span> : null}
      </button>
      {error ? <span className="toast">{error}</span> : null}
    </>
  )
}

export function ShareButton({ title, path }: { title?: string; path?: string }) {
  const [toast, setToast] = useState('')
  const [open, setOpen] = useState(false)

  async function share() {
    const url = `${window.location.origin}${path ?? window.location.pathname}`
    try {
      if (navigator.share) {
        await navigator.share({ title: title ?? 'Dreamhouse', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast('Share link copied to clipboard')
    } catch {
      setOpen(true)
      setToast('Copy this link to share')
    }
    setTimeout(() => setToast(''), 2400)
  }

  return (
    <>
      <button type="button" className="icon-btn" onClick={share} aria-label="Share this design" title="Share">
        <Icon name="share" className="icon icon-sm" />
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Share this design</h2>
            <p className="muted">Anyone with the link can view the finished rooms.</p>
            <div className="row" style={{ marginTop: 18 }}>
              <input
                className="input"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}${path ?? window.location.pathname}` : ''}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <span className="toast">{toast}</span> : null}
    </>
  )
}

export function FollowButton({
  handle,
  initialFollowing,
  signedIn,
  self,
}: {
  handle: string
  initialFollowing: boolean
  signedIn: boolean
  self: boolean
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  if (self) {
    return (
      <a className="btn btn-ghost btn-sm" href="/dashboard#profile">
        <Icon name="edit" className="icon icon-sm" /> Edit profile
      </a>
    )
  }

  function toggle() {
    if (!signedIn) {
      router.push(`/login?next=/u/${handle}`)
      return
    }
    const next = !following
    setFollowing(next)
    start(async () => {
      try {
        const data = await post(`/api/users/${handle}/follow`)
        setFollowing(data.following)
      } catch (err) {
        setFollowing(!next)
        setError((err as Error).message)
      }
    })
  }

  return (
    <>
      <button type="button" className={`btn ${following ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={toggle}>
        {following ? <Icon name="check" className="icon icon-sm" /> : <Icon name="plus" className="icon icon-sm" />}
        {following ? 'Following' : 'Follow'}
      </button>
      {error ? <span className="toast">{error}</span> : null}
    </>
  )
}
