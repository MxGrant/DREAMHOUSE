export type ThemeToken = {
  id: string
  name: string
  tagline: string
  wall: string
  floorType: string
  floor: string
  accent: string
  tint: string
  swatches: string[]
}

export const THEMES: ThemeToken[] = [
  {
    id: 'blush',
    name: 'Blush Atelier',
    tagline: 'Powder pink, warm oak and a whisper of brass.',
    wall: '#FFF0F4',
    floorType: 'oak',
    floor: '#E3C3A1',
    accent: '#E489A6',
    tint: '#FFE3EC',
    swatches: ['#FFF0F4', '#F8C9D9', '#E489A6', '#F0DCC6', '#C9A78A'],
  },
  {
    id: 'lavender',
    name: 'Lavender Haze',
    tagline: 'Lilac light, soft grey linen and quiet mornings.',
    wall: '#F4EFFF',
    floorType: 'washed',
    floor: '#E6D8C8',
    accent: '#A48CDB',
    tint: '#EBE3FF',
    swatches: ['#F4EFFF', '#D9CBF4', '#A48CDB', '#EDE3D6', '#B5A593'],
  },
  {
    id: 'mint',
    name: 'Mint Julep',
    tagline: 'Fresh mint, pale travertine and plenty of green.',
    wall: '#EDF9F2',
    floorType: 'oak',
    floor: '#DCC6A9',
    accent: '#7FC7A4',
    tint: '#DDF3E7',
    swatches: ['#EDF9F2', '#C6E9D7', '#7FC7A4', '#E8DBC5', '#9AA98F'],
  },
  {
    id: 'peach',
    name: 'Peach Sorbet',
    tagline: 'Sun-warmed apricot with creamy plaster walls.',
    wall: '#FFF2E8',
    floorType: 'terracotta',
    floor: '#D9B08D',
    accent: '#F0A575',
    tint: '#FFE6D6',
    swatches: ['#FFF2E8', '#FFD5B8', '#F0A575', '#E8D2BC', '#B98C6B'],
  },
  {
    id: 'cream',
    name: 'Cloud Cream',
    tagline: 'Buttermilk tones, boucle and soft diffused light.',
    wall: '#FBF6EE',
    floorType: 'washed',
    floor: '#E2D3BF',
    accent: '#C9A88A',
    tint: '#F6EBDD',
    swatches: ['#FBF6EE', '#F1E4D3', '#D8C1A6', '#C9A88A', '#8E7A66'],
  },
  {
    id: 'sage',
    name: 'Sage Studio',
    tagline: 'Herbaceous green paired with walnut and clay.',
    wall: '#F1F5ED',
    floorType: 'walnut',
    floor: '#B98D6A',
    accent: '#8FA98B',
    tint: '#E4EEDF',
    swatches: ['#F1F5ED', '#D4E2CD', '#8FA98B', '#D9BE9F', '#8A6B52'],
  },
]

export function getTheme(id: string): ThemeToken {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export type FloorToken = { id: string; name: string; color: string }

export const FLOORS: FloorToken[] = [
  { id: 'oak', name: 'Pale oak', color: '#E3C3A1' },
  { id: 'walnut', name: 'Walnut', color: '#B98D6A' },
  { id: 'washed', name: 'Washed ash', color: '#E7D8C4' },
  { id: 'terracotta', name: 'Terracotta tile', color: '#D9A98D' },
  { id: 'terrazzo', name: 'Terrazzo', color: '#EDE6DE' },
  { id: 'carpet', name: 'Wool carpet', color: '#E7DCD0' },
]

export type CategoryToken = { id: string; label: string; plural: string; tint: string }

export const CATEGORIES: CategoryToken[] = [
  { id: 'sofa', label: 'Sofa', plural: 'Sofas', tint: '#FFE1EA' },
  { id: 'chair', label: 'Chair', plural: 'Chairs', tint: '#E9E1FB' },
  { id: 'table', label: 'Table', plural: 'Tables', tint: '#FFE8D6' },
  { id: 'bed', label: 'Bed', plural: 'Beds', tint: '#E2F2E8' },
  { id: 'wardrobe', label: 'Storage', plural: 'Storage', tint: '#F6E6D6' },
  { id: 'lamp', label: 'Lighting', plural: 'Lighting', tint: '#FFF3CC' },
  { id: 'rug', label: 'Rug', plural: 'Rugs', tint: '#FCE4DC' },
  { id: 'plant', label: 'Plant', plural: 'Plants', tint: '#DEF0DC' },
  { id: 'decor', label: 'Decor', plural: 'Decor', tint: '#F1E5F7' },
  { id: 'kitchen', label: 'Kitchen', plural: 'Kitchen', tint: '#E3EEF7' },
  { id: 'desk', label: 'Desk', plural: 'Desks', tint: '#E8E7F5' },
]

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export const STYLES = [
  { id: 'scandinavian', label: 'Scandinavian' },
  { id: 'japandi', label: 'Japandi' },
  { id: 'mid-century', label: 'Mid-century' },
  { id: 'boho', label: 'Boho' },
  { id: 'modern', label: 'Modern' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'eclectic', label: 'Eclectic' },
]

export function styleLabel(id: string): string {
  return STYLES.find((s) => s.id === id)?.label ?? id
}

export type RoomTypeToken = {
  id: string
  label: string
  width: number
  length: number
  theme: string
}

export const ROOM_TYPES: RoomTypeToken[] = [
  { id: 'living', label: 'Living room', width: 460, length: 560, theme: 'blush' },
  { id: 'bedroom', label: 'Bedroom', width: 380, length: 440, theme: 'lavender' },
  { id: 'kitchen', label: 'Kitchen', width: 380, length: 440, theme: 'mint' },
  { id: 'dining', label: 'Dining room', width: 360, length: 400, theme: 'peach' },
  { id: 'study', label: 'Study', width: 300, length: 340, theme: 'sage' },
  { id: 'nursery', label: 'Nursery', width: 340, length: 380, theme: 'cream' },
  { id: 'studio', label: 'Studio', width: 320, length: 360, theme: 'lavender' },
]

export function roomTypeLabel(id: string): string {
  return ROOM_TYPES.find((r) => r.id === id)?.label ?? 'Room'
}

export const COLORS = [
  { name: 'Blush', hex: '#F6C9D6' },
  { name: 'Rose', hex: '#E489A6' },
  { name: 'Lavender', hex: '#C6B4EC' },
  { name: 'Mint', hex: '#B7E3CC' },
  { name: 'Sage', hex: '#A9BFA8' },
  { name: 'Cream', hex: '#F1E7D8' },
  { name: 'Peach', hex: '#F7C6A7' },
  { name: 'Terracotta', hex: '#C97C5D' },
  { name: 'Mustard', hex: '#D9A63C' },
  { name: 'Walnut', hex: '#8B6547' },
  { name: 'Ink', hex: '#3A3240' },
  { name: 'Cloud', hex: '#F7F3ED' },
]

export const WALL_COLORS = [
  '#FFF0F4',
  '#F4EFFF',
  '#EDF9F2',
  '#FFF2E8',
  '#FBF6EE',
  '#F1F5ED',
  '#F7EDE4',
  '#E9EFEF',
  '#E8E1F1',
  '#2F2A3A',
]

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function prettyDate(input: string): string {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function huePalette(hue: number): { bg: string; fg: string } {
  return {
    bg: `hsl(${hue} 72% 92%)`,
    fg: `hsl(${hue} 45% 38%)`,
  }
}
