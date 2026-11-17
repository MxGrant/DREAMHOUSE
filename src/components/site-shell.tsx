import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { HeaderClient } from './header-client'
import { Logo } from './icons'

export async function SiteHeader() {
  const user = await getCurrentUser()
  return (
    <HeaderClient
      user={user ? { name: user.name, handle: user.handle, avatar_hue: user.avatar_hue } : null}
    />
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-inner">
          <div className="footer-col footer-brand">
            <Link href="/" className="logo">
              <span className="logo-mark">
                <Logo />
              </span>
              dreamhouse
            </Link>
            <p>
              A quiet place to plan loud ideas. Rooms to scale, furniture you can afford, and a community that
              likes a good before-and-after.
            </p>
          </div>
          <div className="footer-col">
            <h4>Studio</h4>
            <Link href="/dashboard">My houses</Link>
            <Link href="/studio">Build a room</Link>
            <Link href="/catalogue">Furniture catalogue</Link>
            <Link href="/ai">AI design assistant</Link>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <Link href="/explore">Explore designs</Link>
            <Link href="/moodboards">Moodboards</Link>
            <Link href="/u/amelia">Designers</Link>
            <Link href="/collections">Collections</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Create an account</Link>
            <Link href="/dashboard">Saved designs</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Dreamhouse Studio. Sample content for demonstration.</span>
          <span>Made with soft colours and careful measurement.</span>
        </div>
      </div>
    </footer>
  )
}
