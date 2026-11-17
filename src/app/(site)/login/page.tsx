import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata = { title: 'Sign in — Dreamhouse' }

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <div className="shell auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">
          <span className="dot" /> Welcome back
        </span>
        <h1 style={{ marginTop: 16 }}>Your houses are exactly where you left them.</h1>
        <p className="muted" style={{ marginTop: 10 }}>
          Sign in to keep planning, restore a saved layout, or share the room you finished last night.
        </p>
        <Suspense fallback={<p className="tiny">Loading…</p>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <div className="auth-aside">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/homes/living-bright.jpg" alt="A bright living room with cane furniture" />
        <div className="auth-aside-inner">
          <h3 style={{ fontSize: '1.35rem' }}>“I planned the whole flat here before buying a single thing.”</h3>
          <p className="tiny" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>
            Sienna Okoro · textile designer, London
          </p>
        </div>
      </div>
    </div>
  )
}
