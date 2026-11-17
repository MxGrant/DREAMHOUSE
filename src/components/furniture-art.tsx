import type { ReactNode } from 'react'

export function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.padEnd(6, '0')
  const num = parseInt(full.slice(0, 6), 16)
  let r = (num >> 16) & 255
  let g = (num >> 8) & 255
  let b = num & 255
  if (amount >= 0) {
    r += (255 - r) * amount
    g += (255 - g) * amount
    b += (255 - b) * amount
  } else {
    const k = 1 + amount
    r *= k
    g *= k
    b *= k
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const outline = 'rgba(43,35,51,0.34)'

function Sofa({ color }: { color: string }) {
  return (
    <>
      <rect x="4" y="10" width="112" height="58" rx="15" fill={shade(color, -0.1)} stroke={outline} strokeWidth="1.4" />
      <rect x="10" y="14" width="100" height="20" rx="8" fill={shade(color, 0.06)} />
      <rect x="10" y="32" width="46" height="30" rx="7" fill={shade(color, 0.14)} />
      <rect x="64" y="32" width="46" height="30" rx="7" fill={shade(color, 0.14)} />
      <rect x="2" y="24" width="11" height="38" rx="5.5" fill={shade(color, -0.18)} />
      <rect x="107" y="24" width="11" height="38" rx="5.5" fill={shade(color, -0.18)} />
      <path d="M56 38v18M62 38v18" stroke={outline} strokeWidth="1.2" opacity="0.5" />
    </>
  )
}

function Chair({ color }: { color: string }) {
  return (
    <>
      <path d="M26 34a34 34 0 0 1 68 0v20a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10Z" fill={color} stroke={outline} strokeWidth="1.4" />
      <path d="M30 35a30 30 0 0 1 60 0" fill="none" stroke={shade(color, -0.3)} strokeWidth="5" opacity="0.5" />
      <ellipse cx="60" cy="44" rx="22" ry="14" fill={shade(color, 0.2)} opacity="0.9" />
    </>
  )
}

function Table({ color }: { color: string }) {
  return (
    <>
      <rect x="8" y="16" width="104" height="48" rx="9" fill={shade(color, -0.02)} stroke={outline} strokeWidth="1.4" />
      <rect x="14" y="21" width="92" height="38" rx="6" fill={shade(color, 0.16)} opacity="0.8" />
      <circle cx="20" cy="22" r="2.4" fill={shade(color, -0.25)} />
      <circle cx="100" cy="22" r="2.4" fill={shade(color, -0.25)} />
      <circle cx="20" cy="58" r="2.4" fill={shade(color, -0.25)} />
      <circle cx="100" cy="58" r="2.4" fill={shade(color, -0.25)} />
    </>
  )
}

function Bed({ color }: { color: string }) {
  return (
    <>
      <rect x="18" y="10" width="84" height="66" rx="7" fill={shade(color, 0.04)} stroke={outline} strokeWidth="1.4" />
      <rect x="16" y="4" width="88" height="12" rx="5" fill={shade(color, -0.18)} />
      <rect x="25" y="18" width="30" height="16" rx="7" fill="#fffdf8" opacity="0.9" />
      <rect x="63" y="18" width="30" height="16" rx="7" fill="#fffdf8" opacity="0.9" />
      <rect x="18" y="40" width="84" height="36" rx="6" fill={shade(color, -0.06)} />
      <path d="M18 46h84" stroke={outline} strokeWidth="1.2" opacity="0.4" />
    </>
  )
}

function Wardrobe({ color }: { color: string }) {
  return (
    <>
      <rect x="10" y="12" width="100" height="56" rx="6" fill={color} stroke={outline} strokeWidth="1.4" />
      <path d="M60 12v56" stroke={outline} strokeWidth="1.4" />
      <rect x="50" y="36" width="3" height="12" rx="1.5" fill={shade(color, -0.3)} />
      <rect x="67" y="36" width="3" height="12" rx="1.5" fill={shade(color, -0.3)} />
    </>
  )
}

function Lamp({ color }: { color: string }) {
  return (
    <>
      <circle cx="60" cy="40" r="25" fill={shade(color, 0.18)} stroke={outline} strokeWidth="1.4" />
      <circle cx="60" cy="40" r="14" fill="#fffdf6" opacity="0.65" />
      <circle cx="60" cy="40" r="5" fill={shade(color, -0.18)} />
      <path d="M60 15v-6M35 40h-6M85 40h6M60 65v6" stroke={shade(color, -0.2)} strokeWidth="2" opacity="0.5" />
    </>
  )
}

function Rug({ color }: { color: string }) {
  return (
    <>
      <rect x="2" y="4" width="116" height="72" rx="3" fill={color} opacity="0.95" />
      <rect x="9" y="11" width="102" height="58" rx="2" fill="none" stroke={shade(color, -0.16)} strokeWidth="0.9" opacity="0.55" />
      <g opacity="0.3">
        {[20, 30, 40, 50, 60].map((y) => (
          <line key={y} x1="12" y1={y} x2="108" y2={y} stroke={shade(color, -0.25)} strokeWidth="0.7" strokeDasharray="3 5" />
        ))}
      </g>
    </>
  )
}

function Plant({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="60" cy="44" rx="30" ry="30" fill={shade(color, -0.12)} opacity="0.4" />
      <ellipse cx="45" cy="34" rx="17" ry="10" fill={color} transform="rotate(-32 45 34)" />
      <ellipse cx="76" cy="30" rx="18" ry="10" fill={shade(color, 0.1)} transform="rotate(28 76 30)" />
      <ellipse cx="50" cy="54" rx="16" ry="9" fill={shade(color, -0.08)} transform="rotate(24 50 54)" />
      <ellipse cx="76" cy="52" rx="15" ry="9" fill={shade(color, 0.18)} transform="rotate(-26 76 52)" />
      <circle cx="60" cy="43" r="9" fill={shade(color, -0.18)} />
      <circle cx="60" cy="66" r="13" fill={shade(color, -0.35)} stroke={outline} strokeWidth="1.2" opacity="0.85" />
    </>
  )
}

function Decor({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="38" cy="44" rx="15" ry="22" fill={shade(color, 0.12)} stroke={outline} strokeWidth="1.2" />
      <ellipse cx="38" cy="25" rx="6" ry="5" fill={shade(color, -0.12)} />
      <ellipse cx="66" cy="48" rx="11" ry="16" fill={shade(color, -0.06)} stroke={outline} strokeWidth="1.2" />
      <ellipse cx="66" cy="35" rx="4.5" ry="3.8" fill={shade(color, -0.12)} />
      <circle cx="90" cy="52" r="11" fill={shade(color, 0.22)} stroke={outline} strokeWidth="1.2" />
      <path d="M84 52h12" stroke={outline} strokeWidth="1" opacity="0.4" />
    </>
  )
}

function Kitchen({ color }: { color: string }) {
  return (
    <>
      <rect x="4" y="14" width="112" height="52" rx="5" fill={color} stroke={outline} strokeWidth="1.4" />
      <rect x="10" y="19" width="100" height="20" rx="3" fill={shade(color, 0.22)} opacity="0.85" />
      <rect x="18" y="24" width="24" height="12" rx="3" fill={shade(color, -0.18)} />
      <circle cx="23" cy="29" r="1.6" fill="#fff" opacity="0.7" />
      <circle cx="61" cy="30" r="5" fill="none" stroke={shade(color, -0.25)} strokeWidth="1.6" />
      <circle cx="84" cy="27" r="3.4" fill={shade(color, -0.22)} />
      <circle cx="94" cy="27" r="3.4" fill={shade(color, -0.22)} />
      <circle cx="84" cy="35" r="3.4" fill={shade(color, -0.22)} />
      <circle cx="94" cy="35" r="3.4" fill={shade(color, -0.22)} />
      <path d="M32 44h56" stroke={shade(color, -0.2)} strokeWidth="1.2" opacity="0.5" />
    </>
  )
}

function Desk({ color }: { color: string }) {
  return (
    <>
      <rect x="8" y="18" width="104" height="44" rx="7" fill={shade(color, 0.04)} stroke={outline} strokeWidth="1.4" />
      <rect x="14" y="23" width="92" height="30" rx="4" fill={shade(color, 0.2)} opacity="0.7" />
      <rect x="72" y="27" width="26" height="16" rx="2" fill="#fffdf6" opacity="0.85" />
      <path d="M76 32h18M76 37h13" stroke={outline} strokeWidth="1.1" opacity="0.5" />
      <circle cx="28" cy="33" r="4" fill={shade(color, -0.25)} />
    </>
  )
}

const SHAPES: Record<string, (p: { color: string }) => ReactNode> = {
  sofa: Sofa,
  chair: Chair,
  table: Table,
  bed: Bed,
  wardrobe: Wardrobe,
  lamp: Lamp,
  rug: Rug,
  plant: Plant,
  decor: Decor,
  kitchen: Kitchen,
  desk: Desk,
}

export function FurnitureArt({
  category,
  color,
  className,
  title,
}: {
  category: string
  color: string
  className?: string
  title?: string
}) {
  const Shape = SHAPES[category] ?? Table
  return (
    <svg viewBox="0 0 120 80" className={className} preserveAspectRatio="none" role="img" aria-label={title ?? category}>
      {title ? <title>{title}</title> : null}
      <Shape color={color || '#E7DCCD'} />
    </svg>
  )
}
