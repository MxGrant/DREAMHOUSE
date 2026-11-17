import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getProfile, listHouses } from '@/lib/data'
import { query } from '@/db'
import { Avatar } from '@/components/avatar'
import { HouseCard } from '@/components/house-card'
import { FollowButton } from '@/components/social'
import { Icon } from '@/components/icons'
import { CollectionCreator } from '@/components/collection-creator'
import { MoodboardCreator } from '@/components/moodboard-creator'
import type { CollectionRow, MoodboardRow } from '@/lib/types'

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const viewer = await getCurrentUser()
  const profile = await getProfile(handle, viewer?.id ?? null)
  if (!profile) notFound()

  const isSelf = viewer?.id === profile.id
  const [houses, collections, boards] = await Promise.all([
    listHouses({ authorId: profile.id, viewerId: viewer?.id ?? null, sort: 'newest' }),
    query<CollectionRow & { house_count: number; preview: string | null }>(
      `SELECT c.*,
         (SELECT count(*) FROM collection_houses ch WHERE ch.collection_id = c.id) AS house_count,
         (SELECT h.cover_image FROM collection_houses ch JOIN houses h ON h.id = ch.house_id WHERE ch.collection_id = c.id LIMIT 1) AS preview
       FROM collections c WHERE c.user_id = $1 AND (c.is_public OR $2) ORDER BY c.created_at DESC`,
      [profile.id, isSelf],
    ),
    query<MoodboardRow & { piece_count: number; preview: string | null }>(
      `SELECT m.*,
         (SELECT count(*) FROM moodboard_items mi WHERE mi.moodboard_id = m.id) AS piece_count,
         (SELECT COALESCE(mi.image, mi.color) FROM moodboard_items mi WHERE mi.moodboard_id = m.id AND (mi.image IS NOT NULL OR mi.color IS NOT NULL) ORDER BY mi.sort LIMIT 1) AS preview
       FROM moodboards m WHERE m.user_id = $1 AND (m.is_public OR $2) ORDER BY m.created_at DESC`,
      [profile.id, isSelf],
    ),
  ])

  return (
    <div className="shell">
      <div className="profile-head">
        <Avatar name={profile.name} hue={profile.avatar_hue} size="lg" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="row wrap" style={{ gap: 10 }}>
            <h1>{profile.name}</h1>
            {profile.is_designer ? <span className="badge">Designer</span> : null}
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            @{profile.handle}
            {profile.location ? ` · ${profile.location}` : ''}
          </p>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)', maxWidth: '58ch', fontSize: '0.94rem' }}>
            {profile.bio || 'No bio yet.'}
          </p>
          <div className="profile-stats">
            <div>
              <strong>{profile.house_count}</strong> designs
            </div>
            <div>
              <strong>{profile.follower_count}</strong> followers
            </div>
            <div>
              <strong>{profile.following_count}</strong> following
            </div>
            <div>
              <strong>{collections.length}</strong> collections
            </div>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <FollowButton
            handle={profile.handle}
            initialFollowing={Boolean(profile.following)}
            signedIn={Boolean(viewer)}
            self={isSelf}
          />
          {isSelf ? <MoodboardCreator /> : null}
        </div>
      </div>

      <div className="tabbar">
        <a href="#designs" className="is-active">
          Designs
        </a>
        <a href="#collections">Collections</a>
        <a href="#moodboards">Moodboards</a>
      </div>

      <section id="designs" style={{ marginBottom: 46, scrollMarginTop: 100 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 18 }}>Designs</h2>
        {houses.length ? (
          <div className="card-grid card-grid-3">
            {houses.map((house, i) => (
              <HouseCard key={house.id} house={house} signedIn={Boolean(viewer)} showAuthor={false} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nothing published yet</h3>
            <p>{isSelf ? 'Publish a house to show it here.' : 'This designer has not shared a public house yet.'}</p>
            {isSelf ? <Link href="/dashboard" className="btn btn-ghost btn-sm">Open the studio</Link> : null}
          </div>
        )}
      </section>

      <section id="collections" style={{ marginBottom: 46, scrollMarginTop: 100 }}>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Collections</h2>
            <p className="tiny">{isSelf ? 'Your own groupings of houses.' : 'Public collections by this designer.'}</p>
          </div>
          {isSelf ? <CollectionCreator /> : null}
        </div>
        <div className="card-grid card-grid-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="board-card">
              <div className="house-card-media" style={{ aspectRatio: '16 / 8' }}>
                {c.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.preview} alt={c.title} loading="lazy" />
                ) : null}
              </div>
              <div className="board-body">
                <h3>{c.title}</h3>
                <p className="tiny" style={{ color: 'var(--ink-soft)' }}>
                  {c.house_count} homes · {c.is_public ? 'Public' : 'Private'}
                </p>
              </div>
            </Link>
          ))}
          {!collections.length ? (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <h3>No collections</h3>
              <p>Group saved houses into a collection to tell a story.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section id="moodboards" style={{ marginBottom: 60, scrollMarginTop: 100 }}>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Moodboards</h2>
            <p className="tiny">Palettes, pieces and notes.</p>
          </div>
          {isSelf ? <MoodboardCreator /> : null}
        </div>
        <div className="card-grid card-grid-3">
          {boards.map((b) => (
            <Link key={b.id} href={`/moodboards/${b.id}`} className="board-card">
              <div className="board-mosaic" style={{ gridTemplateRows: 'repeat(2, 96px)' }}>
                <div className="wide">
                  {b.preview && b.preview.startsWith('/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.preview} alt={b.title} loading="lazy" />
                  ) : (
                    <div className="swatch" style={{ background: b.preview ?? 'var(--pink-soft)' }} />
                  )}
                </div>
                <div className="fill">
                  <Icon name="palette" className="icon" />
                </div>
              </div>
              <div className="board-body">
                <h3>{b.title}</h3>
                <p className="tiny" style={{ color: 'var(--ink-soft)' }}>
                  {b.piece_count} pieces
                </p>
              </div>
            </Link>
          ))}
          {!boards.length ? (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <h3>No moodboards yet</h3>
              <p>Start a board with three colours and a photo you love.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
