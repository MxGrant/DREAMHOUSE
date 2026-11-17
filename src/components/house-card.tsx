import Link from 'next/link'
import type { HouseCardData } from '@/lib/types'
import { money, roomTypeLabel } from '@/lib/design'
import { Avatar } from './avatar'
import { Icon } from './icons'
import { LikeButton, SaveButton } from './social'

export function HouseCard({
  house,
  signedIn,
  showAuthor = true,
  index = 0,
}: {
  house: HouseCardData
  signedIn: boolean
  showAuthor?: boolean
  index?: number
}) {
  return (
    <article className="house-card" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <div className="house-card-media">
        <Link href={`/houses/${house.id}`} aria-label={house.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={house.cover_image} alt={house.name} loading="lazy" />
        </Link>
        <div className="house-card-top">
          <span className="badge">
            {house.room_count} room{house.room_count === 1 ? '' : 's'}
          </span>
          <div className="house-card-actions">
            <LikeButton
              houseId={house.id}
              initialLiked={Boolean(house.liked)}
              initialCount={house.like_count}
              signedIn={signedIn}
              compact
            />
            <SaveButton houseId={house.id} initialSaved={Boolean(house.saved)} signedIn={signedIn} />
          </div>
        </div>
        <div className="house-card-meta">
          {!house.is_public ? (
            <span className="chip" style={{ height: 24, fontSize: '0.68rem' }}>
              <Icon name="lock" className="icon icon-sm" /> Private
            </span>
          ) : null}
          <span>{money(house.budget)} budget</span>
        </div>
      </div>
      <div className="house-card-body">
        <h3>
          <Link href={`/houses/${house.id}`}>{house.name}</Link>
        </h3>
        {showAuthor ? (
          <Link href={`/u/${house.author_handle}`} className="tiny" style={{ color: 'var(--ink-soft)' }}>
            <Avatar name={house.author_name} hue={house.author_hue} size="sm" /> by {house.author_name}
          </Link>
        ) : null}
        <div className="tiny" style={{ color: 'var(--ink-faint)' }}>
          {(house.room_types ?? []).slice(0, 3).map((t) => roomTypeLabel(t)).join(' · ') || 'Empty house'}
        </div>
        <div className="house-card-foot">
          <span className="stat-inline">
            <Icon name="heart" className="icon icon-sm" /> {house.like_count}
          </span>
          <span className="stat-inline">
            <Icon name="bookmark" className="icon icon-sm" /> {house.save_count}
          </span>
          <span className="chip" style={{ height: 26, fontSize: '0.7rem', marginLeft: 'auto' }}>
            {house.style.replace('-', ' ')}
          </span>
        </div>
      </div>
    </article>
  )
}
