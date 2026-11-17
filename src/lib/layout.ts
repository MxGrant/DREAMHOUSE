import type { LayoutItem } from './types'

export const ROOM_MIN = 180
export const ROOM_MAX = 1200

export function cornersOf(item: LayoutItem) {
  const rad = (item.rotation * Math.PI) / 180
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  const hw = item.w / 2
  const hd = item.d / 2
  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ].map(([px, py]) => ({ x: item.x + px * c - py * s, y: item.y + px * s + py * c }))
}

function project(points: { x: number; y: number }[], axis: { x: number; y: number }) {
  let min = Infinity
  let max = -Infinity
  for (const p of points) {
    const value = p.x * axis.x + p.y * axis.y
    min = Math.min(min, value)
    max = Math.max(max, value)
  }
  return { min, max }
}

export function obbOverlap(a: LayoutItem, b: LayoutItem): boolean {
  const pa = cornersOf(a)
  const pb = cornersOf(b)
  const axes = [
    { x: pa[1].x - pa[0].x, y: pa[1].y - pa[0].y },
    { x: pa[3].x - pa[0].x, y: pa[3].y - pa[0].y },
    { x: pb[1].x - pb[0].x, y: pb[1].y - pb[0].y },
    { x: pb[3].x - pb[0].x, y: pb[3].y - pb[0].y },
  ]
  for (const axis of axes) {
    const len = Math.hypot(axis.x, axis.y)
    if (len < 0.001) continue
    const norm = { x: axis.x / len, y: axis.y / len }
    const ra = project(pa, norm)
    const rb = project(pb, norm)
    const tolerance = 1.5
    if (ra.max - tolerance <= rb.min || rb.max - tolerance <= ra.min) return false
  }
  return true
}

export function isInsideRoom(item: LayoutItem, roomW: number, roomL: number): boolean {
  return cornersOf(item).every(
    (p) => p.x >= -0.5 && p.y >= -0.5 && p.x <= roomW + 0.5 && p.y <= roomL + 0.5,
  )
}

export function collidesWith(item: LayoutItem, others: LayoutItem[]): string[] {
  if (item.category === 'rug') return []
  return others
    .filter((o) => o.id !== item.id && o.category !== 'rug')
    .filter((o) => obbOverlap(item, o))
    .map((o) => o.id)
}

export function validateItem(item: LayoutItem, others: LayoutItem[], roomW: number, roomL: number) {
  const outside = !isInsideRoom(item, roomW, roomL)
  const collisions = collidesWith(item, others)
  return { ok: !outside && collisions.length === 0, outside, collisions }
}

export function findFreeSpot(
  items: LayoutItem[],
  roomW: number,
  roomL: number,
  w: number,
  d: number,
  category: string,
): { x: number; y: number } {
  const base: LayoutItem = {
    id: '__probe__',
    furnitureId: '',
    name: 'probe',
    category,
    x: 0,
    y: 0,
    w,
    d,
    h: 0,
    rotation: 0,
    color: '',
    price: 0,
  }
  const step = 24
  const candidates: { x: number; y: number; dist: number }[] = []
  for (let y = Math.min(d / 2 + 14, roomL / 2); y <= roomL - d / 2 - 8; y += step) {
    for (let x = Math.min(w / 2 + 14, roomW / 2); x <= roomW - w / 2 - 8; x += step) {
      candidates.push({ x, y, dist: Math.hypot(x - roomW / 2, y - roomL / 2) })
    }
  }
  candidates.sort((a, b) => a.dist - b.dist)
  for (const c of candidates) {
    const probe = { ...base, x: c.x, y: c.y }
    if (validateItem(probe, items, roomW, roomL).ok) return { x: Math.round(c.x), y: Math.round(c.y) }
  }
  return { x: Math.round(roomW / 2), y: Math.round(roomL / 2) }
}

export function sanitizeItems(raw: unknown, limit = 160): LayoutItem[] {
  if (!Array.isArray(raw)) return []
  const out: LayoutItem[] = []
  for (const candidate of raw.slice(0, limit)) {
    if (!candidate || typeof candidate !== 'object') continue
    const it = candidate as Record<string, unknown>
    const num = (v: unknown, fallback: number, min: number, max: number) => {
      const n = Number(v)
      if (!Number.isFinite(n)) return fallback
      return Math.min(max, Math.max(min, n))
    }
    const id = typeof it.id === 'string' && it.id ? it.id.slice(0, 64) : crypto.randomUUID()
    const category = typeof it.category === 'string' ? it.category.slice(0, 24) : 'decor'
    out.push({
      id,
      furnitureId: typeof it.furnitureId === 'string' ? it.furnitureId.slice(0, 64) : '',
      name: typeof it.name === 'string' ? it.name.slice(0, 90) : 'Furniture',
      category,
      x: Math.round(num(it.x, 0, -200, 3000)),
      y: Math.round(num(it.y, 0, -200, 3000)),
      w: Math.round(num(it.w, 80, 12, 600)),
      d: Math.round(num(it.d, 60, 12, 600)),
      h: Math.round(num(it.h, 70, 2, 300)),
      rotation: Math.round(num(it.rotation, 0, -360, 360)),
      color: typeof it.color === 'string' ? it.color.slice(0, 24) : '#E7DCCD',
      price: Math.round(num(it.price, 0, 0, 100000)),
    })
  }
  return out
}
