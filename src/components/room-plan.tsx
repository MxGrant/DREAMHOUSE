import type { LayoutItem, RoomRow } from '@/lib/types'
import { shade } from './furniture-art'

export function RoomPlan({
  room,
  items,
  className,
  showLabel = false,
}: {
  room: Pick<RoomRow, 'width_cm' | 'length_cm' | 'floor_color' | 'wall_color'>
  items: LayoutItem[]
  className?: string
  showLabel?: boolean
}) {
  const w = room.width_cm
  const l = room.length_cm
  const pad = Math.round(Math.max(w, l) * 0.035)
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${l + pad * 2}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Room plan preview"
    >
      <rect x="0" y="0" width={w} height={l} fill={room.floor_color} />
      <g opacity="0.28">
        {Array.from({ length: Math.floor(w / 60) }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={(i + 1) * 60}
            y1="0"
            x2={(i + 1) * 60}
            y2={l}
            stroke="#2b2333"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {Array.from({ length: Math.floor(l / 60) }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={(i + 1) * 60}
            x2={w}
            y2={(i + 1) * 60}
            stroke="#2b2333"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <rect
        x="1"
        y="1"
        width={w - 2}
        height={l - 2}
        fill="none"
        stroke="#2b2333"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
      {items.map((it) => (
        <g key={it.id} transform={`rotate(${it.rotation} ${it.x} ${it.y})`}>
          <rect
            x={it.x - it.w / 2}
            y={it.y - it.d / 2}
            width={it.w}
            height={it.d}
            rx={Math.min(8, it.w * 0.08)}
            fill={it.color}
            fillOpacity={it.category === 'rug' ? 0.85 : 1}
            stroke={shade(it.color, -0.3)}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity={it.category === 'rug' ? 0.85 : 1}
          />
        </g>
      ))}
      {showLabel ? (
        <text
          x={w / 2}
          y={l - 12}
          textAnchor="middle"
          fontSize="11"
          fill="#2b2333"
          opacity="0.35"
          fontFamily="var(--font-body, sans-serif)"
          letterSpacing="3"
        >
          {Math.round(w / 100)}.{String(w % 100).padStart(2, '0')} × {Math.round(l / 100)}.
          {String(l % 100).padStart(2, '0')} M
        </text>
      ) : null}
    </svg>
  )
}
