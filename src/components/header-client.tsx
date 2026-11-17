'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Avatar } from './avatar'
import { Icon, Logo } from './icons'

type HeaderUser = { name: string; handle: string; avatar_hue: number }

const NAV = [
  { href: '/explore', label: 'Explore' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/moodboards', label: 'Moodboards' },
  { href: '/ai', label: 'AI Stylist' },
]

export function HeaderClient({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    router.prefetch('/dashboard')
  }, [router])

  async function logout() {
    setBusy(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
    setBusy(false)
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="logo" aria-label="Dreamhouse home">
          <span className="logo-mark">
            <Logo />
          </span>
          dreamhouse
        </Link>

        <nav className="main-nav" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} className={active ? 'is-active' : ''}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                <Icon name="plus" className="icon icon-sm" />
                <span className="long">New house</span>
              </Link>
              <div className="user-menu">
                <button type="button" className="avatar-link" aria-haspopup="menu">
                  <Avatar name={user.name} hue={user.avatar_hue} size="md" />
                </button>
                <div className="user-menu-panel" role="menu">
                  <div className="user-menu-head">
                    <strong>{user.name}</strong>
                    <span>@{user.handle}</span>
                  </div>
                  <Link href="/dashboard" role="menuitem">
                    <Icon name="grid" className="icon icon-sm" /> Dashboard
                  </Link>
                  <Link href={`/u/${user.handle}`} role="menuitem">
                    <Icon name="user" className="icon icon-sm" /> My profile
                  </Link>
                  <Link href="/dashboard#saved" role="menuitem">
                    <Icon name="bookmark" className="icon icon-sm" /> Saved designs
                  </Link>
                  <Link href="/moodboards" role="menuitem">
                    <Icon name="palette" className="icon icon-sm" /> Moodboards
                  </Link>
                  <button type="button" onClick={logout} disabled={busy} role="menuitem">
                    <Icon name="logout" className="icon icon-sm" /> {busy ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-quiet btn-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Start designing
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
