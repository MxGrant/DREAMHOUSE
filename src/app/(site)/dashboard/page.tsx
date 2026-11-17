import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getCollectionsFor, listHouses, listMoodboards } from '@/lib/data'
import { money } from '@/lib/design'
import { HouseBuilder } from '@/components/house-builder'
import { HouseCard } from '@/components/house-card'
import { ProfileForm } from '@/components/profile-form'
import { CollectionCreator } from '@/components/collection-creator'
import { MoodboardCreator } from '@/components/moodboard-creator'
import { Icon } from '@/components/icons'

export const metadata = { title: 'Dashboard — Dreamhouse' }

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/dashboard')

  const [mine, saved, collections, boards] = await Promise.all([
    listHouses({ viewerId: user.id, authorId: user.id, sort: 'newest' }),
    listHouses({ viewerId: user.id, savedBy: user.id }),
    getCollectionsFor(user.id, user.id),
    listMoodboards(user.id),
  ])
  const myBoards = boards.filter((b) => b.user_id === user.id)
  const rooms = mine.reduce((sum, h) => sum + h.room_count, 0)
  const totalBudget = mine.reduce((sum, h) => sum + h.budget, 0)

  return (
    <div className="shell studio-shell">
      <div className="studio-top">
        <div>
          <span className="eyebrow">
            <span className="dot" /> Your studio
          </span>
          <h1 style={{ marginTop: 12 }}>Good to see you, {user.name.split(' ')[0]}.</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: '56ch' }}>
            {mine.length
              ? `You have ${mine.length} house${mine.length === 1 ? '' : 's'} and ${rooms} room${
                  rooms === 1 ? '' : 's'
                } in progress.`
              : 'Start with one room — everything else follows from there.'}
          </p>
        </div>
        <HouseBuilder />
      </div>

      <div className="stat-cards" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <span>Houses</span>
          <strong>{mine.length}</strong>
        </div>
        <div className="stat-card">
          <span>Rooms planned</span>
          <strong>{rooms}</strong>
        </div>
        <div className="stat-card">
          <span>Saved designs</span>
          <strong>{saved.length}</strong>
        </div>
        <div className="stat-card">
          <span>Furniture budgets</span>
          <strong>{money(totalBudget)}</strong>
        </div>
      </div>

      <section style={{ marginBottom: 40 }}>
        <div className="section-head" style={{ marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>My houses</h2>
            <p className="tiny">Public and private designs, newest first.</p>
          </div>
          <Link href={`/u/${user.handle}`} className="btn btn-ghost btn-sm">
            View public profile
          </Link>
        </div>
        {mine.length ? (
          <div className="card-grid card-grid-3">
            {mine.map((house, i) => (
              <div key={house.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <HouseCard house={house} signedIn showAuthor={false} index={i} />
                <div className="row" style={{ gap: 6 }}>
                  <Link href={`/studio/${house.id}`} className="btn btn-ghost btn-xs">
                    <Icon name="edit" className="icon icon-sm" /> Edit rooms
                  </Link>
                  <Link href={`/houses/${house.id}`} className="btn btn-quiet btn-xs">
                    View house
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Your first house starts here</h3>
            <p>Name it, pick a palette, set a budget — then plan the first room to scale.</p>
            <HouseBuilder trigger="Create my first house" />
          </div>
        )}
      </section>

      <section id="saved" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
        <div className="section-head" style={{ marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Saved designs</h2>
            <p className="tiny">Houses you bookmarked from the community.</p>
          </div>
          <Link href="/explore" className="btn btn-ghost btn-sm">
            Find more
          </Link>
        </div>
        {saved.length ? (
          <div className="card-grid card-grid-3">
            {saved.map((house, i) => (
              <HouseCard key={house.id} house={house} signedIn index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nothing saved yet</h3>
            <p>Tap the bookmark on any design in the community and it will wait for you here.</p>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              Explore designs
            </Link>
          </div>
        )}
      </section>

      <div className="studio-grid" style={{ marginBottom: 40 }}>
        <section id="collections" style={{ scrollMarginTop: 100 }}>
          <div className="section-head" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Collections</h2>
              <p className="tiny">Shareable groups of houses.</p>
            </div>
            <CollectionCreator />
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} className="room-row">
                <div className="mini" style={{ height: 62 }}>
                  {c.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.preview} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div className="room-row-body">
                  <strong>{c.title}</strong>
                  <span>
                    {c.house_count} homes · {c.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <Icon name="chevron-right" className="icon icon-sm" />
              </Link>
            ))}
            {!collections.length ? <p className="tiny">No collections yet — group a few saved houses together.</p> : null}
          </div>
        </section>

        <section>
          <div className="section-head" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Moodboards</h2>
              <p className="tiny">Colours, notes and pieces you keep coming back to.</p>
            </div>
            <MoodboardCreator />
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {myBoards.map((b) => (
              <Link key={b.id} href={`/moodboards/${b.id}`} className="room-row">
                <div className="mini" style={{ height: 62 }}>
                  {b.preview && b.preview.startsWith('/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.preview} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: b.preview ?? 'var(--pink-soft)' }} />
                  )}
                </div>
                <div className="room-row-body">
                  <strong>{b.title}</strong>
                  <span>
                    {b.piece_count} pieces · {b.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <Icon name="chevron-right" className="icon icon-sm" />
              </Link>
            ))}
            {!myBoards.length ? <p className="tiny">No moodboards yet — start with three colours and a note.</p> : null}
          </div>
        </section>
      </div>

      <section id="profile" style={{ scrollMarginTop: 100 }}>
        <div className="studio-grid">
          <ProfileForm
            user={{
              name: user.name,
              handle: user.handle,
              bio: user.bio,
              location: user.location,
              avatar_hue: user.avatar_hue,
            }}
          />
          <div className="panel">
            <h3>Account</h3>
            <p className="panel-sub">{user.email}</p>
            <div className="stack" style={{ gap: 8, marginTop: 14 }}>
              <div className="kv">
                <span>Member since</span>
                <strong>{new Date(user.created_at).getFullYear()}</strong>
              </div>
              <div className="kv">
                <span>Public profile</span>
                <strong>
                  <Link href={`/u/${user.handle}`} className="mini-link">
                    /u/{user.handle}
                  </Link>
                </strong>
              </div>
              <div className="kv">
                <span>Moodboards</span>
                <strong>{myBoards.length}</strong>
              </div>
              <div className="kv">
                <span>Collections</span>
                <strong>{collections.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
