'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Icon } from './icons'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(payload: Record<string, string>) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      router.push(next)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(mode === 'register' ? { name, email, password } : { email, password })
        }}
      >
        {mode === 'register' ? (
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              className="input"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amelia Laurent"
              required
            />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
            required
          />
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'One moment…' : mode === 'register' ? 'Create my studio' : 'Sign in'}
          {!busy ? <Icon name="arrow-right" className="icon icon-sm" /> : null}
        </button>

        {mode === 'login' ? (
          <button
            type="button"
            className="btn btn-ghost btn-block"
            disabled={busy}
            onClick={() => submit({ email: 'demo@dreamhouse.studio', password: 'demo1234' })}
          >
            <Icon name="sparkles" className="icon icon-sm" /> Enter the demo studio
          </button>
        ) : null}
      </form>

      {mode === 'login' ? (
        <>
          <div className="demo-hint">
            <strong>Demo account:</strong> demo@dreamhouse.studio / demo1234 — four houses, saved designs and
            moodboards already inside.
          </div>
          <p className="form-note" style={{ marginTop: 18 }}>
            New here? <Link href="/register" style={{ color: 'var(--rose)', fontWeight: 700 }}>Create an account</Link>
          </p>
        </>
      ) : (
        <p className="form-note" style={{ marginTop: 18 }}>
          Already designing?{' '}
          <Link href="/login" style={{ color: 'var(--rose)', fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      )}
    </>
  )
}
