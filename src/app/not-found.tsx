import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(40rem 26rem at 20% 0%, #ffe3ee, transparent 60%), radial-gradient(36rem 24rem at 90% 100%, #e7dffa, transparent 60%), #fdf8f2',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <span className="eyebrow">
          <span className="dot" /> 404
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '18px 0 12px' }}>
          This room is not on the plan.
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>
          The page you are after was moved, made private, or never existed. The community designs are a good place to
          start again.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            Back home
          </Link>
          <Link href="/explore" className="btn btn-ghost">
            Explore designs
          </Link>
        </div>
      </div>
    </div>
  )
}
