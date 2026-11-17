'use client'

import { useState } from 'react'
import type { LayoutItem, RoomRow } from '@/lib/types'
import { Room3D } from './room3d'
import { RoomPlan } from './room-plan'
import { Icon } from './icons'

export function RoomViewer({
  room,
  items,
}: {
  room: RoomRow
  items: LayoutItem[]
}) {
  const [mode, setMode] = useState<'2d' | '3d'>('3d')

  return (
    <div>
      <div className="row wrap" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="pill-toggle">
          <button type="button" className={mode === '2d' ? 'is-active' : ''} onClick={() => setMode('2d')}>
            <Icon name="grid" className="icon icon-sm" /> Plan
          </button>
          <button type="button" className={mode === '3d' ? 'is-active' : ''} onClick={() => setMode('3d')}>
            <Icon name="cube" className="icon icon-sm" /> 3D room
          </button>
        </div>
        <span className="tiny">
          {room.width_cm}×{room.length_cm} cm · {((room.width_cm * room.length_cm) / 10000).toFixed(1)} m²
        </span>
      </div>

      {mode === '3d' ? (
        <div
          className="preview-modal-inner"
          style={{ width: '100%', aspectRatio: '4 / 3', maxHeight: 'min(560px, 64vh)', borderRadius: 24, boxShadow: 'var(--shadow)' }}
        >
          <Room3D
            room={{
              width_cm: room.width_cm,
              length_cm: room.length_cm,
              wall_color: room.wall_color,
              floor_color: room.floor_color,
            }}
            items={items}
          />
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'var(--cream-deep)',
            aspectRatio: '4 / 3',
          }}
        >
          <RoomPlan room={room} items={items} showLabel />
        </div>
      )}
    </div>
  )
}
