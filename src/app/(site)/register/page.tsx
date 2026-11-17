import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata = { title: 'Create an account — Dreamhouse' }

export default async function RegisterPage() {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <div className="shell auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">
          <span className="dot" /> Your studio
        </span>
        <h1 style={{ marginTop: 16 }}>A blank room, a catalogue and a very good chair.</h1>
        <p className="muted" style={{ marginTop: 10 }}>
          Create a free account to build houses, save room layouts, collect moodboards and publish designs to the
          community.
        </p>
        <Suspense fallback={<p className="tiny">Loading…</p>}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
      <div className="auth-aside">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/homes/kitchen-marble.jpg" alt="A marble kitchen with oak stools" />
        <div className="auth-aside-inner">
          <h3 style={{ fontSize: '1.35rem' }}>“Measure once, arrange forty times. That is the whole hobby.”</h3>
          <p className="tiny" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>
            Marco Bellini · kitchen designer, Milan
          </p>
        </div>
      </div>
    </div>
  )
}
