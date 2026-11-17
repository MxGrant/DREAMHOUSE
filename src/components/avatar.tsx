import { huePalette } from '@/lib/design'

export function Avatar({
  name,
  hue,
  size = 'md',
  className = '',
}: {
  name: string
  hue: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  const { bg, fg } = huePalette(hue)
  return (
    <span
      className={`avatar avatar-${size} ${className}`}
      style={{ background: `linear-gradient(145deg, ${bg}, ${huePalette(hue + 24).bg})`, color: fg }}
      aria-hidden="true"
    >
      {initials || 'DH'}
    </span>
  )
}
