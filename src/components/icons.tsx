import type { ReactNode } from 'react'

const P: Record<string, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />,
  heart: <path d="M20.4 4.9a5.2 5.2 0 0 0-7.4 0L12 5.9l-1-1a5.2 5.2 0 0 0-7.4 7.4l1 1L12 21l7.4-7.7 1-1a5.2 5.2 0 0 0 0-7.4Z" />,
  bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />,
  share: <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M12 3v13M8 7l4-4 4 4" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  'arrow-right': <path d="M4 12h16M14 6l6 6-6 6" />,
  'arrow-left': <path d="M20 12H4M10 18l-6-6 6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  undo: <path d="M9 7 4 12l5 5M4 12h9a6 6 0 0 1 6 6" />,
  redo: <path d="m15 7 5 5-5 5M20 12h-9a6 6 0 0 0-6 6" />,
  rotate: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />,
  edit: <path d="M4 20h4l10-10-4-4L4 16v4ZM14 5l3-3 4 4-3 3" />,
  'zoom-in': <><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-3.5-3.5" /></>,
  'zoom-out': <><circle cx="11" cy="11" r="7" /><path d="M8 11h6M20 20l-3.5-3.5" /></>,
  maximize: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" />,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H13a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3-4-5-9-5Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></>,
  cube: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  sparkles: <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.5 6.5 5 5M19 19l-1.5-1.5M17.5 6.5 19 5M5 19l1.5-1.5M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" />,
  sliders: <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h9M17 18h3M14 4v4M8 10v4M13 16v4" />,
  ruler: <path d="M3 15 15 3l6 6L9 21l-6-6ZM8 10l2 2M11 7l2 2M5 13l2 2" />,
  comment: <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12Z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="3.6" /><path d="M2 21c0-3.6 3.2-5.5 7-5.5s7 1.9 7 5.5M17 5.2a3.4 3.4 0 0 1 0 6.6M18.5 15.2c2.1.6 3.5 2.2 3.5 4.8" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></>,
  eye: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  save: <path d="M5 3h11l3 3v15H5V3ZM8 3v6h8V3M8 21v-7h8v7" />,
  'logout': <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  door: <path d="M14 3H6v18h8M14 3l4 2v16l-4-2M10 12h.01" />,
  sofa: <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 12h20v7H2v-7ZM6 19v2M18 19v2" />,
  bed: <path d="M3 18V7M3 12h18v6M21 18v-5a3 3 0 0 0-3-3h-7v2M7 9.5h.01" />,
  plant: <path d="M12 21v-7M12 14c0-4-3-6-6-6 0 4 3 6 6 6ZM12 14c0-4 3-6 6-6 0 4-3 6-6 6ZM12 10c0-3 1.5-5 1.5-7" />,
  lamp: <path d="M8 3h8l3 8H5l3-8ZM12 11v8M8 21h8" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
  'file-text': <path d="M14 3H6v18h13V8l-5-5ZM14 3v5h5M9 13h7M9 17h5" />,
  'arrow-up-right': <path d="M7 17 17 7M9 7h8v8" />,
}

export type IconName = keyof typeof P

export function Icon({
  name,
  className = 'icon',
  filled = false,
}: {
  name: IconName | string
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {P[name] ?? P.info}
    </svg>
  )
}

export function Logo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 10.4 12 3.2l8.5 7.2V20a1.6 1.6 0 0 1-1.6 1.6H5.1A1.6 1.6 0 0 1 3.5 20Z"
        fill="#fffaf3"
        stroke="#2b2333"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.6 21.6v-6.3h4.8v6.3" fill="#ffd9e6" stroke="#2b2333" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="16.6" cy="8.4" r="1.7" fill="#d8f0e3" stroke="#2b2333" strokeWidth="1.5" />
    </svg>
  )
}
