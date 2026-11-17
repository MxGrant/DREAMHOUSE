import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getDesigners, getFurniture, getMoodboard, getStats, listHouses, listMoodboards } from '@/lib/data'
import { THEMES, money, styleLabel } from '@/lib/design'
import { Avatar } from '@/components/avatar'
import { HouseCard } from '@/components/house-card'
import { MoodboardCard } from '@/components/moodboard-card'
import { FurnitureArt } from '@/components/furniture-art'
import { Icon } from '@/components/icons'

export default async function HomePage() {
  const user = await getCurrentUser()
  const [houses, stats, pieces, designers, boardList] = await Promise.all([
    listHouses({ viewerId: user?.id ?? null, limit: 6, sort: 'trending' }),
    getStats(),
    getFurniture({ sort: 'popularity' }),
    getDesigners(3),
    listMoodboards(user?.id ?? null),
  ])
  const boards = await Promise.all(boardList.slice(0, 3).map((b) => getMoodboard(b.id, user?.id ?? null)))
  const featuredPieces = pieces.slice(0, 8)

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> Interior design, softly done
            </span>
            <h1>
              Design the home you keep <em>dreaming</em> about.
            </h1>
            <p className="lede">
              Draw rooms to the centimetre, furnish them from a catalogue of {stats.pieces} real pieces, then walk
              through the finished space in 3D. Save every version and share the one you love.
            </p>
            <div className="hero-actions">
              <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary">
                <Icon name="plus" className="icon" /> Start a house
              </Link>
              <Link href="/explore" className="btn btn-ghost">
                Explore designs <Icon name="arrow-right" className="icon" />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                {designers.map((d) => (
                  <Avatar key={d.id} name={d.name} hue={d.avatar_hue} size="md" />
                ))}
              </div>
              <p>
                <strong>{stats.houses} homes</strong> planned in Dreamhouse
                <br />
                {stats.rooms} rooms measured, furnished and shared.
              </p>
            </div>
          </div>

          <div className="hero-art">
            <figure className="hero-photo hero-photo--main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/homes/living-linen.jpg" alt="A soft cream living room with a mustard reading chair" />
            </figure>
            <figure className="hero-photo hero-photo--tall">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/homes/bedroom-boucle.jpg" alt="A bedroom with a bouclé bed and striped cushions" />
            </figure>
            <div className="hero-float hero-float--a">
              <strong>Blush Atelier</strong>
              A palette saved to your house
              <div className="hero-swatches">
                {THEMES[0].swatches.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="hero-float hero-float--b">
              <strong>2D → 3D</strong>
              Live preview
              <div className="row" style={{ gap: 4, marginTop: 6 }}>
                <span className="badge badge-lav" style={{ fontSize: '0.62rem' }}>
                  Drag &amp; drop
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="shell">
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...Array(2)].map((_, dup) => (
                <span key={dup}>
                  {styleLabel('scandinavian')} <i />
                  {styleLabel('japandi')} <i />
                  {styleLabel('boho')} <i />
                  {styleLabel('mid-century')} <i />
                  {styleLabel('modern')} <i />
                  {styleLabel('vintage')} <i />
                  {styleLabel('minimalist')} <i />
                  {styleLabel('eclectic')} <i />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <span className="dot" /> The studio
              </span>
              <h2>Everything you need to make a room feel finished.</h2>
            </div>
            <p>
              Start from a blank room or a sample house. Every measurement is real, every price is honest, and every
              version you save stays until you delete it.
            </p>
          </div>
          <div className="step-grid">
            <div className="step-card" style={{ ['--tint' as string]: 'var(--pink-soft)' }}>
              <span className="step-num">01 · BUILD</span>
              <h3>Rooms to scale</h3>
              <p>
                Set width and length in centimetres, choose wall colour and flooring, then pick a theme for the whole
                house.
              </p>
              <div className="step-icon">
                <Icon name="ruler" className="icon icon-lg" />
              </div>
            </div>
            <div className="step-card" style={{ ['--tint' as string]: 'var(--lavender-soft)' }}>
              <span className="step-num">02 · PLAN</span>
              <h3>Drag, rotate, arrange</h3>
              <p>
                Move and resize furniture with collision detection and real wall boundaries. Zoom, pan, undo — it all
                autosaves.
              </p>
              <div className="step-icon">
                <Icon name="sofa" className="icon icon-lg" />
              </div>
            </div>
            <div className="step-card" style={{ ['--tint' as string]: 'var(--mint-soft)' }}>
              <span className="step-num">03 · WALK IT</span>
              <h3>Preview in 3D</h3>
              <p>
                Switch to an interactive 3D view of the same layout — orbit the room, check the scale, then share the
                link.
              </p>
              <div className="step-icon">
                <Icon name="cube" className="icon icon-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <span className="dot" /> Community designs
              </span>
              <h2>Homes worth saving for later.</h2>
            </div>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              Browse all designs <Icon name="arrow-right" className="icon icon-sm" />
            </Link>
          </div>
          <div className="card-grid card-grid-3">
            {houses.map((house, i) => (
              <HouseCard key={house.id} house={house} signedIn={Boolean(user)} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split">
          <div className="split-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/homes/living-penthouse.jpg" alt="A penthouse living room arranged around a large window" />
          </div>
          <div>
            <span className="eyebrow">
              <span className="dot" /> The planner
            </span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)', marginTop: 14 }}>
              A proper floor plan, not a Pinterest board.
            </h2>
            <p className="lede" style={{ marginTop: 14 }}>
              Bring your real measurements. Dreamhouse keeps furniture inside the walls, tells you when two pieces
              collide, and shows the budget before you fall in love with a sofa.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>Collision &amp; boundary checks</strong>
                  <span>Furniture stops at the walls; overlapping pieces are flagged before you drop them.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>Autosave + named versions</strong>
                  <span>Refresh without losing a thing. Save “hosting layout” beside “everyday layout”.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>One layout, two views</strong>
                  <span>Every 2D plan becomes a 3D room you can orbit and inspect.</span>
                </div>
              </div>
            </div>
            <div className="row wrap" style={{ marginTop: 26 }}>
              <Link href={user ? '/dashboard' : '/register'} className="btn btn-rose">
                Open the studio
              </Link>
              <Link href="/explore" className="btn btn-quiet">
                See a finished plan →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <span className="dot" /> The catalogue
              </span>
              <h2>{stats.pieces} pieces, priced and measured.</h2>
            </div>
            <Link href="/catalogue" className="btn btn-ghost btn-sm">
              Shop the catalogue <Icon name="arrow-right" className="icon icon-sm" />
            </Link>
          </div>
          <div className="furniture-grid">
            {featuredPieces.map((piece) => (
              <Link href={`/catalogue?search=${encodeURIComponent(piece.name)}`} key={piece.id} className="furniture-tile">
                <div className="furniture-tile-art" style={{ ['--tint' as string]: `${piece.color}44` }}>
                  <FurnitureArt category={piece.category} color={piece.color} title={piece.name} />
                </div>
                <div className="furniture-tile-body">
                  <h4>{piece.name}</h4>
                  <span className="tiny">
                    {piece.material} · {piece.width}×{piece.depth} cm
                  </span>
                  <div className="furniture-tile-foot">
                    <span className="price">{money(piece.price)}</span>
                    <span className="badge" style={{ fontSize: '0.62rem' }}>
                      {piece.style.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-band">
            <div className="split" style={{ alignItems: 'center' }}>
              <div>
                <span className="eyebrow">
                  <span className="dot" /> AI design assistant
                </span>
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', marginTop: 14 }}>
                  Stuck on the palette? Ask for a scheme.
                </h2>
                <p className="lede" style={{ marginTop: 14 }}>
                  Describe the room and the budget. The assistant returns a full palette, a furniture combination that
                  fits the money, and the small rules that make a room read as designed.
                </p>
                <div className="row wrap" style={{ marginTop: 22 }}>
                  <Link href="/ai" className="btn btn-primary">
                    <Icon name="sparkles" className="icon" /> Try the stylist
                  </Link>
                  <Link href="/moodboards" className="btn btn-quiet">
                    See moodboards →
                  </Link>
                </div>
              </div>
              <div className="ai-palette" style={{ justifyContent: 'flex-end' }}>
                {THEMES[2].swatches.map((hex, i) => (
                  <div
                    key={hex}
                    className="ai-swatch"
                    style={{
                      background: hex,
                      minHeight: 118 - i * 8,
                      color: i > 2 ? '#fff' : 'var(--ink)',
                      flex: '1 1 32%',
                    }}
                  >
                    {['Wall', 'Linen', 'Accent', 'Oak', 'Deep'][i]}
                    <small style={{ fontWeight: 500, opacity: 0.7 }}>{hex}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <span className="dot" /> Moodboards
              </span>
              <h2>Collect the feeling before the furniture.</h2>
            </div>
            <Link href="/moodboards" className="btn btn-ghost btn-sm">
              All moodboards <Icon name="arrow-right" className="icon icon-sm" />
            </Link>
          </div>
          <div className="card-grid card-grid-3">
            {boards.map((entry, i) =>
              entry ? (
                <MoodboardCard
                  key={entry.board.id}
                  board={entry.board}
                  items={entry.items}
                  author={entry.board.author_name}
                  index={i}
                />
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                <span className="dot" /> Designers
              </span>
              <h2>The people behind the pastel.</h2>
            </div>
          </div>
          <div className="card-grid card-grid-3">
            {designers.map((d) => (
              <Link href={`/u/${d.handle}`} key={d.id} className="panel" style={{ display: 'flex', gap: 16 }}>
                <Avatar name={d.name} hue={d.avatar_hue} size="lg" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{d.name}</h3>
                  <p className="tiny" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                    @{d.handle} · {d.location}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
                    {d.bio}
                  </p>
                  <div className="row" style={{ gap: 14, marginTop: 10 }}>
                    <span className="tiny">{d.house_count} designs</span>
                    <span className="tiny">{d.follower_count} followers</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-band cta-band">
            <span className="eyebrow">
              <span className="dot" /> Your blank room is waiting
            </span>
            <h2>
              Start with one room. End with a whole <em>home</em>.
            </h2>
            <p>
              Create an account to save houses, rooms and moodboards — or explore the sample homes first and see how a
              finished plan looks.
            </p>
            <div className="cta-actions">
              <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary">
                Create your first house
              </Link>
              <Link href="/explore" className="btn btn-ghost">
                Explore the community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
